import { CompraRepository } from '../database/repositories/CompraRepository';
import { LixeiraService } from '../services/LixeiraService';

jest.mock('../database/repositories/CompraRepository', () => ({
  CompraRepository: {
    findByIdWithItems: jest.fn(),
    softDelete: jest.fn(),
    findInTrash: jest.fn(),
    restoreFromTrash: jest.fn(),
  },
}));

describe('LixeiraService - Exclusão Lógica e Restauração (10 Dias)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve enviar uma compra ativa para a lixeira', async () => {
    (CompraRepository.findByIdWithItems as jest.Mock).mockResolvedValue({
      id: 15,
      cliente_id: 2,
      data_compra: '2026-11-27',
      valor_total: 450,
      deleted_at: null,
      expires_at: null,
    });
    (CompraRepository.softDelete as jest.Mock).mockResolvedValue(true);

    await LixeiraService.enviarParaLixeira(15);

    expect(CompraRepository.softDelete).toHaveBeenCalledWith(15);
  });

  it('deve impedir envio duplicado se a compra já estiver na lixeira', async () => {
    (CompraRepository.findByIdWithItems as jest.Mock).mockResolvedValue({
      id: 15,
      cliente_id: 2,
      data_compra: '2026-11-27',
      valor_total: 450,
      deleted_at: '2026-11-27 14:00:00',
      expires_at: '2026-12-07 14:00:00',
    });

    await expect(LixeiraService.enviarParaLixeira(15)).rejects.toThrow(
      'Esta compra já está na lixeira.'
    );
    expect(CompraRepository.softDelete).not.toHaveBeenCalled();
  });

  it('deve restaurar uma compra válida dentro do prazo de 10 dias', async () => {
    (CompraRepository.restoreFromTrash as jest.Mock).mockResolvedValue(true);

    await expect(LixeiraService.restaurarCompra(15)).resolves.toBeUndefined();
    expect(CompraRepository.restoreFromTrash).toHaveBeenCalledWith(15);
  });

  it('deve bloquear a restauração quando o prazo de 10 dias tiver expirado', async () => {
    (CompraRepository.restoreFromTrash as jest.Mock).mockResolvedValue(false);

    await expect(LixeiraService.restaurarCompra(15)).rejects.toThrow(
      'Não foi possível restaurar a compra. O prazo de 10 dias pode ter expirado.'
    );
  });
});