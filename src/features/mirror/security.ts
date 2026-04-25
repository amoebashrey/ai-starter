export const MAX_INPUT_LENGTH = 1000;
export const MIN_INPUT_LENGTH = 2;

export function sanitizeUserInput(raw: string): { ok: true; value: string } | { ok: false; reason: string } {
  if (typeof raw !== 'string') return { ok: false, reason: 'Input must be a string' };
  const trimmed = raw.trim().replace(/[\u0000-\u001F\u007F]/g, '');
  if (trimmed.length < MIN_INPUT_LENGTH) return { ok: false, reason: 'Input too short' };
  if (trimmed.length > MAX_INPUT_LENGTH) return { ok: false, reason: 'Input too long' };
  return { ok: true, value: trimmed };
}

export function isValidStatus(value: unknown): value is 'cracked' | 'shaky' | 'solid' {
  return value === 'cracked' || value === 'shaky' || value === 'solid';
}
