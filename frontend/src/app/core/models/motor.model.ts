export interface Motor {
  id: number;
  codigo: string;
  modelo: string;
  fabricante_id: number;
  fabricante_nome?: string;
  potencia_cv: number;
  tensao: string;
  frequencia_hz: number;
  polos: number;
  rotacao_rpm: number;
  carcaca: string | null;
  grau_protecao: string | null;
  preco: number | null;
  criado_em?: string;
}

// Payload enviado pelo formulário para criar/editar um motor
export interface MotorPayload {
  codigo: string;
  modelo: string;
  fabricante_id: number | null;
  potencia_cv: number | null;
  tensao: string;
  frequencia_hz: number | null;
  polos: number | null;
  rotacao_rpm: number | null;
  carcaca: string | null;
  grau_protecao: string | null;
  preco: number | null;
}
