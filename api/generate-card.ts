import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { verifyAccessKey, incrementKeyUsage, logUsage } from '../lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const accessKey = authHeader.split(' ')[1];
  const { inputText } = req.body;
  
  // Get IP for logging
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  let keyId = 0;

  try {
    // 1. Verify Key
    const keyData = await verifyAccessKey(accessKey);
    if (!keyData) {
      return res.status(403).json({ error: 'Invalid, expired, or exhausted Access Key' });
    }
    keyId = keyData.id;

    // 2. Setup Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Server misconfiguration: GEMINI_API_KEY missing");
    }

    const ai = new GoogleGenAI({ apiKey });

    // 3. Define Schema
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "极具吸引力的爆款主标题。" },
        summary: { type: Type.STRING, description: "一段精炼的摘要，概括核心价值，约50-80字。" },
        keyPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3-4个简短的核心亮点（每点不超过20字），用于封面展示。",
        },
        sections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "分段小标题，吸引人。" },
              content: { type: Type.STRING, description: "该段落的详细内容，必须丰富详实，字数控制在150-200字左右，确保填满一张手机屏幕的阅读区域，不要只有一两句话。" }
            },
            required: ["title", "content"]
          },
          description: "4-5个详细的内容板块，用于后续的长图或翻页卡片展示。"
        },
        category: { type: Type.STRING, description: "1-2个词的分类标签。" },
        emoji: { type: Type.STRING, description: "最能代表核心主题的单个emoji。" },
        sentimentColor: { type: Type.STRING, description: "颜色HEX代码。" },
        readingTime: { type: Type.STRING, description: "预计阅读时间。" },
        authorOrSource: { type: Type.STRING, description: "作者或来源。" },
      },
      required: ["title", "summary", "keyPoints", "sections", "category", "emoji", "sentimentColor", "readingTime", "authorOrSource"],
    };

    // 4. Call AI
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `你是专业的社交媒体内容专家（小红书/公众号）。
      你的任务是将用户输入的文本转化为一套“图文笔记”内容。
      
      结构要求：
      1. **封面**：需要一个爆款标题，一段简介，和3-4个短亮点。
      2. **详细页（Sections）**：将内容拆解为4-5个逻辑清晰的板块。每个板块必须有非常丰富的内容（150-200字），适合制作成一张信息量充足的图片，严禁内容空洞，如果原文内容不足，请根据主题进行合理的扩充和润色，使其丰满。
      
      请务必使用中文（简体）输出所有内容。
      
      文本输入: "${inputText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const resultData = JSON.parse(text);

    // 5. Update Usage & Log
    await incrementKeyUsage(keyId);
    await logUsage(keyId, ip, inputText || '', true, null);

    // 6. Return Data
    return res.status(200).json(resultData);

  } catch (error: any) {
    console.error("API Error:", error);
    if (keyId > 0) {
      await logUsage(keyId, ip, inputText || '', false, error.message);
    }
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}