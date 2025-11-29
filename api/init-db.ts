import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. 检查环境变量
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    return res.status(500).json({ 
      error: '配置错误', 
      details: '未找到 POSTGRES_URL 环境变量' 
    });
  }

  const client = createClient({ connectionString });

  try {
    // 2. 尝试连接
    await client.connect();

    // 3. 执行建表
    const createTableQuery = `
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

      CREATE TABLE IF NOT EXISTS usage_logs (
        id SERIAL PRIMARY KEY,
        key_id INTEGER REFERENCES access_keys(id),
        request_text TEXT,
        success BOOLEAN,
        error_msg TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createTableQuery);

    return res.status(200).json({ success: true, message: '数据库初始化成功' });

  } catch (error: any) {
    console.error('DB Error:', error);
    // 🔍 这里是关键：展开显示具体错误信息
    return res.status(500).json({ 
      status: 'Error',
      message: error.message || '未知错误',
      code: error.code || 'No Code',
      detail: JSON.stringify(error)
    });
  } finally {
    await client.end();
  }
}