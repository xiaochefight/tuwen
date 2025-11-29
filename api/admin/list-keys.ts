import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { getAllKeys } from '../_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const adminPwd = req.headers['x-admin-password'];
  if (adminPwd !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const keys = await getAllKeys();
    return res.status(200).json(keys);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}