import { normalizeBcp47Case } from '@/utils/lang.util';

describe('normalizeBcp47Case', () => {
  it('normalizes basic language subtags', () => {
    expect(normalizeBcp47Case('en')).toBe('en');
    expect(normalizeBcp47Case('EN')).toBe('en');
    expect(normalizeBcp47Case('zh')).toBe('zh');
    expect(normalizeBcp47Case('ZH')).toBe('zh');
  });

  it('normalizes region casing', () => {
    expect(normalizeBcp47Case('en-us')).toBe('en-US');
    expect(normalizeBcp47Case('EN-us')).toBe('en-US');
    expect(normalizeBcp47Case('en-GB')).toBe('en-GB');
    expect(normalizeBcp47Case('pt-br')).toBe('pt-BR');
    expect(normalizeBcp47Case('ZH-tw')).toBe('zh-TW');
    expect(normalizeBcp47Case('es-419')).toBe('es-419');
  });

  it('normalizes script casing', () => {
    expect(normalizeBcp47Case('sr-cyrl-rs')).toBe('sr-Cyrl-RS');
    expect(normalizeBcp47Case('zh-hans-cn')).toBe('zh-Hans-CN');
  });

  it('keeps variants/extensions in lower-case by default', () => {
    expect(normalizeBcp47Case('sl-rozaj-biske')).toBe('sl-rozaj-biske');
    expect(normalizeBcp47Case('en-a-xxx')).toBe('en-a-xxx');
    expect(normalizeBcp47Case('x-private')).toBe('x-private');
  });

  it('handles unknown/unsupported shapes gracefully', () => {
    expect(normalizeBcp47Case('xx-YY-zzz')).toBe('xx-YY-zzz');
    expect(normalizeBcp47Case('')).toBe('');
  });
});
