export type TipoJoia = 'Brinco' | 'Pulseira' | 'Anel' | 'Outro';

export interface Usuario {
  id: number;
  nome: string;
  usuario: string;
  senha_hash: string;
  salt: string;
  created_at: string;
}

export interface UsuarioAutenticado {
  id: number;
  nome: string;
  usuario: string;
}

export interface AuthSession {
  token: string;
  userId: number;
  usuario: string;
  nome: string;
  issuedAt: string;
}

export interface Cliente {
  id: number;
  nome: string;
  contato: string | null;
  created_at: string;
  ultima_compra?: string | null;
}

export interface ItemCompra {
  id?: number;
  compra_id?: number;
  tipo_joia: TipoJoia;
  tipo_personalizado: string | null;
  detalhamento: string | null;
  quantidade: number;
  valor_unitario: number;
  subtotal: number;
}

export interface ItemCompraDraft {
  localId: string;
  tipo_joia: TipoJoia;
  tipo_personalizado: string;
  detalhamento: string;
  quantidade: string;
  valor_unitario: string;
}

export interface Compra {
  id: number;
  cliente_id: number;
  cliente_nome?: string;
  data_compra: string;
  valor_total: number;
  created_at: string;
  deleted_at: string | null;
  expires_at: string | null;
  quantidade_itens?: number;
  itens?: ItemCompra[];
}

export interface CompraLixeira extends Compra {
  dias_restantes: number;
}