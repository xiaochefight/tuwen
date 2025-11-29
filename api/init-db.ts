import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. 创建表
    await sql`
      CREATE TABLE IF NOT EXISTS access_keys (
        id SERIAL PRIMARY KEY,
        key_code VARCHAR(64) UNIQUE NOT NULL,
        name VARCHAR(100),
        max_uses INTEGER DEFAULT -1,
        used_count INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS usage_logs (
        id SERIAL PRIMARY KEY,
        key_id INTEGER REFERENCES access_keys(id),
        request_text TEXT,
        success BOOLEAN,
        error_msg TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return res.status(200).json({ success: true, message: '数据库初始化成功 (Neon Mode)' });

  } catch (error: any) {
    console.error('DB Error:', error);
    return res.status(500).json({ error: error.message });
  }
}