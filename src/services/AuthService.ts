import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { UsuarioRepository } from '../database/repositories/UsuarioRepository';
import { hashPasswordWithSalt } from '../database/migrations';
import { AuthSession, UsuarioAutenticado } from '../models/types';

const SESSION_STORAGE_KEY = 'joias_crm_secure_session_v1';

export class AuthService {
  static async login(
    usuarioInput: string,
    senhaInput: string
  ): Promise<UsuarioAutenticado> {
    const usuarioLimpo = usuarioInput.trim();

    if (!usuarioLimpo) {
      throw new Error('Informe o nome de usuário ou e-mail.');
    }

    if (!senhaInput) {
      throw new Error('Informe a senha de acesso.');
    }

    const userRecord = await UsuarioRepository.findByUsuario(usuarioLimpo);
    if (!userRecord) {
      throw new Error('Usuário ou senha inválidos.');
    }

    const computedHash = await hashPasswordWithSalt(senhaInput, userRecord.salt);
    if (computedHash !== userRecord.senha_hash) {
      throw new Error('Usuário ou senha inválidos.');
    }

    const token = Crypto.randomUUID();
    const session: AuthSession = {
      token,
      userId: userRecord.id,
      usuario: userRecord.usuario,
      nome: userRecord.nome,
      issuedAt: new Date().toISOString(),
    };

    await SecureStore.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify(session));

    return {
      id: userRecord.id,
      nome: userRecord.nome,
      usuario: userRecord.usuario,
    };
  }

  static async getValidatedSession(): Promise<UsuarioAutenticado | null> {
    try {
      const raw = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const session: AuthSession = JSON.parse(raw);
      if (!session.token || !session.userId) {
        await this.clearSession();
        return null;
      }

      const userExists = await UsuarioRepository.findById(session.userId);
      if (!userExists) {
        await this.clearSession();
        return null;
      }

      return {
        id: userExists.id,
        nome: userExists.nome,
        usuario: userExists.usuario,
      };
    } catch {
      await this.clearSession();
      return null;
    }
  }

  static async clearSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
    } catch {
      // Ignora falha caso não exista chave armazenada
    }
  }
}