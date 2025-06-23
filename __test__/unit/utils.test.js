import { cn, getTypeVariant } from '../../lib/utils.js';

describe('getTypeVariant', () => {
  test('should return correct badge variant', () => {
    expect(getTypeVariant('email')).toBe('secondary');
    expect(getTypeVariant('sms')).toBe('outline');
    expect(getTypeVariant('other')).toBe('default');
  });
});

describe('cn utility function', () => {
  test('should merge class names correctly', () => {
    const result = cn('text-base', 'font-bold', false && 'hidden');
    expect(result).toBe('text-base font-bold');
  });

  test('should handle conditional classes', () => {
    const condition = true;
    const result = cn('btn', condition && 'btn-primary');
    expect(result).toBe('btn btn-primary');
  });
});
