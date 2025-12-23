import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "langchain",
    "@langchain/core",
    "@langchain/google-genai",
    "@langchain/community",
    "@google/generative-ai"
  ],
};

export default nextConfig;
