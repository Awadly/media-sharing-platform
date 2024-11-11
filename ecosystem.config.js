module.exports = {
  apps: [
    {
      name: "media-sharing-platform",
      script: "src/server.ts",
      interpreter: "ts-node",
      watch: true,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
