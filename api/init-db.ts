import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. 获取连接字符串
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  if (!connectionString) {
    return res.status(500).json({ error: '环境变量缺失: 未找到 POSTGRES_URL' });
  }

  // 2. 创建客户端
  const client = createClient({ connectionString });

  try {
    // 3. 连接数据库
    await client.connect();

    // 4. 执行建表 SQL
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

    // 5. 成功返回
    return res.status(200).json({ 
      success: true, 
      message: '数据库初始化成功 (Standalone Mode)' 
    });

  } catch (error) {
    console.error('初始化错误:', error);
    return res.status(500).json({ 
      error: '初始化失败', 
      details: String(error) 
    });
  } finally {
    // 6. 必须关闭连接
    await client.end();
  }
}