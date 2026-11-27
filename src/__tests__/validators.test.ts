import { ItemCompraDraft } from '../models/types';
import {
  parseAndValidateDateBR,
  parseStrictCurrency,
  validateCompraDraft,
} from '../utils/validators';

describe('validators - Regras de Validação de Compra e Datas', () => {
  describe('parseAndValidateDateBR', () => {
    it('deve aceitar datas válidas e converter para ISO YYYY-MM-DD', () => {
      expect(parseAndValidateDateBR('12/05/2026')).toEqual({
        valid: true,
        isoDate: '2026-05-12',
      });
      // Ano bissexto válido
      expect(parseAndValidateDateBR('29/02/2024')).toEqual({
        valid: true,
        isoDate: '2024-02-29',
      });
    });

    it('deve rejeitar datas inexistentes no calendário', () => {
      expect(parseAndValidateDateBR('31/02/2026').valid).toBe(false);
      expect(parseAndValidateDateBR('29/02/2025').valid).toBe(false);
      expect(parseAndValidateDateBR('31/04/2026').valid).toBe(false);
    });

    it('deve rejeitar formatos incompletos ou vazios', () => {
      expect(parseAndValidateDateBR('').valid).toBe(false);
      expect(parseAndValidateDateBR('12/05/26').valid).toBe(false);
    });
  });

  describe('parseStrictCurrency', () => {
    it('deve aceitar valores válidos não negativos (incluindo zero)', () => {
      expect(parseStrictCurrency('0')).toBe(0);
      expect(parseStrictCurrency('0,00')).toBe(0);
      expect(parseStrictCurrency('120,00')).toBe(120);
      expect(parseStrictCurrency('1.350,50')).toBe(1350.5);
    });

    it('deve rejeitar entradas malformadas, negativas ou vazias', () => {
      expect(parseStrictCurrency('')).toBeNull();
      expect(parseStrictCurrency('-50,00')).toBeNull();
      expect(parseStrictCurrency('12,,50')).toBeNull();
      expect(parseStrictCurrency('abc')).toBeNull();
    });
  });

  describe('validateCompraDraft', () => {
    const itemValido: ItemCompraDraft = {
      localId: '1',
      tipo_joia: 'Brinco',
      tipo_personalizado: '',
      detalhamento: 'Dourado, pedra azul',
      quantidade: '2',
      valor_unitario: '120,00',
    };

    it('deve validar com sucesso uma compra completa', () => {
      const result = validateCompraDraft({
        clienteId: 1,
        dataCompraBR: '12/05/2026',
        itens: [itemValido],
      });

      expect(result.isoDate).toBe('2026-05-12');
      expect(result.itensValidados).toHaveLength(1);
      expect(result.itensValidados[0]).toEqual({
        tipo_joia: 'Brinco',
        tipo_personalizado: null,
        detalhamento: 'Dourado, pedra azul',
        quantidade: 2,
        valor_unitario: 120,
      });
    });

    it('deve bloquear salvamento sem cliente selecionado', () => {
      expect(() =>
        validateCompraDraft({
          clienteId: null,
          dataCompraBR: '12/05/2026',
          itens: [itemValido],
        })
      ).toThrow('Selecione um cliente para registrar a compra.');
    });

    it('deve bloquear salvamento sem nenhuma joia adicionada', () => {
      expect(() =>
        validateCompraDraft({
          clienteId: 1,
          dataCompraBR: '12/05/2026',
          itens: [],
        })
      ).toThrow('Adicione pelo menos uma joia à compra.');
    });

    it('deve exigir descrição personalizada quando o tipo for "Outro"', () => {
      const itemOutroSemNome: ItemCompraDraft = {
        ...itemValido,
        tipo_joia: 'Outro',
        tipo_personalizado: '   ',
      };

      expect(() =>
        validateCompraDraft({
          clienteId: 1,
          dataCompraBR: '12/05/2026',
          itens: [itemOutroSemNome],
        })
      ).toThrow('Informe o tipo de joia personalizado no item 1.');
    });

    it('deve aceitar tipo "Outro" quando o tipo personalizado estiver preenchido', () => {
      const itemOutroValido: ItemCompraDraft = {
        ...itemValido,
        tipo_joia: 'Outro',
        tipo_personalizado: 'Colar veneziano',
      };

      const result = validateCompraDraft({
        clienteId: 1,
        dataCompraBR: '12/05/2026',
        itens: [itemOutroValido],
      });

      expect(result.itensValidados[0].tipo_personalizado).toBe('Colar veneziano');
    });

    it('deve rejeitar quantidade zero ou não inteira', () => {
      expect(() =>
        validateCompraDraft({
          clienteId: 1,
          dataCompraBR: '12/05/2026',
          itens: [{ ...itemValido, quantidade: '0' }],
        })
      ).toThrow('A quantidade do item 1 deve ser maior que zero.');
    });
  });
});