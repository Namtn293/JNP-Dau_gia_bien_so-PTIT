import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }: { mode: string }) => {
  // Load environment variables from process.env and .env files
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    build: {
      lib: {
        entry: path.resolve(
          __dirname,
          "src/shared/components/ChatWidget/index.tsx",
        ),
        name: "AiChatWidget",
        fileName: (format) => `ai-widget.js`, // Luôn xuất ra 1 tên cố định
        formats: ["iife"], // Định dạng tự thực thi trên trình duyệt
      },
      rollupOptions: {
        // Đảm bảo các dependency quan trọng được đóng gói cùng luôn (standalone)
        output: {
          extend: true,
        },
      },
      outDir: "dist/widget", // Thư mục xuất riêng cho widget
      emptyOutDir: true,
      cssCodeSplit: false, // Gom CSS vào JS luôn nếu có thể
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@shared": path.resolve(__dirname, "src/shared"),
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
      // Lấy từ biến môi trường của hệ thống hoặc file .env, fallback về http://localhost:8085/api
      "import.meta.env.VITE_API_AI_URL": JSON.stringify(
        env.VITE_API_AI_URL || "http://localhost:8085/api",
      ),
    },
  };
});
