import { getDatabase, saveDatabase, initServerDatabase } from './db';
import { UsuarioAuth, Loja, Reserva, TransacaoCaixa, MotoristaVeiculo, PromotorVendedor, Passeio, FechamentoCaixaDia, TelemetriaColaborador, RegistroMare } from '../types';

// Inicializa banco no boot
initServerDatabase();

export interface ApiRequest {
  method: string;
  url: string;
  body?: any;
  headers?: Record<string, string | string[] | undefined>;
}

export interface ApiResponse {
  status: number;
  data: any;
  headers?: Record<string, string>;
}

// Router central de rotas de API
export async function handleApiRoute(req: ApiRequest): Promise<ApiResponse> {
  const urlPath = req.url.split('?')[0];
  const method = req.method.toUpperCase();

  // 1. Health Check
  if (urlPath === '/api/health' && method === 'GET') {
    return {
      status: 200,
      data: { status: 'online', timestamp: new Date().toISOString(), centralDb: true }
    };
  }

  // 2. Login de Loja (Área do Cliente)
  if (urlPath === '/api/auth/login' && method === 'POST') {
    const { loginOuEmail, senha } = req.body || {};
    if (!loginOuEmail || !senha) {
      return {
        status: 400,
        data: { sucesso: false, mensagem: 'E-mail e senha são obrigatórios.' }
      };
    }

    const termo = String(loginOuEmail).trim().toLowerCase();
    const senhaLimpa = String(senha).trim();
    const db = getDatabase();

    const usuarioEncontrado = db.usuarios.find(u =>
      (u.email.trim().toLowerCase() === termo || u.usuarioLogin.trim().toLowerCase() === termo)
    );

    if (!usuarioEncontrado || usuarioEncontrado.senha.trim() !== senhaLimpa) {
      return {
        status: 401,
        data: { sucesso: false, mensagem: 'E-mail ou senha incorretos.' }
      };
    }

    if (usuarioEncontrado.status === 'inativo') {
      return {
        status: 403,
        data: { sucesso: false, mensagem: 'Seu acesso está temporariamente desativado. Entre em contato com o administrador.' }
      };
    }

    // Se for usuário de loja, valida a loja correspondente
    if (usuarioEncontrado.perfil !== 'master') {
      const lojaDoUsuario = db.lojas.find(l => l.id === usuarioEncontrado.store_id);
      if (!lojaDoUsuario) {
        return {
          status: 404,
          data: { sucesso: false, mensagem: 'Loja vinculada não encontrada no sistema central.' }
        };
      }
      if (lojaDoUsuario.status === 'inativa') {
        return {
          status: 403,
          data: { sucesso: false, mensagem: 'Seu acesso está temporariamente desativado. Entre em contato com o administrador.' }
        };
      }

      // Atualiza último acesso
      usuarioEncontrado.ultimoAcesso = new Date().toISOString();
      saveDatabase({ usuarios: db.usuarios });

      return {
        status: 200,
        data: {
          sucesso: true,
          usuario: usuarioEncontrado,
          loja: lojaDoUsuario,
          store_id: usuarioEncontrado.store_id,
          token: `TOKEN-${usuarioEncontrado.id}-${Date.now()}`
        }
      };
    }

    // Se um master tentar fazer login pela área de loja
    return {
      status: 200,
      data: {
        sucesso: true,
        usuario: usuarioEncontrado,
        store_id: 'ALL',
        token: `TOKEN-${usuarioEncontrado.id}-${Date.now()}`
      }
    };
  }

  // 3. Login MASTER
  if (urlPath === '/api/auth/master-login' && method === 'POST') {
    const { email, senha } = req.body || {};
    if (!email || !senha) {
      return {
        status: 400,
        data: { sucesso: false, mensagem: 'E-mail e senha são obrigatórios.' }
      };
    }

    const emailLimpo = String(email).trim().toLowerCase();
    const senhaLimpa = String(senha).trim();
    const db = getDatabase();

    const masterUsuario = db.usuarios.find(u =>
      (u.perfil === 'master' || u.store_id === 'ALL') &&
      (u.email.trim().toLowerCase() === emailLimpo || u.usuarioLogin.trim().toLowerCase() === emailLimpo)
    );

    // Valida credenciais (suporta master padrão ou usuário master cadastrado)
    const ehMasterPadrao = (emailLimpo === 'rogerionegocios682@gmail.com' || emailLimpo === 'master') && senhaLimpa === '@eRro404';
    const ehMasterDb = masterUsuario && masterUsuario.senha.trim() === senhaLimpa;

    if (!ehMasterPadrao && !ehMasterDb) {
      return {
        status: 401,
        data: { sucesso: false, mensagem: 'E-mail ou senha Master incorretos.' }
      };
    }

    const usuarioRetorno: UsuarioAuth = masterUsuario || {
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

    usuarioRetorno.ultimoAcesso = new Date().toISOString();
    return {
      status: 200,
      data: {
        sucesso: true,
        usuario: usuarioRetorno,
        token: `TOKEN-MASTER-${Date.now()}`
      }
    };
  }

  // 4. Buscar Estado Centralizado de Dados
  if (urlPath === '/api/data' && method === 'GET') {
    const db = getDatabase();
    return {
      status: 200,
      data: {
        sucesso: true,
        lojas: db.lojas,
        usuarios: db.usuarios,
        passeios: db.passeios,
        motoristas: db.motoristas,
        vendedores: db.vendedores,
        reservas: db.reservas,
        transacoes: db.transacoes,
        fechamentos: db.fechamentos,
        telemetria: db.telemetria,
        tabuaMares: db.tabuaMares,
        updatedAt: db.updatedAt
      }
    };
  }

  // 5. Sincronização Geral de Estado Central (Sync Bidirecional)
  if (urlPath === '/api/sync' && method === 'POST') {
    const payload = req.body || {};
    const db = getDatabase();

    const updatedData: Partial<typeof db> = {};

    if (payload.lojas && Array.isArray(payload.lojas)) {
      updatedData.lojas = payload.lojas;
    }
    if (payload.usuarios && Array.isArray(payload.usuarios)) {
      updatedData.usuarios = payload.usuarios;
    }
    if (payload.passeios && Array.isArray(payload.passeios)) {
      updatedData.passeios = payload.passeios;
    }
    if (payload.motoristas && Array.isArray(payload.motoristas)) {
      updatedData.motoristas = payload.motoristas;
    }
    if (payload.vendedores && Array.isArray(payload.vendedores)) {
      updatedData.vendedores = payload.vendedores;
    }
    if (payload.reservas && Array.isArray(payload.reservas)) {
      updatedData.reservas = payload.reservas;
    }
    if (payload.transacoes && Array.isArray(payload.transacoes)) {
      updatedData.transacoes = payload.transacoes;
    }
    if (payload.fechamentos && Array.isArray(payload.fechamentos)) {
      updatedData.fechamentos = payload.fechamentos;
    }
    if (payload.telemetria && Array.isArray(payload.telemetria)) {
      updatedData.telemetria = payload.telemetria;
    }
    if (payload.tabuaMares && Array.isArray(payload.tabuaMares)) {
      updatedData.tabuaMares = payload.tabuaMares;
    }

    const saved = saveDatabase(updatedData);

    return {
      status: 200,
      data: {
        sucesso: true,
        mensagem: 'Dados sincronizados com o banco de dados central com sucesso.',
        ...saved
      }
    };
  }

  // 6. Criar / Atualizar Reserva
  if (urlPath === '/api/reservas' && method === 'POST') {
    const reserva: Reserva = req.body;
    if (!reserva || !reserva.id) {
      return { status: 400, data: { sucesso: false, mensagem: 'Dados da reserva inválidos.' } };
    }

    const db = getDatabase();
    const existingIndex = db.reservas.findIndex(r => r.id === reserva.id);
    let novasReservas = [...db.reservas];
    if (existingIndex >= 0) {
      novasReservas[existingIndex] = reserva;
    } else {
      novasReservas.unshift(reserva);
    }

    saveDatabase({ reservas: novasReservas });
    return { status: 200, data: { sucesso: true, reserva } };
  }

  // 7. Criar / Atualizar Loja & Acesso
  if (urlPath === '/api/lojas' && method === 'POST') {
    const { loja, usuarioAcesso } = req.body || {};
    if (!loja || !loja.id) {
      return { status: 400, data: { sucesso: false, mensagem: 'Dados da loja inválidos.' } };
    }

    const db = getDatabase();
    const existingLojaIdx = db.lojas.findIndex(l => l.id === loja.id);
    let novasLojas = [...db.lojas];
    if (existingLojaIdx >= 0) {
      novasLojas[existingLojaIdx] = loja;
    } else {
      novasLojas.push(loja);
    }

    let novosUsuarios = [...db.usuarios];
    if (usuarioAcesso) {
      const existingUserIdx = novosUsuarios.findIndex(u => u.store_id === loja.id);
      if (existingUserIdx >= 0) {
        novosUsuarios[existingUserIdx] = {
          ...novosUsuarios[existingUserIdx],
          ...usuarioAcesso,
          store_id: loja.id
        };
      } else {
        novosUsuarios.push({
          ...usuarioAcesso,
          store_id: loja.id
        });
      }
    }

    saveDatabase({ lojas: novasLojas, usuarios: novosUsuarios });
    return { status: 200, data: { sucesso: true, loja } };
  }

  return {
    status: 404,
    data: { sucesso: false, mensagem: `Rota não encontrada: ${method} ${urlPath}` }
  };
}
