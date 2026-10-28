import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // The project lives in laptop-store while .env.example is at the repository root.
  envDir: '..',
  plugins: [react()],
})
