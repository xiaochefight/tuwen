import { CardContent } from "../types";

export const generateCardContent = async (inputText: string, accessKey?: string): Promise<CardContent> => {
  const key = accessKey || '';
  
  if (!key) {
    throw new Error("请输入访问密钥 (Access Key)。");
  }

  try {
    const response = await fetch('/api/generate-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({ inputText })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `请求失败: ${response.statusText}`);
    }
    
    return data as CardContent;
  } catch (error: any) {
    console.error("Generation Error:", error);
    throw new Error(error.message || "生成内容时发生未知错误");
  }
};