import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { initDatabase } from './_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await initDatabase();
    return res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}