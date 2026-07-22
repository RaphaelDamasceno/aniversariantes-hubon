import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || '"Painel de Aniversariantes" <no-reply@empresa.com>';

  if (!host || !user || !pass) {
    console.warn('Faltam credenciais SMTP no arquivo .env. O e-mail não será enviado.');
    return false;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      console.log('E-mail enviado:', info.messageId);
      return true;
    } catch (error) {
      attempt++;
      console.error(`Erro ao enviar e-mail (tentativa ${attempt}/${MAX_RETRIES}):`, error);
      
      if (attempt >= MAX_RETRIES) {
        console.error('Falha definitiva ao enviar o e-mail após várias tentativas. Recomenda-se notificar o administrador.');
        return false;
      }
      
      // Aguarda 2 segundos antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
}
