import { ClienteRepository } from '../database/repositories/ClienteRepository';
import { CompraRepository } from '../database/repositories/CompraRepository';
import { ItemCompraDraft } from '../models/types';
import { CompraService } from '../services/CompraService';

jest.mock('../database/repositories/ClienteRepository', () => ({
  ClienteRepository: {
    findById: jest.fn(),
  },
}));

jest.mock('../database/repositories/CompraRepository', () => ({
  CompraRepository: {
    createWithItems: jest.fn(),
    findActiveByClienteId: jest.fn(),
    getResumoAtivoByClienteId: jest.fn(),
    findByIdWithItems: jest.fn(),
  },
}));

describe('CompraService - Cálculos, Histórico e Detalhes da Compra', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve calcular corretamente subtotais e total para múltiplas joias (cenário da especificação)', async () => {
    (ClienteRepository.findById as jest.Mock).mockResolvedValue({
      id: 10,
      nome: 'Maria Clara',
      contato: null,
      created_at: '2026-05-01',
    });

    (CompraRepository.createWithItems as jest.Mock).mockImplementation(
      async (payload) => ({
        id: 99,
        ...payload,
        created_at: '2026-05-12 14:00:00',
        deleted_at: null,
        expires_at: null,
      })
    );

    const itensExemplo: ItemCompraDraft[] = [
      {
        localId: '1',
        tipo_joia: 'Brinco',
        tipo_personalizado: '',
        detalhamento: 'Dourado, pedra azul',
        quantidade: '2',
        valor_unitario: '120,00',
      },
      {
        localId: '2',
        tipo_joia: 'Anel',
        tipo_personalizado: '',
        detalhamento: 'Aro 18',
        quantidade: '1',
        valor_unitario: '350,00',
      },
      {
        localId: '3',
        tipo_joia: 'Pulseira',
        tipo_personalizado: '',
        detalhamento: 'Com zircônias, 18cm',
        quantidade: '1',
        valor_unitario: '180,00',
      },
    ];

    const compraSalva = await CompraService.registrarCompra({
      clienteId: 10,
      dataCompraBR: '12/05/2024',
      itens: itensExemplo,
    });

    expect(compraSalva.valor_total).toBe(770);
  });

  it('deve impedir o registro se o cliente não existir no banco de dados', async () => {
    (ClienteRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      CompraService.registrarCompra({
        clienteId: 999,
        dataCompraBR: '12/05/2026',
        itens: [
          {
            localId: '1',
            tipo_joia: 'Anel',
            tipo_personalizado: '',
            detalhamento: '',
            quantidade: '1',
            valor_unitario: '200,00',
          },
        ],
      })
    ).rejects.toThrow('O cliente selecionado não foi encontrado no sistema.');

    expect(CompraRepository.createWithItems).not.toHaveBeenCalled();
  });

  it('deve manter precisão decimal em centavos em compras com valores quebrados', async () => {
    (ClienteRepository.findById as jest.Mock).mockResolvedValue({
      id: 5,
      nome: 'Ana Silva',
      contato: null,
      created_at: '2026-05-01',
    });

    (CompraRepository.createWithItems as jest.Mock).mockImplementation(
      async (payload) => ({
        id: 100,
        ...payload,
        created_at: '2026-05-12 15:00:00',
        deleted_at: null,
        expires_at: null,
      })
    );

    const compra = await CompraService.registrarCompra({
      clienteId: 5,
      dataCompraBR: '27/11/2026',
      itens: [
        {
          localId: '1',
          tipo_joia: 'Brinco',
          tipo_personalizado: '',
          detalhamento: '',
          quantidade: '3',
          valor_unitario: '19,99',
        },
        {
          localId: '2',
          tipo_joia: 'Pulseira',
          tipo_personalizado: '',
          detalhamento: '',
          quantidade: '2',
          valor_unitario: '14,95',
        },
      ],
    });

    expect(compra.valor_total).toBe(89.87);
  });

  it('deve retornar histórico ativo, total acumulado e quantidade de compras do cliente', async () => {
    (ClienteRepository.findById as jest.Mock).mockResolvedValue({
      id: 1,
      nome: 'Maria Clara',
      contato: null,
      created_at: '2026-05-01',
    });

    (CompraRepository.getResumoAtivoByClienteId as jest.Mock).mockResolvedValue({
      totalAcumulado: 1330,
      quantidadeCompras: 2,
    });

    (CompraRepository.findActiveByClienteId as jest.Mock).mockResolvedValue([
      {
        id: 2,
        cliente_id: 1,
        data_compra: '2026-05-12',
        valor_total: 770,
        quantidade_itens: 3,
        deleted_at: null,
      },
      {
        id: 1,
        cliente_id: 1,
        data_compra: '2026-05-05',
        valor_total: 560,
        quantidade_itens: 2,
        deleted_at: null,
      },
    ]);

    const historico = await CompraService.obterHistoricoCliente(1);

    expect(historico.cliente.nome).toBe('Maria Clara');
    expect(historico.resumo.totalAcumulado).toBe(1330);
    expect(historico.resumo.quantidadeCompras).toBe(2);
    expect(historico.compras).toHaveLength(2);
  });

  it('deve lançar erro ao buscar detalhes de uma compra inexistente', async () => {
    (CompraRepository.findByIdWithItems as jest.Mock).mockResolvedValue(null);

    await expect(CompraService.obterDetalhesCompra(999)).rejects.toThrow(
      'Compra não encontrada.'
    );
  });
});