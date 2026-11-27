import {
  applyDateMask,
  formatCurrencyBRL,
  formatDateBR,
  getInitials,
  parseDecimalInput,
  roundCurrency,
} from '../utils/formatters';

describe('formatters - Utilitários de Formatação e Precisão Monetária', () => {
  describe('roundCurrency', () => {
    it('deve evitar imprecisão de ponto flutuante (ex: 0.1 + 0.2)', () => {
      expect(roundCurrency(0.1 + 0.2)).toBe(0.3);
      expect(roundCurrency(19.99 * 3)).toBe(59.97);
    });

    it('deve retornar 0 para valores não finitos (NaN ou Infinity)', () => {
      expect(roundCurrency(NaN)).toBe(0);
      expect(roundCurrency(Infinity)).toBe(0);
    });
  });

  describe('parseDecimalInput', () => {
    it('deve interpretar corretamente valores no formato brasileiro com vírgula', () => {
      expect(parseDecimalInput('120,50')).toBe(120.5);
      expect(parseDecimalInput('1.250,75')).toBe(1250.75);
    });

    it('deve interpretar corretamente valores com ponto decimal', () => {
      expect(parseDecimalInput('350.00')).toBe(350);
      expect(parseDecimalInput('89.9')).toBe(89.9);
    });

    it('deve retornar 0 para strings vazias ou inválidas', () => {
      expect(parseDecimalInput('')).toBe(0);
      expect(parseDecimalInput('   ')).toBe(0);
      expect(parseDecimalInput('abc')).toBe(0);
    });
  });

  describe('formatCurrencyBRL', () => {
    it('deve formatar valores numéricos no padrão monetário brasileiro (R$)', () => {
      // Normaliza espaços não quebráveis (NBSP) gerados pelo Intl do Node
      const formatted = formatCurrencyBRL(770).replace(/\u00A0/g, ' ');
      expect(formatted).toBe('R$ 770,00');
    });
  });

  describe('formatDateBR e applyDateMask', () => {
    it('deve converter data ISO YYYY-MM-DD para DD/MM/AAAA', () => {
      expect(formatDateBR('2026-11-27')).toBe('27/11/2026');
      expect(formatDateBR('2026-05-12 14:30:00')).toBe('12/05/2026');
    });

    it('deve preservar data que já está em DD/MM/AAAA', () => {
      expect(formatDateBR('12/05/2024')).toBe('12/05/2024');
    });

    it('deve aplicar máscara DD/MM/AAAA enquanto o usuário digita', () => {
      expect(applyDateMask('12')).toBe('12');
      expect(applyDateMask('1205')).toBe('12/05');
      expect(applyDateMask('12052026')).toBe('12/05/2026');
      expect(applyDateMask('12052026999')).toBe('12/05/2026');
    });
  });

  describe('getInitials', () => {
    it('deve extrair primeira e última inicial para nomes compostos', () => {
      expect(getInitials('Maria Clara')).toBe('MC');
      expect(getInitials('Ana Beatriz Souza')).toBe('AS');
    });

    it('deve extrair as duas primeiras letras para nome simples', () => {
      expect(getInitials('Fátima')).toBe('FÁ');
    });

    it('deve retornar "?" quando o nome estiver vazio', () => {
      expect(getInitials('   ')).toBe('?');
    });
  });
});