import { Router } from 'express';
import { 
  getAdminDashboard, 
  getAllCreators, 
  getAllWithdrawals, 
  updateWithdrawalStatus 
} from '../controllers/adminController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Todas as rotas admin precisam de autenticação
router.use(authMiddleware);

// Dashboard admin
router.get('/dashboard', getAdminDashboard);

// Gerenciar criadores
router.get('/creators', getAllCreators);

// Gerenciar saques
router.get('/withdrawals', getAllWithdrawals);
router.put('/withdrawals/:withdrawalId/status', updateWithdrawalStatus);

export default router;