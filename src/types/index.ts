export type CategoriaPasseio = 
  | 'buggy' 
  | 'catamara' 
  | 'lancha_privativa' 
  | 'transfer_aeroporto' 
  | 'mergulho' 
  | '4x4_offroad' 
  | 'city_tour';

export interface OpcionalPasseio {
  id: string;
  nome: string;
  preco: number;
  unidade: 'por_pessoa' | 'por_veiculo' | 'por_servico';
}

export interface Passeio {
  id: string;
  store_id?: string; // Identificador da loja proprietária
  nome: string;
  categoria: CategoriaPasseio;
  precoPadrao: number; // Por pessoa ou valor fechado dependendo do tipo
  tipoCobranca: 'por_pessoa' | 'veiculo_privativo';
  capacidadeMax?: number;
  duracaoHoras: number;
  destinoPrincipal: string; // Ex: Porto de Galinhas, Maragogi, Carneiros, Calhetas, Ilha de Santo Aleixo
  dependeMare: boolean;
  horarioRecomendado?: string;
  descricaoCurta: string;
  incluso: string[];
  opcionais?: OpcionalPasseio[];
  ativo: boolean;
}

export interface MotoristaVeiculo {
  id: string;
  store_id?: string; // Identificador da loja proprietária
  nomeMotorista: string;
  telefone: string;
  veiculoModelo: string;
  tipoVeiculo: 'buggy' | 'van' | 'spin_executivo' | 'microonibus' | 'lancha' | 'catamara';
  placaOuRegistro: string;
  capacidadePax: number;
  status: 'disponivel' | 'em_rota' | 'folga' | 'manutencao';
  observacoes?: string;
}

export interface PromotorVendedor {
  id: string;
  store_id?: string; // Identificador da loja proprietária
  nome: string;
  tipo: 'balcao_loja' | 'promotor_rua' | 'parceiro_hotel' | 'influencer_site';
  comissaoPadraoPct: number; // Ex: 10% ou 15%
  telefone: string;
  chavePix?: string;
  ativo: boolean;
}

export type StatusReserva = 'confirmada' | 'pendente_pagamento' | 'embarcado' | 'concluida' | 'cancelada' | 'no_show';

export type StatusEmbarque = 'aguardando' | 'embarcado_saldo_pago' | 'embarcado_saldo_cortesia' | 'no_show' | 'cancelado_tempo';

export type FormaPagamento = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'faturado_agencia';

export interface Reserva {
  id: string;
  store_id?: string; // Identificador da loja proprietária
  codigoVoucher: string; // Ex: RSV-892140
  agenciaEmissora: string;
  dataEmissao: string; // ISO
  dataPasseio: string; // YYYY-MM-DD
  horarioEmbarquePrevisto: string; // HH:mm
  
  // Cliente / Turista
  clienteNome: string;
  clienteTelefone: string;
  clienteCpfPassaporte?: string;
  clienteHotel: string; // Ex: Nannai Muro Alto, Hotel Solar Porto de Galinhas, Pousada X
  clienteQuarto?: string;
  pontoEncontroAlternativo?: string;
  
  // Passeio & Pax
  passeioId: string;
  passeioNome: string;
  paxAdultos: number;
  paxCriancas: number; // 6 a 10 anos
  paxBebes: number; // 0 a 5 anos
  totalPax: number;
  opcionaisSelecionados?: { nome: string; quantidade: number; valorTotal: number }[];
  
  // Valores & Sinal
  valorUnitarioOuBase: number;
  valorOpcionais: number;
  valorDesconto: number;
  valorTotal: number;
  valorSinalPago: number;
  formaPagamentoSinal: FormaPagamento;
  valorSaldoRestante: number;
  formaPagamentoSaldo?: FormaPagamento;
  saldoQuitado: boolean;
  dataQuitacaoSaldo?: string;
  
  // Operação & Logística
  motoristaVeiculoId?: string;
  motoristaNome?: string;
  motoristaTelefone?: string;
  veiculoInfo?: string;
  ordemParada?: number;
  statusEmbarque: StatusEmbarque;
  horaEmbarqueEfetivo?: string;
  
  // Comercial
  vendedorId?: string;
  vendedorNome?: string;
  comissaoValor: number;
  comissaoPaga: boolean;
  
  // Observações
  observacoesInternas?: string;
  observacoesVoucher?: string;
  status: StatusReserva;
}

export interface RegistroMare {
  data: string; // YYYY-MM-DD
  store_id?: string;
  horarioBaixa: string; // Ex: 09:42
  alturaBaixa: number; // Ex: 0.2 (metros)
  horarioAlta: string; // Ex: 16:10
  alturaAlta: number; // Ex: 2.1
  horarioSegundaBaixa?: string;
  alturaSegundaBaixa?: number;
  coeficiente?: string; // Ex: "Maré de Lua Nova - Excelente"
  recomendacaoPiscinas: 'perfeita' | 'boa' | 'regular' | 'inapropriada';
  janelaIdealPiscinas: string; // Ex: "07:30 às 11:30"
}

export interface TransacaoCaixa {
  id: string;
  store_id?: string; // Identificador da loja proprietária
  dataHora: string;
  tipo: 'entrada_sinal' | 'entrada_saldo_embarque' | 'saida_comissao' | 'saida_despesa' | 'sangria_retirada';
  reservaId?: string;
  codigoVoucher?: string;
  agencia: string;
  valor: number;
  formaPagamento: FormaPagamento;
  descricao: string;
  operadorNome: string;
}

export interface FechamentoCaixaDia {
  id: string;
  store_id?: string; // Identificador da loja proprietária
  data: string; // YYYY-MM-DD
  agencia: string;
  abertoEm: string;
  fechadoEm?: string;
  saldoInicial: number;
  totalSinaisRecebidos: number;
  totalSaldosRecebidos: number;
  totalComissoesPagas: number;
  totalSangrias: number;
  saldoFinalCalculado: number;
  status: 'aberto' | 'fechado';
  responsavelFechamento?: string;
}

export interface EmpresaConfig {
  store_id?: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  cadastur: string;
  telefoneWhatsapp: string;
  emailContato: string;
  enderecoCompleto: string;
  cidadeBase: string; // Ex: Porto de Galinhas - Ipojuca / PE
  chavePixTipo: 'cnpj' | 'telefone' | 'email' | 'aleatoria';
  chavePix: string;
  nomeTitularPix: string;
  logoBase64: string;
  percentualSinalPadrao: number; // Ex: 30%
  politicaCancelamento: string;
  termosVoucher: string;
  agencias: string[];
}

export type StatusConexaoRastreio = 'online_gps' | 'online_gsm' | 'ausente' | 'sem_sinal';

export type PerfilUsuario = 'administrador' | 'operador_agencia';

export interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  agenciaVinculada: string;
}

export interface RelatorioPdfConfig {
  tipo: 'rota' | 'financeiro' | 'reservas' | 'frota' | 'tarifario';
  titulo: string;
  subtitulo?: string;
  periodoOuFiltro?: string;
  dados: any;
}

export interface TelemetriaColaborador {
  id: string; // Colaborador ID (MOT-... or VEN-...)
  store_id?: string; // Identificador da loja proprietária
  tipo: 'motorista' | 'vendedor';
  nome: string;
  telefone: string;
  statusConexao: StatusConexaoRastreio;
  bateriaPct?: number | null;
  velocidadeKmH?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  localizacaoNome: string;
  regiao: string;
  ultimoPing?: string | null;
  precisaoMetros?: number | null;
  operadoraCelular?: string | null;
  detalhesOperacao: {
    veiculoOuPonto: string;
    placaOuChave?: string;
    totalPassageirosOuVendasHoje: number;
    valorAcumuladoHoje: number;
    proximoPontoOuUltimoVoucher?: string;
    emMovimento: boolean;
  };
  historicoPontos?: {
    hora: string;
    local: string;
    lat: number;
    lng: number;
  }[];
}

// -------------------------------------------------------------
// NOVO: ESTRUTURA DE AUTENTICAÇÃO MULTI-LOJA & ACESSO MASTER
// -------------------------------------------------------------

export type PerfilAcesso = 'master' | 'admin_loja' | 'operador_loja';

export interface Loja {
  id: string; // Ex: 'LOJA_001', 'LOJA_002', 'LOJA_003'
  nome: string; // Ex: 'Porto Exclusive Receptivo'
  razaoSocial?: string;
  cnpj: string;
  cidade: string;
  telefone: string;
  email: string;
  status: 'ativa' | 'inativa';
  criadoEm: string; // ISO
  empresaConfig: EmpresaConfig;
}

export interface UsuarioAuth {
  id: string;
  nome: string;
  email: string;
  usuarioLogin: string; // Username para login
  senha: string; // Senha para validação
  perfil: PerfilAcesso; // 'master' | 'admin_loja' | 'operador_loja'
  store_id: string; // 'ALL' para Master ou 'LOJA_001', 'LOJA_002', etc.
  nomeLoja?: string;
  status: 'ativo' | 'inativo';
  ultimoAcesso?: string;
}
