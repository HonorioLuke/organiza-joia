import { Compra, ItemCompra } from '../../models/types';
import { getDatabase } from '../connection';

export interface CreateCompraRecord {
  cliente_id: number;
  data_compra: string;
  valor_total: number;
  itens: Omit<ItemCompra, 'id' | 'compra_id'>[];
}

export class CompraRepository {
  /**
   * Persiste a compra e todos os seus itens dentro de uma transação atômica.
   * Caso ocorra qualquer erro em algum item, toda a gravação é revertida.
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

    const createdCompra = await db.getFirstAsync<Compra>(
      `SELECT
        c.*,
        cl.nome AS cliente_nome
      FROM compras c
      INNER JOIN clientes cl ON cl.id = c.cliente_id
      WHERE c.id = ?
      LIMIT 1`,
      [insertedCompraId]
    );

    if (!createdCompra) {
      throw new Error('Compra registrada, mas não foi possível carregá-la.');
    }

    const savedItems = await db.getAllAsync<ItemCompra>(
      `SELECT * FROM itens_compra WHERE compra_id = ? ORDER BY id ASC`,
      [insertedCompraId]
    );

    return {
      ...createdCompra,
      quantidade_itens: savedItems.length,
      itens: savedItems,
    };
  }
}