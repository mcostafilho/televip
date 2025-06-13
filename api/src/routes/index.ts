import { Router } from 'express';
import { register, login, me } from '../controllers/authController';
import { getDashboard, requestWithdrawal } from '../controllers/dashboardController';
import { authMiddleware } from '../middlewares/auth';
import adminRoutes from './admin';

const router = Router();

// Rotas públicas
router.post('/auth/register', register);
router.post('/auth/login', login);

// Middleware de autenticação para rotas protegidas
router.use(authMiddleware);

// Rotas de criadores
router.get('/auth/me', me);
router.get('/dashboard', getDashboard);
router.post('/withdrawals', requestWithdrawal);

// ROTAS ADMIN
router.use('/admin', adminRoutes);

// Rotas temporárias (dados mockados)
router.get('/groups', (req, res) => {
  res.json({ 
    success: true, 
    data: [
      { id: '1', name: 'Trading VIP Premium', subscribers: 0, revenue: 0, status: 'active' }
    ]
  });
});

router.get('/groups/:id', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      id: req.params.id,
      name: 'Trading VIP Premium',
      description: 'Sinais premium de trading',
      subscribers: 0,
      revenue: 0
    }
  });
});

export default router;