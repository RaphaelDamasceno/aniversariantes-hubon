module.exports = {
  apps: [
    {
      name: "aniversariantes-painel",
      cwd: "./painel-web",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "aniversariantes-sync",
      cwd: "./sync-job",
      script: "npx",
      args: "ts-node index.ts",
      cron_restart: "0 1 * * *", // Roda todo dia à 1h da manhã
      autorestart: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
