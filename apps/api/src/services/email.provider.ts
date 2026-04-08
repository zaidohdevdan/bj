import { Resend } from 'resend';
import { INotificationProvider } from './notification.service';

export class EmailNotificationProvider implements INotificationProvider {
  private resend: Resend;
  private fromAddress: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('[Email] RESEND_API_KEY não configurada no .env');

    this.resend = new Resend(apiKey);
    this.fromAddress = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  }

  async sendSMS(to: string, message: string, _expiresAt?: Date): Promise<void> {
    // Este método não será chamado diretamente — o EmailNotificationProvider
    // usa sendEmail() para emails ricos. Mantido por compatibilidade de interface.
    await this.sendEmail(to, message, _expiresAt);
  }

  async sendEmail(to: string, link: string, expiresAt?: Date): Promise<void> {
    const expiry = expiresAt
      ? expiresAt.toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

    const expiryLine = expiry
      ? `<p style="margin:0 0 8px;color:#94a3b8;font-size:13px;">⏳ Válido até <strong style="color:#e2e8f0;">${expiry}</strong></p>`
      : '';

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Documento compartilhado</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);padding:32px 40px;border-bottom:1px solid #334155;">
              <p style="margin:0;font-size:11px;letter-spacing:3px;color:#475569;text-transform:uppercase;">Acesso Seguro</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:600;color:#f1f5f9;letter-spacing:-0.3px;">
                Um documento foi compartilhado com você
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;line-height:1.6;">
                Alguém de confiança disponibilizou um arquivo para revisão. 
                O acesso é protegido e requer autenticação.
              </p>
              ${expiryLine}
              <p style="margin:0 0 28px;color:#64748b;font-size:13px;line-height:1.5;">
                O conteúdo estará disponível apenas durante o período indicado acima. 
                Após este prazo, o acesso será automaticamente revogado.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;padding:1px;">
                    <a href="${link}"
                       style="display:block;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:9px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
                      Acessar documento →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:20px 0 0;color:#475569;font-size:12px;word-break:break-all;">
                Se o botão não funcionar, copie e cole no navegador:<br/>
                <span style="color:#6366f1;">${link}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1e293b;background:#0f172a;">
              <p style="margin:0;color:#334155;font-size:11px;line-height:1.6;">
                Esta mensagem foi gerada automaticamente. Não é necessário responder.<br/>
                Se você não esperava este acesso, ignore este e-mail com segurança.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const { error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject: 'Documento compartilhado com você',
      html,
    });

    if (error) {
      // Em modo de teste a Resend só permite enviar para o e-mail do próprio
      // dono da conta. Detectamos esse caso e exibimos o link no console
      // para não bloquear o fluxo de desenvolvimento.
      const isDomainError =
        (error as any).name === 'validation_error' &&
        typeof (error as any).message === 'string' &&
        (error as any).message.includes('verify a domain');

      if (isDomainError) {
        console.warn(
          '[Email] ⚠️  Domínio não verificado no Resend (modo de teste).\n' +
          `[Email] 🔗 Link de acesso para ${to}:\n   ${link}`,
        );
        return; // não lança erro — o room é criado normalmente
      }

      console.error('[Email] Falha ao enviar via Resend:', error);
      throw new Error('Falha ao despachar o convite via e-mail.');
    }

    console.log(`[Email] Convite enviado com sucesso para: ${to}`);
  }
}
