export interface INotificationProvider {
  sendSMS(to: string, message: string, expiresAt?: Date): Promise<void>;
}

export class ConsoleNotificationProvider implements INotificationProvider {
  async sendSMS(to: string, message: string, expiresAt?: Date): Promise<void> {
    const divider = '━'.repeat(50);
    const expiry = expiresAt ? expiresAt.toLocaleString('pt-BR') : 'sem prazo';
    console.log('\n' + divider);
    console.log('📧 [MOCK NOTIFICATION]');
    console.log(`Para: ${to}`);
    console.log(`Link: ${message}`);
    console.log(`Expira em: ${expiry}`);
    console.log(divider + '\n');
  }
}

export class NotificationService {
  constructor(private provider: INotificationProvider) {}

  async sendRoomAccessLink(email: string, roomId: string, expiresAt: Date) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const link = `${baseUrl}/room/${roomId}`;

    await this.provider.sendSMS(email, link, expiresAt);
  }
}
