import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The frontend always runs on port 5173 so the test URL never changes.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true, host: true },
  preview: { port: 5173, strictPort: true },
});
