module.exports = {
  apps: [
    {
      name: "media-sharing-platform",
      script: "src/server.ts",
      interpreter: "./node_modules/.bin/ts-node",
      watch: true,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
