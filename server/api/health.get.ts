import pkg from "../../package.json";

export default defineEventHandler(() => ({
  status: "healthy",
  timestamp: new Date().toISOString(),
  version: pkg.version,
  environment: process.env.NODE_ENV || "development",
}));
