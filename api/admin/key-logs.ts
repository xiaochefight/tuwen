import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { getKeyLogs } from '../_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const adminPwd = req.headers['x-admin-password'];
  if (adminPwd !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { keyId } = req.query;
  if (!keyId) return res.status(400).json({ error: 'keyId is required' });

  try {
    const logs = await getKeyLogs(Number(keyId));
    return res.status(200).json(logs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}