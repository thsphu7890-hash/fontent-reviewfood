import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Tăng giới hạn cảnh báo lên 2000kb (vì file của bạn đang ~1500kb)
    chunkSizeWarningLimit: 2000, 
    
    rollupOptions: {
      output: {
        // Cấu hình chia nhỏ file: gom các thư viện (node_modules) vào file riêng
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
})