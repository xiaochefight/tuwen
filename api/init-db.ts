import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. 先做一个最简单的查询测试，看看通不通
    // 如果这里报错，说明彻底连不上
    await sql`SELECT 1`;

    // 2. 执行建表 (access_keys)
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
      )
    `;

    // 3. 执行建表 (usage_logs)
    await sql`
      CREATE TABLE IF NOT EXISTS usage_logs (
        id SERIAL PRIMARY KEY,
        key_id INTEGER REFERENCES access_keys(id),
        request_text TEXT,
        success BOOLEAN,
        error_msg TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 4. 全部成功
    return res.status(200).json({ 
      success: true, 
      message: '数据库初始化成功 (SQL Mode)' 
    });

  } catch (error: any) {
    console.error('Database Error:', error);
    return res.status(500).json({ 
      error: '数据库操作失败', 
      message: error.message,
      detail: JSON.stringify(error) 
    });
  }
}