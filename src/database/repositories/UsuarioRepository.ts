import { Usuario } from '../../models/types';
import { getDatabase } from '../connection';

export class UsuarioRepository {
  static async findByUsuario(usuario: string): Promise<Usuario | null> {
    const db = await getDatabase();
    const normalized = usuario.trim().toLowerCase();

    const row = await db.getFirstAsync<Usuario>(
      'SELECT * FROM usuarios WHERE LOWER(TRIM(usuario)) = ? LIMIT 1',
      [normalized]
    );

    return row ?? null;
  }

  static async findById(id: number): Promise<Usuario | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<Usuario>(
      'SELECT * FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );

    return row ?? null;
  }
}