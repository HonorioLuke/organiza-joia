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

  // Já está no padrão DD/MM/AAAA
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  // Padrão ISO YYYY-MM-DD (com ou sem horário)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }

  return trimmed;
}

export function formatCurrencyBRL(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}