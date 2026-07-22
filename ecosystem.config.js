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
    },
    {
      name: "cron-email-dia",
      script: "node trigger-cron.js dia",
      cron_restart: "0 8 * * *", // Todo dia às 08:00
      autorestart: false,
      watch: false
    },
    {
      name: "cron-email-semana",
      script: "node trigger-cron.js semana",
      cron_restart: "0 8 * * 1", // Toda segunda-feira às 08:00
      autorestart: false,
      watch: false
    },
    {
      name: "cron-email-mes",
      script: "node trigger-cron.js mes",
      cron_restart: "0 8 1 * *", // Todo dia 1 do mês às 08:00
      autorestart: false,
      watch: false
    }
  ]
};
