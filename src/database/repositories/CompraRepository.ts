import { Compra, ItemCompra } from '../../models/types';
import { roundCurrency } from '../../utils/formatters';
import { getDatabase } from '../connection';

export interface CreateCompraRecord {
  cliente_id: number;
  data_compra: string;
  valor_total: number;
  itens: Omit<ItemCompra, 'id' | 'compra_id'>[];
}

export interface ClienteComprasResumo {
  totalAcumulado: number;
  quantidadeCompras: number;
}

export class CompraRepository {
  /**
   * Persiste a compra e todos os seus itens dentro de uma transação atômica.
   */
  static async createWithItems(data: CreateCompraRecord): Promise<Compra> {
    const db = await getDatabase();
    let insertedCompraId = 0;

    await db.withTransactionAsync(async () => {
      const compraResult = await db.runAsync(
        `INSERT INTO compras (cliente_id, data_compra, valor_total)
         VALUES (?, ?, ?)`,
        [data.cliente_id, data.data_compra, data.valor_total]
      );

      insertedCompraId = compraResult.lastInsertRowId;

      if (!insertedCompraId) {
        throw new Error('Falha ao gerar o identificador da compra.');
      }

      for (const item of data.itens) {
        await db.runAsync(
          `INSERT INTO itens_compra (
            compra_id,
            tipo_joia,
            tipo_personalizado,
            detalhamento,
            quantidade,
            valor_unitario,
            subtotal
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            insertedCompraId,
            item.tipo_joia,
            item.tipo_personalizado,
            item.detalhamento,
            item.quantidade,
            item.valor_unitario,
            item.subtotal,
          ]
        );
      }
    });

    const created = await this.findByIdWithItems(insertedCompraId);
    if (!created) {
      throw new Error('Compra registrada, mas não foi possível carregá-la.');
    }

    return created;
  }

  /**
   * Lista todas as compras ATIVAS (fora da lixeira) de um cliente,
   * ordenadas da mais recente para a mais antiga.
   */
  static async findActiveByClienteId(clienteId: number): Promise<Compra[]> {
    const db = await getDatabase();

    return db.getAllAsync<Compra>(
      `SELECT
        c.id,
        c.cliente_id,
        cl.nome AS cliente_nome,
        c.data_compra,
        c.valor_total,
        c.created_at,
        c.deleted_at,
        c.expires_at,
        (
          SELECT COUNT(*)
          FROM itens_compra ic
          WHERE ic.compra_id = c.id
        ) AS quantidade_itens
      FROM compras c
      INNER JOIN clientes cl ON cl.id = c.cliente_id
      WHERE c.cliente_id = ?
        AND c.deleted_at IS NULL
      ORDER BY c.data_compra DESC, c.id DESC`,
      [clienteId]
    );
  }

  /**
   * Calcula o total acumulado e a quantidade de compras ATIVAS do cliente.
   */
  static async getResumoAtivoByClienteId(
    clienteId: number
  ): Promise<ClienteComprasResumo> {
    const db = await getDatabase();

    const row = await db.getFirstAsync<{
      total_acumulado: number | null;
      quantidade_compras: number | null;
    }>(
      `SELECT
        COALESCE(SUM(valor_total), 0) AS total_acumulado,
        COUNT(*) AS quantidade_compras
      FROM compras
      WHERE cliente_id = ?
        AND deleted_at IS NULL`,
      [clienteId]
    );

    return {
      totalAcumulado: roundCurrency(row?.total_acumulado ?? 0),
      quantidadeCompras: Number(row?.quantidade_compras ?? 0),
    };
  }

  /**
   * Busca os dados completos de uma compra e todos os seus itens vinculados.
   */
  static async findByIdWithItems(compraId: number): Promise<Compra | null> {
    const db = await getDatabase();

    const compra = await db.getFirstAsync<Compra>(
      `SELECT
        c.*,
        cl.nome AS cliente_nome
      FROM compras c
      INNER JOIN clientes cl ON cl.id = c.cliente_id
      WHERE c.id = ?
      LIMIT 1`,
      [compraId]
    );

    if (!compra) {
      return null;
    }

    const itens = await db.getAllAsync<ItemCompra>(
      `SELECT *
       FROM itens_compra
       WHERE compra_id = ?
       ORDER BY id ASC`,
      [compraId]
    );

    return {
      ...compra,
      quantidade_itens: itens.length,
      itens,
    };
  }
}