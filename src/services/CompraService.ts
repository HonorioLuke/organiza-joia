import { ClienteRepository } from '../database/repositories/ClienteRepository';
import {
  ClienteComprasResumo,
  CompraRepository,
} from '../database/repositories/CompraRepository';
import { Cliente, Compra, ItemCompra, ItemCompraDraft } from '../models/types';
import { roundCurrency } from '../utils/formatters';
import { validateCompraDraft } from '../utils/validators';

export interface HistoricoClienteData {
  cliente: Cliente;
  resumo: ClienteComprasResumo;
  compras: Compra[];
}

export class CompraService {
  /**
   * Valida os dados, verifica a existência do cliente e recalcula todos os
   * subtotais e o valor total antes de persistir no SQLite.
   */
  static async registrarCompra(params: {
    clienteId: number | null;
    dataCompraBR: string;
    itens: ItemCompraDraft[];
  }): Promise<Compra> {
    const { isoDate, itensValidados } = validateCompraDraft(params);

    const clienteExiste = await ClienteRepository.findById(params.clienteId!);
    if (!clienteExiste) {
      throw new Error('O cliente selecionado não foi encontrado no sistema.');
    }

    const itensCalculados: Omit<ItemCompra, 'id' | 'compra_id'>[] =
      itensValidados.map((item) => {
        const subtotal = roundCurrency(item.quantidade * item.valor_unitario);
        return {
          tipo_joia: item.tipo_joia,
          tipo_personalizado: item.tipo_personalizado,
          detalhamento: item.detalhamento,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          subtotal,
        };
      });

    const valorTotal = roundCurrency(
      itensCalculados.reduce((acc, item) => acc + item.subtotal, 0)
    );

    return CompraRepository.createWithItems({
      cliente_id: clienteExiste.id,
      data_compra: isoDate,
      valor_total: valorTotal,
      itens: itensCalculados,
    });
  }

  /**
   * Carrega os dados do cliente, o total acumulado ativo, a quantidade de compras
   * ativas e o histórico ordenado da mais recente para a mais antiga.
   */
  static async obterHistoricoCliente(
    clienteId: number
  ): Promise<HistoricoClienteData> {
    const cliente = await ClienteRepository.findById(clienteId);
    if (!cliente) {
      throw new Error('Cliente não encontrado.');
    }

    const [resumo, compras] = await Promise.all([
      CompraRepository.getResumoAtivoByClienteId(clienteId),
      CompraRepository.findActiveByClienteId(clienteId),
    ]);

    return {
      cliente,
      resumo,
      compras,
    };
  }

  /**
   * Carrega todos os detalhes e itens de uma compra específica.
   */
  static async obterDetalhesCompra(compraId: number): Promise<Compra> {
    const compra = await CompraRepository.findByIdWithItems(compraId);
    if (!compra) {
      throw new Error('Compra não encontrada.');
    }
    return compra;
  }
}