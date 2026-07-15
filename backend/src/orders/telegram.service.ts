import { Injectable, Logger } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';

export type OrderNotificationItem = {
  artworkTitle: string;
  optionName:   string;
  optionPrice:  { toString(): string } | number | string;
  quantity:     number;
};

export type OrderNotificationPayload = {
  id:           string;
  customerName: string;
  contactInfo:  string;
  total:        { toString(): string } | number | string;
  items:        OrderNotificationItem[];
};

@Injectable()
export class TelegramService {
  private readonly logger = new Logger( TelegramService.name );
  private readonly bot:    TelegramBot | null;
  private readonly chatId: string | null;

  constructor() {
    const token  = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    this.chatId = chatId || null;
    this.bot    = token ? new TelegramBot( token, { polling: false } ) : null;
  }

  async sendOrderNotification( order: OrderNotificationPayload ): Promise<void> {
    if ( !this.bot || !this.chatId ) {
      this.logger.warn(
        'Telegram is not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID); skipping notification',
      );
      return;
    }

    await this.bot.sendMessage( this.chatId, this.formatMessage( order ) );
  }

  formatMessage( order: OrderNotificationPayload ): string {
    const lines = order.items.map( ( item, index ) => {
      const price = this.formatMoney( item.optionPrice );
      return `${ index + 1 }. ${ item.artworkTitle } — ${ item.optionName } × ${ item.quantity } — ${ price }`;
    } );

    return [
      `Нове замовлення #${ order.id }`,
      '',
      `Клієнт: ${ order.customerName }`,
      `Контакт: ${ order.contactInfo }`,
      '',
      'Товари:',
      ...( lines.length > 0 ? lines : [ '(немає позицій)' ] ),
      '',
      `Разом: ${ this.formatMoney( order.total ) }`,
    ].join( '\n' );
  }

  private formatMoney( value: { toString(): string } | number | string ): string {
    const n = Number( value );

    return Number.isFinite( n ) ? n.toFixed( 2 ) : String( value );
  }
}
