import { Loja, UsuarioAuth, Passeio, MotoristaVeiculo, PromotorVendedor, Reserva, TransacaoCaixa } from '../types';
import { initialEmpresaConfig } from './mockData';

export const initialLojas: Loja[] = [
  {
    id: 'LOJA_001',
    nome: 'Porto Exclusive Receptivo & Tours',
    razaoSocial: 'Porto de Galinhas Turismo e Serviços Receptivos EIRELI',
    cnpj: '34.567.890/0001-12',
    cidade: 'Porto de Galinhas - Ipojuca / PE',
    telefone: '(81) 99876-5432',
    email: 'reservas@portoexclusive.com.br',
    status: 'ativa',
    criadoEm: '2025-01-10T08:00:00.000Z',
    empresaConfig: {
      ...initialEmpresaConfig,
      store_id: 'LOJA_001'
    }
  },
  {
    id: 'LOJA_002',
    nome: 'Maragogi Prime Receptivo & Catamarãs',
    razaoSocial: 'Maragogi Prime Turismo e Navegação Ltda',
    cnpj: '45.123.789/0001-55',
    cidade: 'Maragogi - AL',
    telefone: '(82) 99123-4567',
    email: 'contato@maragogiprime.com.br',
    status: 'ativa',
    criadoEm: '2025-02-15T09:30:00.000Z',
    empresaConfig: {
      store_id: 'LOJA_002',
      nomeFantasia: 'Maragogi Prime Receptivo & Catamarãs',
      razaoSocial: 'Maragogi Prime Turismo e Navegação Ltda',
      cnpj: '45.123.789/0001-55',
      cadastur: '17.045123.10.0002-8',
      telefoneWhatsapp: '(82) 99123-4567',
      emailContato: 'reservas@maragogiprime.com.br',
      enderecoCompleto: 'Av. Senador Rui Palmeira, 450 - Orla Central, Maragogi - AL',
      cidadeBase: 'Maragogi - AL',
      chavePixTipo: 'cnpj',
      chavePix: '45.123.789/0001-55',
      nomeTitularPix: 'Maragogi Prime Turismo Ltda',
      logoBase64: '',
      percentualSinalPadrao: 30,
      politicaCancelamento: 'Cancelamentos até 24h antes com devolução integral do sinal. No-show com perda do sinal.',
      termosVoucher: 'Apresente este voucher no embarque do catamarã na Praia de Maragogi. Sujeito às condições da tábua de marés.',
      agencias: [
        'Base Orla Central - Maragogi',
        'Ponto Antunes VIP',
        'Receptivo Barra Grande'
      ]
    }
  },
  {
    id: 'LOJA_003',
    nome: 'Carneiros Beach Tours & Receptivo',
    razaoSocial: 'Carneiros Turismo e Lazer EIRELI',
    cnpj: '28.987.654/0001-33',
    cidade: 'Tamandaré / Praia dos Carneiros - PE',
    telefone: '(81) 98888-2233',
    email: 'atendimento@carneirostours.com.br',
    status: 'ativa',
    criadoEm: '2025-03-01T10:00:00.000Z',
    empresaConfig: {
      store_id: 'LOJA_003',
      nomeFantasia: 'Carneiros Beach Tours & Receptivo',
      razaoSocial: 'Carneiros Turismo e Lazer EIRELI',
      cnpj: '28.987.654/0001-33',
      cadastur: '16.028987.10.0003-1',
      telefoneWhatsapp: '(81) 98888-2233',
      emailContato: 'contato@carneirostours.com.br',
      enderecoCompleto: 'Praia dos Carneiros, Acesso Bora Bora - Tamandaré - PE',
      cidadeBase: 'Praia dos Carneiros - Tamandaré / PE',
      chavePixTipo: 'cnpj',
      chavePix: '28.987.654/0001-33',
      nomeTitularPix: 'Carneiros Beach Tours',
      logoBase64: '',
      percentualSinalPadrao: 30,
      politicaCancelamento: 'Remarcações gratuitas com até 12h de antecedência.',
      termosVoucher: 'Voucher válido para day-use e passeios náuticos em Carneiros.',
      agencias: [
        'Receptivo Praia dos Carneiros',
        'Balcão Tamandaré Centro'
      ]
    }
  },
  {
    id: 'LOJA_004',
    nome: 'Ilha de Santo Aleixo Aventura (Inativa)',
    razaoSocial: 'Santo Aleixo Náutica & Ecoturismo Ltda',
    cnpj: '19.333.222/0001-99',
    cidade: 'Sirinhaém - PE',
    telefone: '(81) 97777-1122',
    email: 'contato@santoaleixo.com.br',
    status: 'inativa',
    criadoEm: '2025-04-12T14:00:00.000Z',
    empresaConfig: {
      store_id: 'LOJA_004',
      nomeFantasia: 'Ilha de Santo Aleixo Aventura',
      razaoSocial: 'Santo Aleixo Náutica & Ecoturismo Ltda',
      cnpj: '19.333.222/0001-99',
      cadastur: '16.019333.10.0004-9',
      telefoneWhatsapp: '(81) 97777-1122',
      emailContato: 'contato@santoaleixo.com.br',
      enderecoCompleto: 'Marina Barra de Sirinhaém - Sirinhaém - PE',
      cidadeBase: 'Sirinhaém - PE',
      chavePixTipo: 'cnpj',
      chavePix: '19.333.222/0001-99',
      nomeTitularPix: 'Santo Aleixo Náutica',
      logoBase64: '',
      percentualSinalPadrao: 30,
      politicaCancelamento: 'Cancelamento em até 24h.',
      termosVoucher: 'Apresentar na marina de embarque.',
      agencias: ['Marina Sirinhaém']
    }
  }
];

export const initialUsuariosAuth: UsuarioAuth[] = [
  {
    id: 'USR-MASTER-01',
    nome: 'Administrador Master',
    email: 'rogerionegocios682@gmail.com',
    usuarioLogin: 'master',
    senha: '@eRro404',
    perfil: 'master',
    store_id: 'ALL',
    nomeLoja: 'PAINEL MASTER (Todas as Lojas)',
    status: 'ativo',
    ultimoAcesso: new Date().toISOString()
  },
  {
    id: 'USR-LOJA1-01',
    nome: 'Rogério Silva',
    email: 'rogerio@portoexclusive.com.br',
    usuarioLogin: 'porto',
    senha: '123',
    perfil: 'admin_loja',
    store_id: 'LOJA_001',
    nomeLoja: 'Porto Exclusive Receptivo & Tours',
    status: 'ativo',
    ultimoAcesso: new Date().toISOString()
  },
  {
    id: 'USR-LOJA2-01',
    nome: 'Juliana Costa',
    email: 'juliana@maragogiprime.com.br',
    usuarioLogin: 'maragogi',
    senha: '123',
    perfil: 'admin_loja',
    store_id: 'LOJA_002',
    nomeLoja: 'Maragogi Prime Receptivo & Catamarãs',
    status: 'ativo',
    ultimoAcesso: new Date().toISOString()
  },
  {
    id: 'USR-LOJA3-01',
    nome: 'Carlos Eduardo',
    email: 'carlos@carneirostours.com.br',
    usuarioLogin: 'carneiros',
    senha: '123',
    perfil: 'admin_loja',
    store_id: 'LOJA_003',
    nomeLoja: 'Carneiros Beach Tours & Receptivo',
    status: 'ativo',
    ultimoAcesso: new Date().toISOString()
  }
];

// Dados complementares para Loja 02 (Maragogi Prime)
export const initialPasseiosLoja2: Passeio[] = [
  {
    id: 'PAS-M01',
    store_id: 'LOJA_002',
    nome: 'Catamarã Piscinas Naturais de Maragogi (Galés Principais)',
    categoria: 'catamara',
    precoPadrao: 180.00,
    tipoCobranca: 'por_pessoa',
    duracaoHoras: 3,
    destinoPrincipal: 'Galés de Maragogi',
    dependeMare: true,
    horarioRecomendado: 'Horário conforme a maré baixa',
    descricaoCurta: 'Passeio náutico oficial de catamarã até as maiores piscinas naturais do Brasil.',
    incluso: ['Ingresso catamarã', 'Máscara de mergulho simples', 'Guia a bordo'],
    opcionais: [
      { id: 'op-m1', nome: 'Mergulho Batismo com Cilindro', preco: 190.00, unidade: 'por_pessoa' },
      { id: 'op-m2', nome: 'Fotos Subaquáticas', preco: 80.00, unidade: 'por_servico' }
    ],
    ativo: true
  },
  {
    id: 'PAS-M02',
    store_id: 'LOJA_002',
    nome: 'Buggy Praias do Norte (Antunes, Barra Grande e Ponta de Mangue)',
    categoria: 'buggy',
    precoPadrao: 350.00,
    tipoCobranca: 'veiculo_privativo',
    capacidadeMax: 4,
    duracaoHoras: 4,
    destinoPrincipal: 'Litoral Norte de Maragogi',
    dependeMare: false,
    horarioRecomendado: '09:00 às 13:00',
    descricaoCurta: 'Passeio pelas praias mais paradisíacas com parada no famoso Caminho de Moisés.',
    incluso: ['Buggy privativo', 'Motorista credenciado', 'Combustível'],
    ativo: true
  }
];

export const initialMotoristasLoja2: MotoristaVeiculo[] = [
  {
    id: 'MOT-M01',
    store_id: 'LOJA_002',
    nomeMotorista: 'Sebastião Silva (Tião Maragogi)',
    telefone: '(82) 99881-3344',
    veiculoModelo: 'Buggy Selvagem 1.8',
    tipoVeiculo: 'buggy',
    placaOuRegistro: 'MGO-2025',
    capacidadePax: 4,
    status: 'disponivel',
    observacoes: 'Credenciado Prefeitura de Maragogi'
  },
  {
    id: 'MOT-M02',
    store_id: 'LOJA_002',
    nomeMotorista: 'Comandante Jorge Alagoas',
    telefone: '(82) 99772-5566',
    veiculoModelo: 'Catamarã Maragogi I (60 Pax)',
    tipoVeiculo: 'catamara',
    placaOuRegistro: 'CAP-MGO-019',
    capacidadePax: 60,
    status: 'disponivel',
    observacoes: 'Marinheiro habilitado pela Capitania dos Portos'
  }
];

export const initialVendedoresLoja2: PromotorVendedor[] = [
  {
    id: 'VEN-M01',
    store_id: 'LOJA_002',
    nome: 'Aline Mendonça (Balcão Orla)',
    tipo: 'balcao_loja',
    comissaoPadraoPct: 10,
    telefone: '(82) 99333-1122',
    chavePix: 'aline.maragogi@pix.com',
    ativo: true
  }
];

export const initialReservasLoja2: Reserva[] = [
  {
    id: 'RSV-M70010',
    store_id: 'LOJA_002',
    codigoVoucher: 'RSV-M70010',
    agenciaEmissora: 'Base Orla Central - Maragogi',
    dataEmissao: new Date().toISOString(),
    dataPasseio: new Date().toISOString().split('T')[0],
    horarioEmbarquePrevisto: '09:00',
    clienteNome: 'Mariana Fontes',
    clienteTelefone: '(11) 98765-4321',
    clienteHotel: 'Salinas Maragogi Resort',
    clienteQuarto: '304',
    passeioId: 'PAS-M01',
    passeioNome: 'Catamarã Piscinas Naturais de Maragogi (Galés Principais)',
    paxAdultos: 2,
    paxCriancas: 1,
    paxBebes: 0,
    totalPax: 3,
    valorUnitarioOuBase: 180.00,
    valorOpcionais: 0,
    valorDesconto: 0,
    valorTotal: 540.00,
    valorSinalPago: 162.00,
    formaPagamentoSinal: 'pix',
    valorSaldoRestante: 378.00,
    saldoQuitado: false,
    motoristaVeiculoId: 'MOT-M02',
    motoristaNome: 'Comandante Jorge Alagoas',
    veiculoInfo: 'Catamarã Maragogi I (60 Pax)',
    statusEmbarque: 'aguardando',
    vendedorId: 'VEN-M01',
    vendedorNome: 'Aline Mendonça (Balcão Orla)',
    comissaoValor: 54.00,
    comissaoPaga: false,
    status: 'confirmada'
  }
];

export const initialTransacoesLoja2: TransacaoCaixa[] = [
  {
    id: 'TX-M01',
    store_id: 'LOJA_002',
    dataHora: new Date().toISOString(),
    tipo: 'entrada_sinal',
    reservaId: 'RSV-M70010',
    codigoVoucher: 'RSV-M70010',
    agencia: 'Base Orla Central - Maragogi',
    valor: 162.00,
    formaPagamento: 'pix',
    descricao: 'Sinal recebido (PIX) - Mariana Fontes',
    operadorNome: 'Aline Mendonça (Balcão Orla)'
  }
];
