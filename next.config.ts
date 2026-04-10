import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['bcryptjs'],
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.ngrok-free.app',
        '*.ngrok.app',
        '*.loca.lt',
        '*.trycloudflare.com'
      ]
    }
  }
};

export default nextConfig;
