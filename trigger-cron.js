const fs = require('fs');
const http = require('http');
const path = require('path');

// Uso: node trigger-cron.js <dia|semana|mes|auto>
let argType = process.argv[2] || 'dia';

let typesToRun = [];
if (argType === 'auto') {
  const now = new Date();
  if (now.getDate() === 1) {
    typesToRun.push('mes');
  }
  if (now.getDay() === 1) { // Segunda-feira
    typesToRun.push('semana');
  }
  if (typesToRun.length === 0) {
    typesToRun.push('dia'); // Default se não for nem dia 1 nem segunda
  }
} else {
  typesToRun.push(argType);
}

// Tenta ler o .env.production ou .env.local para pegar o CRON_SECRET
let cronSecret = '';
const envPaths = ['./painel-web/.env.production', './painel-web/.env.local', './.env'];

for (const envPath of envPaths) {
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^CRON_SECRET=(.*)$/m);
      if (match) {
        cronSecret = match[1].trim();
        break;
      }
    }
  } catch (e) {
    // ignora e tenta o proximo
  }
}

if (!cronSecret) {
  console.warn('AVISO: CRON_SECRET não encontrado nos arquivos .env. A requisição pode falhar se estiver protegida.');
}

typesToRun.forEach(type => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/aniversariantes/api/cron/email/${type}`,
    method: 'GET',
    headers: {}
  };

  if (cronSecret) {
    options.headers['Authorization'] = `Bearer ${cronSecret}`;
  }

  const req = http.request(options, res => {
    console.log(`[${new Date().toISOString()}] CRON Trigger (${type}) - Status: ${res.statusCode}`);
    res.on('data', d => process.stdout.write(d));
    res.on('end', () => console.log('\n---'));
  });

  req.on('error', error => {
    console.error(`[${new Date().toISOString()}] Erro ao disparar cron (${type}):`, error.message);
  });

  req.end();
});
