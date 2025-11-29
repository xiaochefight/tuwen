import { createClient } from '@vercel/postgres';

// 通用查询助手函数（自动处理连接和断开）
async function query(text: string, params?: any[]) {
  const client = createClient();
  await client.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    await client.end();
  }
}

// 1. 初始化数据库表
export async function initDatabase() {
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
  
  await query(createTableQuery);
  return { success: true };
}

// 2. 验证密钥并检查额度
export async function verifyAccessKey(keyCode: string) {
  const result = await query(
    `SELECT * FROM access_keys WHERE key_code = $1 AND is_active = true`,
    [keyCode]
  );
  
  const key = result.rows[0];

  if (!key) {
    throw new Error('无效的访问密钥');
  }

  // 检查过期时间
  if (key.expires_at && new Date(key.expires_at) < new Date()) {
    throw new Error('密钥已过期');
  }

  // 检查使用次数 (-1 表示无限)
  if (key.max_uses !== -1 && key.used_count >= key.max_uses) {
    throw new Error('密钥使用次数已耗尽');
  }

  return key;
}

// 3. 更新使用次数
export async function updateAccessKeyUsage(keyId: number) {
  await query(
    `UPDATE access_keys SET used_count = used_count + 1 WHERE id = $1`,
    [keyId]
  );
}

// 4. 记录日志
export async function logUsage(keyId: number, requestText: string, success: boolean, errorMsg?: string) {
  await query(
    `INSERT INTO usage_logs (key_id, request_text, success, error_msg) VALUES ($1, $2, $3, $4)`,
    [keyId, requestText, success, errorMsg || '']
  );
}

// 5. 生成新密钥 (管理后台用)
export async function createAccessKey(name: string, maxUses: number = -1, daysValid?: number) {
  // 生成随机密钥
  const generateKey = () => {
    return 'sk-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };
  
  const keyCode = generateKey();
  let expiresAt = null;
  
  if (daysValid) {
    const date = new Date();
    date.setDate(date.getDate() + daysValid);
    expiresAt = date.toISOString();
  }

  const result = await query(
    `INSERT INTO access_keys (key_code, name, max_uses, expires_at) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [keyCode, name, maxUses, expiresAt]
  );

  return result.rows[0];
}

// 6. 获取所有密钥 (管理后台用)
export async function getAllKeys() {
  const result = await query(
    `SELECT * FROM access_keys ORDER BY created_at DESC`
  );
  return result.rows;
}

// 7. 获取日志 (管理后台用)
export async function getKeyLogs(keyId: string) {
  const result = await query(
    `SELECT * FROM usage_logs WHERE key_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [keyId]
  );
  return result.rows;
}