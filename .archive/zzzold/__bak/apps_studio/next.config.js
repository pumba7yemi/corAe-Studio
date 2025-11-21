const path = require("path");

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // because we import from ../../src
  outputFileTracingRoot: path.join(__dirname, "../.."),
  webpack: (config) => {
    // Map @ → <repoRoot>/src so "@/components/..." resolves correctly
    config.resolve.alias["@" ] = path.resolve(__dirname, "../../src");
    return config;
  },
};