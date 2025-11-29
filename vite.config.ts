import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 加载环境变量，允许读取系统级变量（如 Vercel 中的配置）
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // 在构建时将 process.env.API_KEY 替换为实际的字符串值
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // 定义 process.env 空对象，防止代码中访问 process.env 报错
      'process.env': {}
    }
  };
});