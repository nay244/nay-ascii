import type { NextConfig } from "next";
import { BASE_PATH } from "./src/lib/base.ts";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: BASE_PATH,
};

export default nextConfig;
