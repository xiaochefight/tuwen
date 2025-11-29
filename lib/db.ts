import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

export interface AccessKey {
  id: number;
  key_code: string;
  name: string;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: Date;
}

export async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS access_keys (
      id SERIAL PRIMARY KEY,
      key_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      max_uses INTEGER NOT NULL DEFAULT 100,
      used_count INTEGER NOT NULL DEFAULT 0,
      expires_at TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS usage_logs (
      id SERIAL PRIMARY KEY,
      key_id INTEGER REFERENCES access_keys(id),
      user_ip TEXT,
      request_text TEXT,
      success BOOLEAN,
      error_msg TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

export async function verifyAccessKey(keyCode: string): Promise<AccessKey | null> {
  const { rows } = await sql<AccessKey>`
    SELECT * FROM access_keys 
    WHERE key_code = ${keyCode} 
    AND is_active = TRUE
  `;

  if (rows.length === 0) return null;
  const key = rows[0];

  // Check limits
  if (key.max_uses > 0 && key.used_count >= key.max_uses) {
    return null; // Limit reached
  }

  // Check expiration
  if (key.expires_at && new Date(key.expires_at) < new Date()) {
    return null; // Expired
  }

  return key;
}

export async function incrementKeyUsage(keyId: number) {
  await sql`
    UPDATE access_keys 
    SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${keyId}
  `;
}

export async function logUsage(keyId: number, ip: string, textSnippet: string, success: boolean, errorMsg: string | null) {
  const snippet = textSnippet ? textSnippet.substring(0, 100) : ''; 
  await sql`
    INSERT INTO usage_logs (key_id, user_ip, request_text, success, error_msg)
    VALUES (${keyId}, ${ip}, ${snippet}, ${success}, ${errorMsg})
  `;
}

export async function createAccessKey(name: string, maxUses: number, expiresInDays: number) {
  const keyCode = 'ak_' + uuidv4().replace(/-/g, '').substring(0, 16);
  let expiresAt: string | null = null;
  
  if (expiresInDays > 0) {
    const date = new Date();
    date.setDate(date.getDate() + expiresInDays);
    expiresAt = date.toISOString();
  }

  const { rows } = await sql<AccessKey>`
    INSERT INTO access_keys (key_code, name, max_uses, expires_at)
    VALUES (${keyCode}, ${name}, ${maxUses}, ${expiresAt})
    RETURNING *
  `;
  return rows[0];
}

export async function getAllKeys() {
  const { rows } = await sql<AccessKey>`
    SELECT * FROM access_keys ORDER BY created_at DESC
  `;
  return rows;
}

export async function getKeyLogs(keyId: number) {
  const { rows } = await sql`
    SELECT * FROM usage_logs WHERE key_id = ${keyId} ORDER BY created_at DESC LIMIT 50
  `;
  return rows;
}