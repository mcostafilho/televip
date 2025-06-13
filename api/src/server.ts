import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import routes from './routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// CORS configurado para permitir React
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Middlewares
app.use(express.json());

// Rotas
app.use('/api', routes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API TeleVIP funcionando!' });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'TeleVIP API is running!',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`🚀 API rodando na porta ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🔗 CORS habilitado para http://localhost:3000`);
    console.log(`📊 PostgreSQL conectado`);
  } catch (error) {
    console.error('❌ Erro ao conectar com banco:', error);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});