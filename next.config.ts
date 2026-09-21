import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Acesso ao dev server de outra máquina (IP da LAN) ou via túnel ngrok.
  allowedDevOrigins: ["192.168.15.24", "*.ngrok-free.dev"],
};

export default nextConfig;
