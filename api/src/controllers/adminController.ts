import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface para o usuário autenticado
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

// Lista de admins autorizados (você pode expandir isso)
const ADMIN_EMAILS = ['mauro_lcf@example.com', 'admin@televip.com'];

const isAdmin = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email);
};

export const getAdminDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userEmail = authReq.user.email;
    
    if (!isAdmin(userEmail)) {
      res.status(403).json({
        success: false,
        error: 'Acesso negado. Apenas administradores.'
      });
      return;
    }

    // Estatísticas gerais
    const totalCreators = await prisma.creator.count();
    const totalGroups = await prisma.group.count();
    const totalSubscriptions = await prisma.subscription.count();
    
    const totalTransactions = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
        fee: true,
        netAmount: true
      },
      where: {
        status: 'completed'
      }
    });

    const pendingWithdrawals = await prisma.withdrawal.findMany({
      where: {
        status: 'pending'
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const recentCreators = await prisma.creator.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        createdAt: true,
        _count: {
          select: {
            groups: true,
            transactions: true
          }
        }
      }
    });

    // Receita mensal dos últimos 6 meses
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthData = await prisma.transaction.aggregate({
        _sum: {
          amount: true,
          fee: true
        },
        _count: true,
        where: {
          status: 'completed',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });

      monthlyRevenue.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        revenue: monthData._sum.amount || 0,
        commission: monthData._sum.fee || 0,
        transactions: monthData._count
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalCreators,
          totalGroups,
          totalSubscriptions,
          totalRevenue: totalTransactions._sum.amount || 0,
          totalCommission: totalTransactions._sum.fee || 0,
          pendingWithdrawalsCount: pendingWithdrawals.length,
          pendingWithdrawalsAmount: pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0)
        },
        pendingWithdrawals,
        recentCreators,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

export const getAllCreators = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userEmail = authReq.user.email;
    
    if (!isAdmin(userEmail)) {
      res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
      return;
    }

    const creators = await prisma.creator.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            groups: true,
            transactions: true,
            withdrawals: true
          }
        },
        transactions: {
          where: {
            status: 'completed'
          },
          select: {
            netAmount: true
          }
        }
      }
    });

    const creatorsWithStats = creators.map(creator => ({
      id: creator.id,
      name: creator.name,
      email: creator.email,
      username: creator.username,
      createdAt: creator.createdAt,
      stats: {
        groups: creator._count.groups,
        transactions: creator._count.transactions,
        withdrawals: creator._count.withdrawals,
        totalEarnings: creator.transactions.reduce((sum, t) => sum + t.netAmount, 0)
      }
    }));

    res.json({
      success: true,
      data: creatorsWithStats
    });
  } catch (error) {
    console.error('Get creators error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

export const getAllWithdrawals = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userEmail = authReq.user.email;
    
    if (!isAdmin(userEmail)) {
      res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
      return;
    }

    const withdrawals = await prisma.withdrawal.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
            username: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: withdrawals
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

export const updateWithdrawalStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userEmail = authReq.user.email;
    
    if (!isAdmin(userEmail)) {
      res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
      return;
    }

    const { withdrawalId } = req.params;
    const { status } = req.body;

    if (!['completed', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Status inválido. Use: completed ou rejected'
      });
      return;
    }

    const withdrawal = await prisma.withdrawal.update({
      where: {
        id: withdrawalId
      },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`💰 Saque ${status}: R$ ${withdrawal.amount} para ${withdrawal.creator.name}`);

    res.json({
      success: true,
      message: `Saque ${status === 'completed' ? 'aprovado' : 'rejeitado'} com sucesso`,
      data: withdrawal
    });
  } catch (error) {
    console.error('Update withdrawal error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};