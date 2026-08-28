import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { handleApiRoute } from './src/server/apiRouter';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // Rotas de API prioritárias
  app.use('/api', async (req, res) => {
    try {
      const result = await handleApiRoute({
        method: req.method,
        url: `/api${req.url}`,
        body: req.body,
        headers: req.headers as any
      });
      res.status(result.status).json(result.data);
    } catch (err: any) {
      res.status(500).json({ sucesso: false, erro: err?.message || 'Erro interno no servidor' });
    }
  });

  // Middleware Vite em desenvolvimento / Arquivos estáticos em produção
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TurismoOS Central Server rodando na porta ${PORT}`);
  });
}

startServer();

