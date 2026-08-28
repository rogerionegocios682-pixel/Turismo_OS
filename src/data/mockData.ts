import { EmpresaConfig, Passeio, MotoristaVeiculo, PromotorVendedor, Reserva, RegistroMare, TelemetriaColaborador } from '../types';

export const initialEmpresaConfig: EmpresaConfig = {
  nomeFantasia: "Porto Exclusive Receptivo & Tours",
  razaoSocial: "Porto de Galinhas Turismo e Serviços Receptivos EIRELI",
  cnpj: "34.567.890/0001-12",
  cadastur: "16.034567.10.0001-4",
  telefoneWhatsapp: "(81) 99876-5432",
  emailContato: "reservas@portoexclusive.com.br",
  enderecoCompleto: "Rua Beijupirá, 120 - Galeria das Piscinas, Loja 04 - Centro, Porto de Galinhas, Ipojuca - PE",
  cidadeBase: "Porto de Galinhas - Ipojuca / PE",
  chavePixTipo: "cnpj",
  chavePix: "34.567.890/0001-12",
  nomeTitularPix: "Porto Exclusive Receptivo",
  logoBase64: "",
  percentualSinalPadrao: 30,
  politicaCancelamento: "Cancelamentos com antecedência superior a 24h garantem 100% de remarcação ou devolução de 80% do sinal. Cancelamentos com menos de 24h ou no-show no ponto de embarque implicam na perda integral do sinal pago para cobrir custos de reserva de vaga.",
  termosVoucher: "1. Apresente este voucher impresso ou na tela do smartphone ao guia/motorista credenciado.\n2. O saldo restante deve ser quitado no momento do embarque via PIX, Cartão ou Dinheiro.\n3. Horário de embarque sujeito a tolerância de até 15 minutos em virtude do trânsito na rota dos resorts.\n4. Para passeios de piscinas naturais, os horários de saída são estritamente regulados pela Marinha do Brasil e Tábua de Marés.",
  agencias: [
    "Matriz - Centro de Porto de Galinhas",
    "Balcão - Vila de Porto (Rua Esperança)",
    "Ponto de Apoio - Muro Alto Resorts",
    "Filial - Maragogi AL (Orla)",
    "Parceiro - Praia dos Carneiros (Bora Bora)"
  ]
};

export const hoteisPortoDeGalinhas = [
  { nome: "Nannai Muro Alto Resort", regiao: "Muro Alto", endereco: "Rodovia PE-09, Acesso a Muro Alto" },
  { nome: "Summerville Beach Resort", regiao: "Muro Alto", endereco: "Praia de Muro Alto, Gleba 6-A" },
  { nome: "Samoa Beach Resort", regiao: "Muro Alto", endereco: "Av. Beira Mar, s/n - Muro Alto" },
  { nome: "Marulhos Suítes Resort", regiao: "Muro Alto", endereco: "Estrada de Acesso a Muro Alto" },
  { nome: "Enotel Convention & Spa", regiao: "Praia do Cupe", endereco: "Rodovia PE-09, Km 03 - Cupe" },
  { nome: "The Westin Porto de Galinhas", regiao: "Praia do Cupe", endereco: "Rodovia PE-09, Km 06 - Cupe" },
  { nome: "Hotel Solar Porto de Galinhas", regiao: "Praia do Cupe", endereco: "Rodovia PE-09, Km 07 - Cupe" },
  { nome: "Armação Resort Porto de Galinhas", regiao: "Praia do Cupe", endereco: "Loteamento Merepe II, Quadra G1" },
  { nome: "Vivá Porto de Galinhas Resort", regiao: "Praia do Cupe", endereco: "Av. Beira Mar, Lote A - Cupe" },
  { nome: "Pousada Tabapitanga", regiao: "Praia do Cupe", endereco: "Estrada do Cupe, s/n" },
  { nome: "Pousada Ecoporto", regiao: "Praia do Cupe", endereco: "Loteamento Merepe II, Lote 1" },
  { nome: "Pousada Xalés de Maracaípe", regiao: "Maracaípe", endereco: "Av. Beira Mar, s/n - Maracaípe" },
  { nome: "Pousada dos Coqueiros", regiao: "Maracaípe", endereco: "Praça do Pontal de Maracaípe" },
  { nome: "Pousada Quatro Estações", regiao: "Centro", endereco: "Rua dos Navegantes, 45 - Centro" },
  { nome: "Pousada Recanto dos Corais", regiao: "Centro", endereco: "Rua do Surf, 88 - Centro" },
  { nome: "Pousada Estrela do Mar", regiao: "Centro", endereco: "Rua Beijupirá, 90 - Centro" },
  { nome: "Hotel Serrambi Resort", regiao: "Praia de Serrambi", endereco: "Praia de Serrambi, s/n" },
  { nome: "Pousada Bangalôs do Gameleiro", regiao: "Praia dos Carneiros", endereco: "Praia dos Carneiros, Tamandaré" },
  { nome: "Salinas Maragogi All Inclusive", regiao: "Maragogi AL", endereco: "Rodovia AL-101 Norte, Km 124" },
  { nome: "Grand Oca Maragogi Resort", regiao: "Maragogi AL", endereco: "Praia de Ponta de Mangue, AL" }
];

export const initialPasseios: Passeio[] = [
  {
    id: "PAS-01",
    nome: "Passeio de Buggy Ponta a Ponta (Muro Alto até Pontal de Maracaípe)",
    categoria: "buggy",
    precoPadrao: 420.00,
    tipoCobranca: "veiculo_privativo",
    capacidadeMax: 4,
    duracaoHoras: 6,
    destinoPrincipal: "Porto de Galinhas / Ipojuca",
    dependeMare: true,
    horarioRecomendado: "08:30 às 14:30 (Ajustável à maré)",
    descricaoCurta: "O clássico imperdível de Porto! Paradas no Muro Alto (stand up/caiaque), Praia do Cupe (ondas/piscinas), Coqueiral de Maracaípe e pôr do sol no Pontal com passeio ecológico de jangada para ver cavalos-marinhos.",
    incluso: ["Buggy exclusivo com motorista credenciado pela prefeitura", "Combustível", "Embarque e desembarque no hotel"],
    opcionais: [
      { id: "op-jangada", nome: "Passeio de Jangada no Pontal (Cavalos-marinhos)", preco: 40.00, unidade: "por_pessoa" },
      { id: "op-fotos-drone", nome: "Ensaio Fotográfico com Drone no Coqueiral", preco: 120.00, unidade: "por_servico" }
    ],
    ativo: true
  },
  {
    id: "PAS-02",
    nome: "Catamarã Piscinas Naturais de Maragogi (Galés & Orla)",
    categoria: "catamara",
    precoPadrao: 170.00,
    tipoCobranca: "por_pessoa",
    duracaoHoras: 9,
    destinoPrincipal: "Maragogi - Alagoas",
    dependeMare: true,
    horarioRecomendado: "Saída entre 06:00 e 07:30 conforme a maré",
    descricaoCurta: "Passeio de dia inteiro ao Caribe Brasileiro em Alagoas. Inclui transfer ida e volta em van executiva climatizada com guia + navegação em catamarã até as famosas Galés de Maragogi.",
    incluso: ["Transfer climatizado ida/volta com guia", "Ingresso do Catamarã", "Ponto de apoio com infraestrutura de praia e restaurante"],
    opcionais: [
      { id: "op-mergulho-batismo", nome: "Mergulho de Batismo com Cilindro + Fotos", preco: 180.00, unidade: "por_pessoa" },
      { id: "op-mascara-snorkel", nome: "Aluguel Máscara Snorkel Premium", preco: 25.00, unidade: "por_pessoa" },
      { id: "op-buggy-maragogi", nome: "Passeio de Buggy pelas Praias de Maragogi (Antunes/Burgalhau)", preco: 300.00, unidade: "por_veiculo" }
    ],
    ativo: true
  },
  {
    id: "PAS-03",
    nome: "Praia dos Carneiros com Passeio de Catamarã & Ponto de Apoio",
    categoria: "catamara",
    precoPadrao: 140.00,
    tipoCobranca: "por_pessoa",
    duracaoHoras: 8,
    destinoPrincipal: "Praia dos Carneiros - Tamandaré",
    dependeMare: false,
    horarioRecomendado: "Saída às 08:30 / Retorno às 16:30",
    descricaoCurta: "Uma das praias mais paradisíacas do Brasil. Dia de lazer com base no receptivo Bora Bora ou Mustako, com passeio de catamarã incluso passando pela Igrejinha de São Benedito, Bancos de Areia e Banho de Argila rejuvenescedor.",
    incluso: ["Transporte Van Executiva climatizada", "Guia de Turismo Mtur", "Passeio de Catamarã de 2 horas", "Day-use no receptivo"],
    opcionais: [
      { id: "op-lancha-carneiros", nome: "Upgrade para Lancha Rápida VIP (Privativa)", preco: 450.00, unidade: "por_servico" },
      { id: "op-standup", nome: "Aluguel Stand Up Paddle (1h)", preco: 50.00, unidade: "por_pessoa" }
    ],
    ativo: true
  },
  {
    id: "PAS-04",
    nome: "Ilha de Santo Aleixo (O Paraíso Secreto do Litoral Sul)",
    categoria: "lancha_privativa",
    precoPadrao: 160.00,
    tipoCobranca: "por_pessoa",
    duracaoHoras: 7,
    destinoPrincipal: "Sirinhaém / Ilha de Santo Aleixo",
    dependeMare: false,
    horarioRecomendado: "Saída às 08:30 / Retorno às 15:30",
    descricaoCurta: "Travessia em lancha rápida até a exclusiva ilha vulcânica de águas cristalinas em formato de ferradura. Inclui trilha ecológica guiada até a Praia da Ferradura com piscinas mornas e calmas.",
    incluso: ["Transfer van ida e volta", "Travessia de Lancha Rápida", "Guia ecológico credenciado", "Cadeiras e guarda-sol na praia"],
    opcionais: [
      { id: "op-caiaque", nome: "Aluguel Caiaque Duplo (40 min)", preco: 40.00, unidade: "por_pessoa" }
    ],
    ativo: true
  },
  {
    id: "PAS-05",
    nome: "Passeio Ecológico Calhetas & Cabo de Santo Agostinho (4x4 ou Van)",
    categoria: "4x4_offroad",
    precoPadrao: 130.00,
    tipoCobranca: "por_pessoa",
    duracaoHoras: 7,
    destinoPrincipal: "Cabo de Santo Agostinho",
    dependeMare: false,
    horarioRecomendado: "Saída às 08:30 / Retorno às 16:00",
    descricaoCurta: "Roteiro histórico e de aventura pelas praias de Calhetas, Gaibu, Pedra do Xaréu, mirante da Tirolesa de Calhetas, ruínas do Forte Castelo do Mar e banho de argila medicinal.",
    incluso: ["Transporte 4x4 ou Van Executiva", "Guia regional", "Parada no Mirante da Tirolesa"],
    opcionais: [
      { id: "op-tirolesa", nome: "Ingresso Tirolesa de Calhetas", preco: 35.00, unidade: "por_pessoa" }
    ],
    ativo: true
  },
  {
    id: "PAS-06",
    nome: "Transfer Executivo Aeroporto Recife (REC) ⇄ Porto de Galinhas",
    categoria: "transfer_aeroporto",
    precoPadrao: 220.00,
    tipoCobranca: "veiculo_privativo",
    capacidadeMax: 4,
    duracaoHoras: 1.5,
    destinoPrincipal: "Recife / Porto de Galinhas",
    dependeMare: false,
    horarioRecomendado: "Conforme voo do passageiro",
    descricaoCurta: "Recepção personalizada no desembarque do Aeroporto Internacional dos Guararapes (REC) com placa nominal e transporte privativo com ar-condicionado direto ao resort/hotel em Porto de Galinhas.",
    incluso: ["Veículo Sedan/Spin Executivo com ar", "Pedágio da Rota do Atlântico", "Água mineral gelada a bordo", "Rastreamento do voo em tempo real"],
    opcionais: [
      { id: "op-cadeirinha", nome: "Cadeirinha de Bebê / Assento de Elevação", preco: 0.00, unidade: "por_servico" }
    ],
    ativo: true
  }
];

export const initialMotoristas: MotoristaVeiculo[] = [
  {
    id: "MOT-01",
    nomeMotorista: "José 'Zito' Bugueiro",
    telefone: "(81) 98711-2233",
    veiculoModelo: "Buggy Selvagem 1.6",
    tipoVeiculo: "buggy",
    placaOuRegistro: "BUG-8821 (Prefeitura #042)",
    capacidadePax: 4,
    status: "disponivel",
    observacoes: "Especialista em fotos no coqueiral e dunas de Maracaípe."
  },
  {
    id: "MOT-02",
    nomeMotorista: "Cláudio Santos (Receptivo)",
    telefone: "(81) 99122-4455",
    veiculoModelo: "Mercedes Sprinter 415 Executiva",
    tipoVeiculo: "van",
    placaOuRegistro: "PGT-4E19 (Cadastur)",
    capacidadePax: 15,
    status: "disponivel",
    observacoes: "Rota diária de Maragogi e Carneiros. Ar-condicionado reforçado e Wi-Fi."
  },
  {
    id: "MOT-03",
    nomeMotorista: "Marcos Vinícius",
    telefone: "(81) 99633-7788",
    veiculoModelo: "Chevrolet Spin 7 Lugares",
    tipoVeiculo: "spin_executivo",
    placaOuRegistro: "RCE-9A44",
    capacidadePax: 6,
    status: "disponivel",
    observacoes: "Transfers executivos para Aeroporto do Recife e hotéis de Muro Alto."
  },
  {
    id: "MOT-04",
    nomeMotorista: "Capitão Beto",
    telefone: "(81) 98455-9900",
    veiculoModelo: "Lancha Coral 26 pés (VIP)",
    tipoVeiculo: "lancha",
    placaOuRegistro: "MAR-0918-PE",
    capacidadePax: 10,
    status: "disponivel",
    observacoes: "Embarcação para Carneiros e Ilha de Santo Aleixo com som bluetooth e cooler."
  }
];

export const initialVendedores: PromotorVendedor[] = [
  { id: "VEN-01", nome: "Balcão Loja Matriz", tipo: "balcao_loja", comissaoPadraoPct: 0, telefone: "(81) 99876-5432", ativo: true },
  { id: "VEN-02", nome: "Rogério Silva (Consultor Balcão)", tipo: "balcao_loja", comissaoPadraoPct: 8, telefone: "(81) 98661-1122", chavePix: "rogerio@gmail.com", ativo: true },
  { id: "VEN-03", nome: "Camila Pousadas (Concierge Cupe)", tipo: "parceiro_hotel", comissaoPadraoPct: 10, telefone: "(81) 99344-5566", chavePix: "81993445566", ativo: true },
  { id: "VEN-04", nome: "Manoel 'Neto' (Promotor Orla)", tipo: "promotor_rua", comissaoPadraoPct: 12, telefone: "(81) 98555-4433", chavePix: "manoelneto.pix@banco.com", ativo: true }
];

export const initialTabuaMares: RegistroMare[] = [
  {
    data: "2026-08-21",
    horarioBaixa: "08:15",
    alturaBaixa: 0.1,
    horarioAlta: "14:35",
    alturaAlta: 2.2,
    coeficiente: "Maré Viva / Lua Nova",
    recomendacaoPiscinas: "perfeita",
    janelaIdealPiscinas: "06:45 às 10:00"
  },
  {
    data: "2026-08-22",
    horarioBaixa: "09:02",
    alturaBaixa: 0.2,
    horarioAlta: "15:20",
    alturaAlta: 2.1,
    coeficiente: "Maré Viva / Lua Nova",
    recomendacaoPiscinas: "perfeita",
    janelaIdealPiscinas: "07:30 às 10:45"
  },
  {
    data: "2026-08-23",
    horarioBaixa: "09:50",
    alturaBaixa: 0.3,
    horarioAlta: "16:05",
    alturaAlta: 2.0,
    coeficiente: "Maré Excelente",
    recomendacaoPiscinas: "perfeita",
    janelaIdealPiscinas: "08:15 às 11:30"
  },
  {
    data: "2026-08-24",
    horarioBaixa: "10:38",
    alturaBaixa: 0.4,
    horarioAlta: "16:52",
    alturaAlta: 1.9,
    coeficiente: "Maré Boa",
    recomendacaoPiscinas: "boa",
    janelaIdealPiscinas: "09:00 às 12:15"
  },
  {
    data: "2026-08-25",
    horarioBaixa: "11:30",
    alturaBaixa: 0.5,
    horarioAlta: "17:45",
    alturaAlta: 1.8,
    coeficiente: "Maré Moderada",
    recomendacaoPiscinas: "boa",
    janelaIdealPiscinas: "10:00 às 13:00"
  },
  {
    data: "2026-08-26",
    horarioBaixa: "12:28",
    alturaBaixa: 0.7,
    horarioAlta: "18:40",
    alturaAlta: 1.7,
    coeficiente: "Maré de Quarto Crescente",
    recomendacaoPiscinas: "regular",
    janelaIdealPiscinas: "11:15 às 13:45"
  },
  {
    data: "2026-08-27",
    horarioBaixa: "13:35",
    alturaBaixa: 0.8,
    horarioAlta: "07:20",
    alturaAlta: 1.6,
    coeficiente: "Maré Morta",
    recomendacaoPiscinas: "inapropriada",
    janelaIdealPiscinas: "Apenas praia seca / Passeios terrestres"
  }
];

export const initialReservas: Reserva[] = [
  {
    id: "RSV-849201",
    codigoVoucher: "RSV-849201",
    agenciaEmissora: "Matriz - Centro de Porto de Galinhas",
    dataEmissao: new Date(Date.now() - 3600000 * 5).toISOString(),
    dataPasseio: "2026-08-22",
    horarioEmbarquePrevisto: "07:30",
    clienteNome: "Dr. Eduardo Meirelles",
    clienteTelefone: "(11) 98455-1234",
    clienteCpfPassaporte: "123.456.789-00",
    clienteHotel: "Nannai Muro Alto Resort",
    clienteQuarto: "Bangalô 14",
    passeioId: "PAS-02",
    passeioNome: "Catamarã Piscinas Naturais de Maragogi (Galés & Orla)",
    paxAdultos: 2,
    paxCriancas: 1,
    paxBebes: 0,
    totalPax: 3,
    opcionaisSelecionados: [
      { nome: "Mergulho de Batismo com Cilindro + Fotos", quantidade: 2, valorTotal: 360.00 }
    ],
    valorUnitarioOuBase: 170.00,
    valorOpcionais: 360.00,
    valorDesconto: 0,
    valorTotal: 870.00, // (170 * 3) + 360 = 510 + 360 = 870
    valorSinalPago: 300.00,
    formaPagamentoSinal: "pix",
    valorSaldoRestante: 570.00,
    saldoQuitado: false,
    motoristaVeiculoId: "MOT-02",
    motoristaNome: "Cláudio Santos (Receptivo)",
    motoristaTelefone: "(81) 99122-4455",
    veiculoInfo: "Van Sprinter (PGT-4E19)",
    ordemParada: 1,
    statusEmbarque: "aguardando",
    vendedorId: "VEN-02",
    vendedorNome: "Rogério Silva (Consultor Balcão)",
    comissaoValor: 69.60,
    comissaoPaga: false,
    observacoesInternas: "Cliente VIP, solicita assentos na frente da van para a criança.",
    observacoesVoucher: "Levar toalha de banho, protetor solar e calçado aquático.",
    status: "confirmada"
  },
  {
    id: "RSV-849202",
    codigoVoucher: "RSV-849202",
    agenciaEmissora: "Matriz - Centro de Porto de Galinhas",
    dataEmissao: new Date(Date.now() - 3600000 * 8).toISOString(),
    dataPasseio: "2026-08-22",
    horarioEmbarquePrevisto: "08:15",
    clienteNome: "Juliana Vasconcelos & Família",
    clienteTelefone: "(31) 99188-7744",
    clienteCpfPassaporte: "987.654.321-11",
    clienteHotel: "Summerville Beach Resort",
    clienteQuarto: "Apto 204",
    passeioId: "PAS-01",
    passeioNome: "Passeio de Buggy Ponta a Ponta (Muro Alto até Pontal de Maracaípe)",
    paxAdultos: 4,
    paxCriancas: 0,
    paxBebes: 0,
    totalPax: 4,
    opcionaisSelecionados: [
      { nome: "Passeio de Jangada no Pontal (Cavalos-marinhos)", quantidade: 4, valorTotal: 160.00 }
    ],
    valorUnitarioOuBase: 420.00,
    valorOpcionais: 160.00,
    valorDesconto: 0,
    valorTotal: 580.00,
    valorSinalPago: 200.00,
    formaPagamentoSinal: "cartao_credito",
    valorSaldoRestante: 380.00,
    saldoQuitado: false,
    motoristaVeiculoId: "MOT-01",
    motoristaNome: "José 'Zito' Bugueiro",
    motoristaTelefone: "(81) 98711-2233",
    veiculoInfo: "Buggy Selvagem (#042)",
    ordemParada: 2,
    statusEmbarque: "aguardando",
    vendedorId: "VEN-03",
    vendedorNome: "Camila Pousadas (Concierge Cupe)",
    comissaoValor: 58.00,
    comissaoPaga: false,
    observacoesInternas: "Casal comemorando aniversário de casamento.",
    observacoesVoucher: "Parada para almoço no Bar da Praia em Muro Alto.",
    status: "confirmada"
  },
  {
    id: "RSV-849203",
    codigoVoucher: "RSV-849203",
    agenciaEmissora: "Balcão - Vila de Porto (Rua Esperança)",
    dataEmissao: new Date(Date.now() - 3600000 * 20).toISOString(),
    dataPasseio: "2026-08-21",
    horarioEmbarquePrevisto: "08:30",
    clienteNome: "Rodrigo Mendonça",
    clienteTelefone: "(21) 97655-4321",
    clienteHotel: "Hotel Solar Porto de Galinhas",
    passeioId: "PAS-03",
    passeioNome: "Praia dos Carneiros com Passeio de Catamarã & Ponto de Apoio",
    paxAdultos: 2,
    paxCriancas: 0,
    paxBebes: 0,
    totalPax: 2,
    valorUnitarioOuBase: 140.00,
    valorOpcionais: 0,
    valorDesconto: 0,
    valorTotal: 280.00,
    valorSinalPago: 100.00,
    formaPagamentoSinal: "pix",
    valorSaldoRestante: 0,
    formaPagamentoSaldo: "pix",
    saldoQuitado: true,
    dataQuitacaoSaldo: new Date().toISOString(),
    motoristaVeiculoId: "MOT-02",
    motoristaNome: "Cláudio Santos (Receptivo)",
    motoristaTelefone: "(81) 99122-4455",
    veiculoInfo: "Van Sprinter (PGT-4E19)",
    ordemParada: 1,
    statusEmbarque: "embarcado_saldo_pago",
    horaEmbarqueEfetivo: "08:32",
    vendedorId: "VEN-02",
    vendedorNome: "Rogério Silva (Consultor Balcão)",
    comissaoValor: 22.40,
    comissaoPaga: true,
    observacoesInternas: "Embarque realizado com sucesso, saldo recebido via PIX direto com o guia.",
    status: "embarcado"
  }
];

export const initialTelemetriaColaboradores: TelemetriaColaborador[] = [
  {
    id: "MOT-01",
    tipo: "motorista",
    nome: "José 'Zito' Bugueiro",
    telefone: "(81) 98711-2233",
    statusConexao: "sem_sinal",
    bateriaPct: null,
    velocidadeKmH: null,
    latitude: null,
    longitude: null,
    localizacaoNome: "Aguardando transmissão GPS do smartphone",
    regiao: "Ipojuca / Porto de Galinhas - PE",
    ultimoPing: null,
    precisaoMetros: null,
    operadoraCelular: null,
    detalhesOperacao: {
      veiculoOuPonto: "Buggy Selvagem 1.6 (#042)",
      placaOuChave: "BUG-8821",
      totalPassageirosOuVendasHoje: 4,
      valorAcumuladoHoje: 580.00,
      proximoPontoOuUltimoVoucher: "Aguardando início de rota",
      emMovimento: false
    },
    historicoPontos: []
  },
  {
    id: "MOT-02",
    tipo: "motorista",
    nome: "Cláudio Santos (Receptivo)",
    telefone: "(81) 99122-4455",
    statusConexao: "sem_sinal",
    bateriaPct: null,
    velocidadeKmH: null,
    latitude: null,
    longitude: null,
    localizacaoNome: "Aguardando transmissão GPS do smartphone",
    regiao: "Ipojuca / Porto de Galinhas - PE",
    ultimoPing: null,
    precisaoMetros: null,
    operadoraCelular: null,
    detalhesOperacao: {
      veiculoOuPonto: "Van Sprinter Executiva 415",
      placaOuChave: "PGT-4E19",
      totalPassageirosOuVendasHoje: 12,
      valorAcumuladoHoje: 1150.00,
      proximoPontoOuUltimoVoucher: "Aguardando início de rota",
      emMovimento: false
    },
    historicoPontos: []
  },
  {
    id: "MOT-03",
    tipo: "motorista",
    nome: "Marcos Vinícius",
    telefone: "(81) 99633-7788",
    statusConexao: "sem_sinal",
    bateriaPct: null,
    velocidadeKmH: null,
    latitude: null,
    longitude: null,
    localizacaoNome: "Aguardando transmissão GPS do smartphone",
    regiao: "Ipojuca / Porto de Galinhas - PE",
    ultimoPing: null,
    precisaoMetros: null,
    operadoraCelular: null,
    detalhesOperacao: {
      veiculoOuPonto: "Spin Executivo 7 Lugares",
      placaOuChave: "RCE-9A44",
      totalPassageirosOuVendasHoje: 4,
      valorAcumuladoHoje: 440.00,
      proximoPontoOuUltimoVoucher: "Aguardando início de rota",
      emMovimento: false
    },
    historicoPontos: []
  },
  {
    id: "MOT-04",
    tipo: "motorista",
    nome: "Capitão Beto",
    telefone: "(81) 98455-9900",
    statusConexao: "sem_sinal",
    bateriaPct: null,
    velocidadeKmH: null,
    latitude: null,
    longitude: null,
    localizacaoNome: "Aguardando transmissão GPS do smartphone",
    regiao: "Ipojuca / Porto de Galinhas - PE",
    ultimoPing: null,
    precisaoMetros: null,
    operadoraCelular: null,
    detalhesOperacao: {
      veiculoOuPonto: "Lancha Coral 26 VIP",
      placaOuChave: "MAR-0918-PE",
      totalPassageirosOuVendasHoje: 8,
      valorAcumuladoHoje: 1280.00,
      proximoPontoOuUltimoVoucher: "Aguardando início de rota",
      emMovimento: false
    },
    historicoPontos: []
  },
  {
    id: "VEN-02",
    tipo: "vendedor",
    nome: "Rogério Silva (Consultor Balcão)",
    telefone: "(81) 98661-1122",
    statusConexao: "sem_sinal",
    bateriaPct: null,
    velocidadeKmH: null,
    latitude: null,
    longitude: null,
    localizacaoNome: "Aguardando transmissão GPS do promotor",
    regiao: "Vila de Porto de Galinhas - PE",
    ultimoPing: null,
    precisaoMetros: null,
    operadoraCelular: null,
    detalhesOperacao: {
      veiculoOuPonto: "Matriz - Centro de Porto de Galinhas",
      placaOuChave: "Chave PIX: rogerio@gmail.com",
      totalPassageirosOuVendasHoje: 5,
      valorAcumuladoHoje: 1150.00,
      proximoPontoOuUltimoVoucher: "Atendimento presencial",
      emMovimento: false
    },
    historicoPontos: []
  },
  {
    id: "VEN-03",
    tipo: "vendedor",
    nome: "Camila Pousadas (Concierge Cupe)",
    telefone: "(81) 99344-5566",
    statusConexao: "sem_sinal",
    bateriaPct: null,
    velocidadeKmH: null,
    latitude: null,
    longitude: null,
    localizacaoNome: "Aguardando transmissão GPS do promotor",
    regiao: "Praia do Cupe - PE",
    ultimoPing: null,
    precisaoMetros: null,
    operadoraCelular: null,
    detalhesOperacao: {
      veiculoOuPonto: "Ponto Concierge Cupe Resorts",
      placaOuChave: "Chave PIX: (81) 99344-5566",
      totalPassageirosOuVendasHoje: 4,
      valorAcumuladoHoje: 580.00,
      proximoPontoOuUltimoVoucher: "Atendimento presencial",
      emMovimento: false
    },
    historicoPontos: []
  },
  {
    id: "VEN-04",
    tipo: "vendedor",
    nome: "Manoel 'Neto' (Promotor Orla)",
    telefone: "(81) 98555-4433",
    statusConexao: "sem_sinal",
    bateriaPct: null,
    velocidadeKmH: null,
    latitude: null,
    longitude: null,
    localizacaoNome: "Aguardando transmissão GPS do promotor",
    regiao: "Vila de Porto de Galinhas - PE",
    ultimoPing: null,
    precisaoMetros: null,
    operadoraCelular: null,
    detalhesOperacao: {
      veiculoOuPonto: "Orla - Calçadão das Piscinas Naturais",
      placaOuChave: "Chave PIX: manoelneto.pix@banco.com",
      totalPassageirosOuVendasHoje: 2,
      valorAcumuladoHoje: 320.00,
      proximoPontoOuUltimoVoucher: "Atendimento presencial",
      emMovimento: false
    },
    historicoPontos: []
  }
];
