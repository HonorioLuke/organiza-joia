import { ItemCompraDraft, TipoJoia } from '../models/types';
import { roundCurrency } from './formatters';

const TIPOS_VALIDOS: TipoJoia[] = ['Brinco', 'Pulseira', 'Anel', 'Outro'];

export interface DateValidationResult {
  valid: boolean;
  isoDate?: string;
  error?: string;
}

/**
 * Valida uma data no padrão brasileiro DD/MM/AAAA, verificando existência real
 * no calendário (incluindo anos bissextos) e converte para YYYY-MM-DD.
 */
export function parseAndValidateDateBR(dateStr: string): DateValidationResult {
  const trimmed = dateStr.trim();

  if (!trimmed) {
    return { valid: false, error: 'Informe a data da compra.' };
  }

  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return {
      valid: false,
      error: 'Informe uma data válida no formato DD/MM/AAAA.',
    };
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (year < 2000 || year > 2100) {
    return {
      valid: false,
      error: 'O ano da compra deve estar entre 2000 e 2100.',
    };
  }

  if (month < 1 || month > 12) {
    return { valid: false, error: 'Mês inválido na data da compra.' };
  }

  const candidate = new Date(year, month - 1, day);
  const isRealDate =
    candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day;

  if (!isRealDate) {
    return {
      valid: false,
      error: 'A data informada não existe no calendário.',
    };
  }

  const isoDate = `${String(year).padStart(4, '0')}-${String(month).padStart(
    2,
    '0'
  )}-${String(day).padStart(2, '0')}`;

  return { valid: true, isoDate };
}

/**
 * Converte texto de valor unitário para número >= 0 ou retorna null se inválido/vazio.
 */
export function parseStrictCurrency(raw: string): number | null {
  if (!raw || !raw.trim()) return null;

  let clean = raw.trim().replace(/\s/g, '');

  // Rejeita múltiplos separadores decimais inválidos (ex.: "12,,50" ou "12,5,0")
  const commaCount = (clean.match(/,/g) || []).length;
  if (commaCount > 1) return null;

  if (clean.includes(',') && clean.includes('.')) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.');
  }

  if (!/^\d+(\.\d+)?$/.test(clean)) {
    return null;
  }

  const parsed = Number(clean);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return roundCurrency(parsed);
}

export interface ValidatedItemInput {
  tipo_joia: TipoJoia;
  tipo_personalizado: string | null;
  detalhamento: string | null;
  quantidade: number;
  valor_unitario: number;
}

export function validateCompraDraft(params: {
  clienteId: number | null;
  dataCompraBR: string;
  itens: ItemCompraDraft[];
}): { isoDate: string; itensValidados: ValidatedItemInput[] } {
  if (!params.clienteId || params.clienteId <= 0) {
    throw new Error('Selecione um cliente para registrar a compra.');
  }

  const dateCheck = parseAndValidateDateBR(params.dataCompraBR);
  if (!dateCheck.valid || !dateCheck.isoDate) {
    throw new Error(dateCheck.error || 'Data da compra inválida.');
  }

  if (!params.itens || params.itens.length === 0) {
    throw new Error('Adicione pelo menos uma joia à compra.');
  }

  const itensValidados: ValidatedItemInput[] = params.itens.map(
    (item, index) => {
      const numeroItem = index + 1;

      if (!item.tipo_joia || !TIPOS_VALIDOS.includes(item.tipo_joia)) {
        throw new Error(`Selecione o tipo de joia no item ${numeroItem}.`);
      }

      let tipoPersonalizado: string | null = null;
      if (item.tipo_joia === 'Outro') {
        const customClean = item.tipo_personalizado.trim();
        if (!customClean) {
          throw new Error(
            `Informe o tipo de joia personalizado no item ${numeroItem}.`
          );
        }
        tipoPersonalizado = customClean;
      }

      const qtdTrimmed = item.quantidade.trim();
      if (!qtdTrimmed || !/^\d+$/.test(qtdTrimmed)) {
        throw new Error(
          `Informe uma quantidade válida no item ${numeroItem}.`
        );
      }

      const quantidade = Number(qtdTrimmed);
      if (!Number.isInteger(quantidade) || quantidade <= 0) {
        throw new Error(
          `A quantidade do item ${numeroItem} deve ser maior que zero.`
        );
      }

      const valorUnitario = parseStrictCurrency(item.valor_unitario);
      if (valorUnitario === null || valorUnitario < 0) {
        throw new Error(
          `Informe um valor unitário válido (não negativo) no item ${numeroItem}.`
        );
      }

      const detalhamentoLimpo = item.detalhamento.trim()
        ? item.detalhamento.trim()
        : null;

      return {
        tipo_joia: item.tipo_joia,
        tipo_personalizado: tipoPersonalizado,
        detalhamento: detalhamentoLimpo,
        quantidade,
        valor_unitario: valorUnitario,
      };
    }
  );

  return {
    isoDate: dateCheck.isoDate,
    itensValidados,
  };
}