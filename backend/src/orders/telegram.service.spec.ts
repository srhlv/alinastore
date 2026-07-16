import { Test, TestingModule } from '@nestjs/testing';
import TelegramBot from 'node-telegram-bot-api';
import { TelegramService } from './telegram.service';

jest.mock( 'node-telegram-bot-api', () => {
  return jest.fn().mockImplementation( () => ( {
    sendMessage: jest.fn().mockResolvedValue( {} ),
  } ) );
} );

describe( 'TelegramService (Step 7)', () => {
  const TelegramBotMock = TelegramBot as unknown as jest.Mock;
  let service: TelegramService;
  let sendMessage: jest.Mock;

  beforeEach( async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
    process.env.TELEGRAM_CHAT_ID   = '123456789';
    process.env.ADMIN_APP_URL      = 'https://alinastore.vercel.app';

    const module: TestingModule = await Test.createTestingModule( {
      providers: [ TelegramService ],
    } ).compile();

    service     = module.get( TelegramService );
    sendMessage = TelegramBotMock.mock.results[ TelegramBotMock.mock.results.length - 1 ]
      .value.sendMessage;
  } );

  afterEach( () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    delete process.env.ADMIN_APP_URL;
    jest.clearAllMocks();
  } );

  it( 'formats a readable order notification message', () => {
    const message = service.formatMessage( {
      id:           'ord-1',
      customerName: 'Олена',
      contactInfo:  '@olena',
      total:        1800,
      items:        [
        {
          artworkTitle: 'Картина',
          optionName:   'Оригінал',
          optionPrice:  1500,
          quantity:     1,
        },
        {
          artworkTitle: 'Картина',
          optionName:   'Принт',
          optionPrice:  300,
          quantity:     1,
        },
      ],
    } );

    expect( message ).toBe(
      [
        'Нове замовлення #ord-1',
        '',
        'Клієнт: Олена',
        'Контакт: @olena',
        '',
        'Товари:',
        '1. Картина — Оригінал × 1 — 1500.00',
        '2. Картина — Принт × 1 — 300.00',
        '',
        'Разом: 1800.00',
        '',
        'Адмінка: https://alinastore.vercel.app/admin/orders/ord-1',
      ].join( '\n' ),
    );
  } );

  it( 'sends notification via Telegram bot', async () => {
    const order = {
      id:           'ord-2',
      customerName: 'Ivan',
      contactInfo:  '+380...',
      total:        500,
      items:        [
        {
          artworkTitle: 'Sketch',
          optionName:   'A4',
          optionPrice:  500,
          quantity:     1,
        },
      ],
    };

    await service.sendOrderNotification( order );

    expect( sendMessage ).toHaveBeenCalledWith(
      '123456789',
      service.formatMessage( order ),
    );
  } );

  it( 'skips sending when Telegram env is missing', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;

    const module: TestingModule = await Test.createTestingModule( {
      providers: [ TelegramService ],
    } ).compile();

    const unconfigured = module.get( TelegramService );
    const callCount    = sendMessage.mock.calls.length;

    await expect(
      unconfigured.sendOrderNotification( {
        id:           'ord-3',
        customerName: 'Test',
        contactInfo:  'x',
        total:        0,
        items:        [],
      } ),
    ).resolves.toBeUndefined();

    expect( sendMessage.mock.calls.length ).toBe( callCount );
  } );
} );
