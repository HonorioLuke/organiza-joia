import * as Crypto from 'expo-crypto';
import { getDatabase } from './connection';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPasswordWithSalt(
  plainPassword: string,
  salt: string
): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${plainPassword}`
  );
}

export async function generateSalt(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return bytesToHex(randomBytes);
}

export async function runMigrations(): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      usuario TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      contato TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS compras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      data_compra TEXT NOT NULL,
      valor_total REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      deleted_at TEXT,
      expires_at TEXT,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS itens_compra (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      compra_id INTEGER NOT NULL,
      tipo_joia TEXT NOT NULL,
      tipo_personalizado TEXT,
      detalhamento TEXT,
      quantidade INTEGER NOT NULL CHECK (quantidade > 0),
      valor_unitario REAL NOT NULL CHECK (valor_unitario >= 0),
      subtotal REAL NOT NULL CHECK (subtotal >= 0),
      FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_compras_cliente_id ON compras(cliente_id);
    CREATE INDEX IF NOT EXISTS idx_compras_deleted_at ON compras(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_compras_expires_at ON compras(expires_at);
    CREATE INDEX IF NOT EXISTS idx_itens_compra_id ON itens_compra(compra_id);
  `);

  await seedDefaultUser();
}

const DEFAULT_USER = (
  process.env.EXPO_PUBLIC_DEFAULT_USER || 'admin'
).trim();
const DEFAULT_PASSWORD =
  process.env.EXPO_PUBLIC_DEFAULT_PASSWORD || '123456';

async function seedDefaultUser(): Promise<void> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM usuarios ORDER BY id ASC LIMIT 1'
  );

  const salt = await generateSalt();
  const senhaHash = await hashPasswordWithSalt(DEFAULT_PASSWORD, salt);

  if (!existing) {
    await db.runAsync(
      `INSERT INTO usuarios (nome, usuario, senha_hash, salt)
       VALUES (?, ?, ?, ?)`,
      ['Administradora', DEFAULT_USER, senhaHash, salt]
    );
  } else {
    // Atualiza o usuário inicial caso você altere a senha no .env durante os testes
    await db.runAsync(
      `UPDATE usuarios
       SET usuario = ?, senha_hash = ?, salt = ?
       WHERE id = ?`,
      [DEFAULT_USER, senhaHash, salt, existing.id]
    );
  }
}