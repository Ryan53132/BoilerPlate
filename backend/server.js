import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createTables, pool } from './database/schema.js';

import registerRouter from './auth/register.js';
import loginRouter from './auth/login.js';
import refreshRouter from './auth/refresh.js';
import authenticate from './auth/middleware/auth.middleware.js';
import logoutRouter from './auth/logout.js';

const app = express();

const PORT = process.env.PORT || 3000;
const FRONT_URL = process.env.FRONT_URL || 'http://localhost:5173';

// =====================================================
// SEGURANÇA HTTP
// =====================================================

app.use(
  helmet()
);


// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: FRONT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);


// =====================================================
// LIMITE GLOBAL DE REQUISIÇÃO
// =====================================================

// Limita o body JSON a 10 KB
app.use(
  express.json({
    limit: '10kb'
  })
);

// Limita também formulários
app.use(
  express.urlencoded({
    extended: false,
    limit: '10kb'
  })
);


// =====================================================
// COOKIES
// =====================================================

app.use(cookieParser());


// =====================================================
// RATE LIMIT GLOBAL
// =====================================================

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  // Máximo de requisições por IP
  max: 100,

  standardHeaders: 'draft-8',
  legacyHeaders: false,

  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.'
  }
});

app.use(globalLimiter);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok'
  });
});

// =====================================================
// ROTAS
// =====================================================

app.use('/api/auth', logoutRouter);
app.use('/api/auth', registerRouter);
app.use('/api/auth', loginRouter);
app.use('/api/auth', refreshRouter);
app.get('/menu', authenticate, (req, res) => {
  res.status(200).json({
    message: 'Acesso permitido ao menu',
    userId: req.user.id
  });
});

// =====================================================
// ROTA 404
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});


// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error(err);

  // Payload maior que o limite configurado
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Requisição muito grande'
    });
  }

  // JSON inválido
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      error: 'JSON inválido'
    });
  }

  res.status(500).json({
    error: 'Erro interno do servidor'
  });
});

// =====================================================
// START SERVER
// =====================================================

const startServer = async () => {
  try {
    await createTables();
  } catch (error) {
    console.error('❌ Não foi possível inicializar o banco de dados:', error);
    await pool.end();
    process.exitCode = 1;
    return;
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();