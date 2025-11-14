import { DeepSeekTranslateProvider } from '@/modules/translate/providers/deepseek/deepseek-translate.provider';
import { ServiceUnavailableException } from '@nestjs/common';

let createMock: jest.Mock;

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: createMock,
      },
    },
  }));
});

describe('DeepSeekTranslateProvider (unit)', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    createMock = jest.fn();
    process.env.DEEPSEEK_API_KEY = 'test-key';
    delete process.env.DEEPSEEK_DEFAULT_MODEL; // ensure default kicks in
    delete process.env.DEEPSEEK_API_BASE_URL;
    delete process.env.LLM_SYSTEM_PROMPT;
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('translates text and returns provider label and model', async () => {
    createMock.mockResolvedValue({ choices: [{ message: { content: 'OK' } }] });

    const provider = new DeepSeekTranslateProvider();
    const res = await provider.translate({ text: 'hello', targetLang: 'ru' });

    expect(res.translatedText).toBe('OK');
    expect(res.provider).toBe('deepseek');
    expect(res.model).toBe('deepseek-chat');

    // Ensure model and messages passed
    const call = createMock.mock.calls.at(-1)?.[0];
    expect(call.model).toBe('deepseek-chat');
    expect(Array.isArray(call.messages)).toBe(true);
    expect(call.messages[0].role).toBe('system');
    expect(call.messages[1].role).toBe('user');
  });

  it('passes html hint via system prompt when format is html', async () => {
    createMock.mockResolvedValue({ choices: [{ message: { content: 'OK' } }] });

    const provider = new DeepSeekTranslateProvider();
    await provider.translate({ text: '<b>a</b>', targetLang: 'ru', format: 'html' });

    const call = createMock.mock.calls.at(-1)?.[0];
    expect(call.messages[0].content).toContain('format=html');
  });

  it('uses request model when provided', async () => {
    createMock.mockResolvedValue({ choices: [{ message: { content: 'OK' } }] });

    const provider = new DeepSeekTranslateProvider();
    await provider.translate({ text: 'a', targetLang: 'ru', model: 'custom-model' });

    const call = createMock.mock.calls.at(-1)?.[0];
    expect(call.model).toBe('custom-model');
  });

  it('throws 503 when DEEPSEEK_API_KEY is missing', async () => {
    delete process.env.DEEPSEEK_API_KEY;
    const provider = new DeepSeekTranslateProvider();
    await expect(provider.translate({ text: 'x', targetLang: 'ru' })).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
