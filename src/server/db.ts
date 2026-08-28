import fs from 'fs';
import path from 'path';
import { 
  Loja, 
  UsuarioAuth, 
  Passeio, 
  MotoristaVeiculo, 
  PromotorVendedor, 
  Reserva, 
  TransacaoCaixa, 
  FechamentoCaixaDia, 
  TelemetriaColaborador, 
  RegistroMare 
} from '../types';
import { 
  initialPasseios, 
  initialMotoristas, 
  initialVendedores, 
  initialReservas, 
  initialTabuaMares, 
  initialTelemetriaColaboradores 
} from '../data/mockData';
import { 
  initialLojas, 
  initialUsuariosAuth, 
  initialPasseiosLoja2, 
  initialMotoristasLoja2, 
  initialVendedoresLoja2, 
  initialReservasLoja2, 
  initialTransacoesLoja2 
} from '../data/lojasAuthData';

export interface DatabaseSchema {
  lojas: Loja[];
  usuarios: UsuarioAuth[];
  passeios: Passeio[];
  motoristas: MotoristaVeiculo[];
  vendedores: PromotorVendedor[];
  reservas: Reserva[];
  transacoes: TransacaoCaixa[];
  fechamentos: FechamentoCaixaDia[];
  telemetria: TelemetriaColaborador[];
  tabuaMares: RegistroMare[];
  updatedAt: string;
  version: number;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DB_DIR, 'database.json');

// Gera estado inicial padrão do banco centralizado
function getInitialSeedDatabase(): DatabaseSchema {
  const txBaseL1: TransacaoCaixa[] = [
    {
      id: 'TX-01',
      store_id: 'LOJA_001',
      dataHora: new Date(Date.now() - 3600000 * 5).toISOString(),
      tipo: 'entrada_sinal',
      reservaId: 'RSV-849201',
      codigoVoucher: 'RSV-849201',
      agencia: 'Matriz - Centro de Porto de Galinhas',
      valor: 300.00,
      formaPagamento: 'pix',
      descricao: 'Sinal recebido - Reserva RSV-849201 (Dr. Eduardo Meirelles)',
      operadorNome: 'Rogério Silva'
    },
    {
      id: 'TX-02',
      store_id: 'LOJA_001',
      dataHora: new Date(Date.now() - 3600000 * 8).toISOString(),
      tipo: 'entrada_sinal',
      reservaId: 'RSV-849202',
      codigoVoucher: 'RSV-849202',
      agencia: 'Matriz - Centro de Porto de Galinhas',
      valor: 200.00,
      formaPagamento: 'cartao_credito',
      descricao: 'Sinal recebido - Reserva RSV-849202 (Juliana Vasconcelos)',
      operadorNome: 'Rogério Silva'
    },
    {
      id: 'TX-03',
      store_id: 'LOJA_001',
      dataHora: new Date(Date.now() - 3600000 * 20).toISOString(),
      tipo: 'entrada_sinal',
      reservaId: 'RSV-849203',
      codigoVoucher: 'RSV-849203',
      agencia: 'Balcão - Vila de Porto (Rua Esperança)',
      valor: 100.00,
      formaPagamento: 'pix',
      descricao: 'Sinal recebido - Reserva RSV-849203 (Rodrigo Mendonça)',
      operadorNome: 'Rogério Silva'
    },
    {
      id: 'TX-04',
      store_id: 'LOJA_001',
      dataHora: new Date().toISOString(),
      tipo: 'entrada_saldo_embarque',
      reservaId: 'RSV-849203',
      codigoVoucher: 'RSV-849203',
      agencia: 'Balcão - Vila de Porto (Rua Esperança)',
      valor: 180.00,
      formaPagamento: 'pix',
      descricao: 'Saldo de embarque recebido - RSV-849203 (Rodrigo Mendonça)',
      operadorNome: 'Cláudio Santos (Motorista)'
    }
  ];

  const baseL1Passeios = initialPasseios.map(p => ({ ...p, store_id: 'LOJA_001' }));
  const baseL1Motoristas = initialMotoristas.map(m => ({ ...m, store_id: 'LOJA_001' }));
  const baseL1Vendedores = initialVendedores.map(v => ({ ...v, store_id: 'LOJA_001' }));
  const baseL1Reservas = initialReservas.map(r => ({ ...r, store_id: 'LOJA_001' }));
  const baseL1Telemetria = initialTelemetriaColaboradores.map(t => ({ ...t, store_id: 'LOJA_001' }));

  return {
    lojas: initialLojas,
    usuarios: initialUsuariosAuth,
    passeios: [...baseL1Passeios, ...initialPasseiosLoja2],
    motoristas: [...baseL1Motoristas, ...initialMotoristasLoja2],
    vendedores: [...baseL1Vendedores, ...initialVendedoresLoja2],
    reservas: [...baseL1Reservas, ...initialReservasLoja2],
    transacoes: [...txBaseL1, ...initialTransacoesLoja2],
    fechamentos: [],
    telemetria: baseL1Telemetria,
    tabuaMares: initialTabuaMares,
    updatedAt: new Date().toISOString(),
    version: 3
  };
}

// Memória em runtime como fallback de altíssima performance
let memoryDb: DatabaseSchema = getInitialSeedDatabase();

// Garante que o arquivo do banco existe
export function initServerDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialSeedDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      memoryDb = initial;
      return initial;
    }

    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed: DatabaseSchema = JSON.parse(content);

    // Garante que o Master oficial está sempre cadastrado e atualizado
    const masterOficial: UsuarioAuth = {
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
    };

    let usuariosAtualizados = parsed.usuarios || [];
    const idxMaster = usuariosAtualizados.findIndex(u => u.perfil === 'master' || u.email.toLowerCase() === 'rogerionegocios682@gmail.com');
    if (idxMaster >= 0) {
      usuariosAtualizados[idxMaster] = {
        ...usuariosAtualizados[idxMaster],
        ...masterOficial
      };
    } else {
      usuariosAtualizados = [masterOficial, ...usuariosAtualizados];
    }
    parsed.usuarios = usuariosAtualizados;

    memoryDb = parsed;
    return parsed;
  } catch (err) {
    console.error('[DB] Erro ao ler banco de dados:', err);
    return memoryDb;
  }
}

// Retorna o estado atual do banco central
export function getDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(content);
    }
  } catch (err) {
    console.warn('[DB] Usando banco de dados em memória:', err);
  }

  // Assegura existência do master
  const hasMaster = memoryDb.usuarios.some(u => u.perfil === 'master' && u.email === 'rogerionegocios682@gmail.com');
  if (!hasMaster) {
    memoryDb.usuarios.unshift({
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
    });
  }

  return memoryDb;
}

// Salva o banco de dados centralizado de forma atômica
export function saveDatabase(data: Partial<DatabaseSchema>): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    const current = getDatabase();
    const updated: DatabaseSchema = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString()
    };

    // Sempre blinda o Master
    const idx = updated.usuarios.findIndex(u => u.perfil === 'master' || u.email.toLowerCase() === 'rogerionegocios682@gmail.com');
    const masterObj: UsuarioAuth = {
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
    };

    if (idx >= 0) {
      updated.usuarios[idx] = { ...updated.usuarios[idx], ...masterObj };
    } else {
      updated.usuarios.unshift(masterObj);
    }

    memoryDb = updated;
    fs.writeFileSync(DB_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('[DB] Erro ao salvar banco de dados:', err);
    return memoryDb;
  }
}
