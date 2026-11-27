import { CompraRepository } from '../database/repositories/CompraRepository';
import { CompraLixeira } from '../models/types';

export class LixeiraService {
  /**
   * Move uma compra ativa para a lixeira com prazo de retenção de 10 dias.
   */
  static async enviarParaLixeira(compraId: number): Promise<void> {
    const compra = await CompraRepository.findByIdWithItems(compraId);
    if (!compra) {
      throw new Error('Compra não encontrada.');
    }

    if (compra.deleted_at) {
      throw new Error('Esta compra já está na lixeira.');
    }

    const moved = await CompraRepository.softDelete(compraId);
    if (!moved) {
      throw new Error('Não foi possível enviar a compra para a lixeira.');
    }
  }

  /**
   * Lista todas as compras válidas atualmente na lixeira (dentro dos 10 dias).
   */
  static async listarLixeira(): Promise<CompraLixeira[]> {
    return CompraRepository.findInTrash();
  }

  /**
   * Restaura uma compra da lixeira para o histórico ativo do cliente.
   */
  static async restaurarCompra(compraId: number): Promise<void> {
    const restored = await CompraRepository.restoreFromTrash(compraId);
    if (!restored) {
      throw new Error(
        'Não foi possível restaurar a compra. O prazo de 10 dias pode ter expirado.'
      );
    }
  }
}