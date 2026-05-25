module.exports = {
  apps: [
    {
      name: "greenlinevn",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3000",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        NEXT_PUBLIC_SITE_URL: "https://greenlinevn.com"
      }
    }
  ]
};
