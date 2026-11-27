import { ClienteRepository } from '../database/repositories/ClienteRepository';
import { ClienteService } from '../services/ClienteService';

jest.mock('../database/repositories/ClienteRepository', () => ({
  ClienteRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findAllWithLastPurchase: jest.fn(),
  },
}));

describe('ClienteService - Gestão e Validação de Clientes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve rejeitar cadastro quando o nome estiver vazio ou apenas espaços', async () => {
    await expect(ClienteService.cadastrarCliente('   ')).rejects.toThrow(
      'O nome do cliente é obrigatório.'
    );
    expect(ClienteRepository.create).not.toHaveBeenCalled();
  });

  it('deve rejeitar nome com menos de 2 caracteres', async () => {
    await expect(ClienteService.cadastrarCliente('A')).rejects.toThrow(
      'Informe um nome válido com pelo menos 2 caracteres.'
    );
    expect(ClienteRepository.create).not.toHaveBeenCalled();
  });

  it('deve normalizar espaços extras do nome e salvar contato opcional', async () => {
    (ClienteRepository.create as jest.Mock).mockResolvedValue({
      id: 1,
      nome: 'Maria Clara',
      contato: '(85) 99999-0000',
      created_at: '2026-11-27 10:00:00',
    });

    const cliente = await ClienteService.cadastrarCliente(
      '  Maria   Clara  ',
      '  (85) 99999-0000  '
    );

    expect(ClienteRepository.create).toHaveBeenCalledWith(
      'Maria Clara',
      '(85) 99999-0000'
    );
    expect(cliente.nome).toBe('Maria Clara');
  });

  it('deve converter contato vazio para null no banco de dados', async () => {
    (ClienteRepository.create as jest.Mock).mockResolvedValue({
      id: 2,
      nome: 'Ana Silva',
      contato: null,
      created_at: '2026-11-27 10:05:00',
    });

    await ClienteService.cadastrarCliente('Ana Silva', '   ');

    expect(ClienteRepository.create).toHaveBeenCalledWith('Ana Silva', null);
  });
});