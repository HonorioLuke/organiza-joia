export function roundCurrency(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getInitials(nome: string): string {
  const parts = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1][0] ?? '';
  return `${first}${last}`.toUpperCase();
}

/**
 * Converte datas ISO (YYYY-MM-DD ou YYYY-MM-DD HH:MM:SS) para DD/MM/AAAA.
 * Caso já esteja em DD/MM/AAAA, retorna preservando o formato.
 */
export function formatDateBR(dateValue: string | null | undefined): string {
  if (!dateValue) return '';

  const trimmed = dateValue.trim();

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }

  return trimmed;
}

export function getTodayBR(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

export function applyDateMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function formatCurrencyBRL(value: number): string {
  const safeValue = roundCurrency(value);
  return safeValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Interpreta entradas numéricas em padrão brasileiro (ex.: "1.250,50" ou "120,50")
 * e também padrão decimal com ponto (ex.: "120.50").
 */
export function parseDecimalInput(raw: string): number {
  if (!raw || !raw.trim()) return 0;

  let clean = raw.trim().replace(/\s/g, '');

  if (clean.includes(',') && clean.includes('.')) {
    // Ex.: 1.250,50 -> remove separador de milhar e troca vírgula por ponto
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else if (clean.includes(',')) {
    // Ex.: 120,50 -> troca vírgula por ponto
    clean = clean.replace(',', '.');
  }

  const parsed = Number(clean);
  return Number.isFinite(parsed) ? roundCurrency(parsed) : 0;
}