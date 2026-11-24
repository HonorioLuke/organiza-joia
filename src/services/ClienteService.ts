import { ClienteRepository } from '../database/repositories/ClienteRepository';
import { Cliente } from '../models/types';

export class ClienteService {
  static async cadastrarCliente(
    nomeInput: string,
    contatoInput?: string
  ): Promise<Cliente> {
    const nomeLimpo = nomeInput.trim().replace(/\s+/g, ' ');

    if (!nomeLimpo) {
      throw new Error('O nome do cliente é obrigatório.');
    }

    if (nomeLimpo.length < 2) {
      throw new Error('Informe um nome válido com pelo menos 2 caracteres.');
    }

    const contatoLimpo = contatoInput?.trim() ? contatoInput.trim() : null;

    return ClienteRepository.create(nomeLimpo, contatoLimpo);
  }

  static async listarClientes(busca?: string): Promise<Cliente[]> {
    return ClienteRepository.findAllWithLastPurchase(busca);
  }

  static async buscarPorId(id: number): Promise<Cliente> {
    const cliente = await ClienteRepository.findById(id);
    if (!cliente) {
      throw new Error('Cliente não encontrado.');
    }
    return cliente;
  }
}