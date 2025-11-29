import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createAccessKey } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminPwd = req.headers['x-admin-password'];
  if (adminPwd !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name, maxUses, expiresInDays } = req.body;

  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const newKey = await createAccessKey(name, Number(maxUses) || 100, Number(expiresInDays) || 30);
    return res.status(200).json(newKey);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}