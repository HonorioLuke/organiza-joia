import { Cliente } from '../../models/types';
import { getDatabase } from '../connection';

export class ClienteRepository {
  static async create(nome: string, contato: string | null): Promise<Cliente> {
    const db = await getDatabase();

    const result = await db.runAsync(
      `INSERT INTO clientes (nome, contato) VALUES (?, ?)`,
      [nome, contato]
    );

    const created = await this.findById(result.lastInsertRowId);
    if (!created) {
      throw new Error('Falha ao recuperar o cliente após o cadastro.');
    }

    return created;
  }

  static async findById(id: number): Promise<Cliente | null> {
    const db = await getDatabase();

    const row = await db.getFirstAsync<Cliente>(
      `SELECT
        c.id,
        c.nome,
        c.contato,
        c.created_at,
        (
          SELECT comp.data_compra
          FROM compras comp
          WHERE comp.cliente_id = c.id
            AND comp.deleted_at IS NULL
          ORDER BY comp.data_compra DESC, comp.id DESC
          LIMIT 1
        ) AS ultima_compra
      FROM clientes c
      WHERE c.id = ?
      LIMIT 1`,
      [id]
    );

    return row ?? null;
  }

  static async findAllWithLastPurchase(searchTerm?: string): Promise<Cliente[]> {
    const db = await getDatabase();
    const cleanSearch = searchTerm?.trim().toLowerCase() ?? '';

    if (cleanSearch.length > 0) {
      return db.getAllAsync<Cliente>(
        `SELECT
          c.id,
          c.nome,
          c.contato,
          c.created_at,
          (
            SELECT comp.data_compra
            FROM compras comp
            WHERE comp.cliente_id = c.id
              AND comp.deleted_at IS NULL
            ORDER BY comp.data_compra DESC, comp.id DESC
            LIMIT 1
          ) AS ultima_compra
        FROM clientes c
        WHERE LOWER(c.nome) LIKE ?
           OR LOWER(COALESCE(c.contato, '')) LIKE ?
        ORDER BY c.nome COLLATE NOCASE ASC`,
        [`%${cleanSearch}%`, `%${cleanSearch}%`]
      );
    }

    return db.getAllAsync<Cliente>(
      `SELECT
        c.id,
        c.nome,
        c.contato,
        c.created_at,
        (
          SELECT comp.data_compra
          FROM compras comp
          WHERE comp.cliente_id = c.id
            AND comp.deleted_at IS NULL
          ORDER BY comp.data_compra DESC, comp.id DESC
          LIMIT 1
        ) AS ultima_compra
      FROM clientes c
      ORDER BY c.nome COLLATE NOCASE ASC`
    );
  }
}