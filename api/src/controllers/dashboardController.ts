import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // Buscar dados do criador
    const creator = await prisma.creator.findUnique({
      where: { id: userId },
      include: {
        groups: {
          include: {
            subscriptions: {
              include: {
                plan: true
              }
            }
          }
        },
        transactions: {
          where: {
            status: 'completed'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        withdrawals: {
          where: {
            status: 'pending'
          }
        }
      }
    });

    if (!creator) {
      res.status(404).json({
        success: false,
        error: 'Criador não encontrado'
      });
      return;
    }

    // Calcular estatísticas
    const allSubscriptions = creator.groups.flatMap(group => group.subscriptions);
    const activeSubscriptions = allSubscriptions.filter(sub => sub.status === 'active');
    
    const totalRevenue = creator.transactions.reduce((sum, transaction) => sum + transaction.netAmount, 0);
    const monthlyRevenue = creator.transactions
      .filter(t => {
        const transactionMonth = new Date(t.createdAt).getMonth();
        const currentMonth = new Date().getMonth();
        return transactionMonth === currentMonth;
      })
      .reduce((sum, transaction) => sum + transaction.netAmount, 0);

    const pendingWithdrawals = creator.withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

    // Dados para gráfico mensal (últimos 6 meses)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      const monthTransactions = creator.transactions.filter(t => {
        const tDate = new Date(t.createdAt);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });
      
      const monthSubscriptions = allSubscriptions.filter(s => {
        const sDate = new Date(s.createdAt);
        return sDate.getMonth() === date.getMonth() && sDate.getFullYear() === date.getFullYear();
      });

      monthlyData.push({
        month: month.charAt(0).toUpperCase() + month.slice(1),
        subscribers: monthSubscriptions.length,
        revenue: monthTransactions.reduce((sum, t) => sum + t.netAmount, 0)
      });
    }

    // Assinantes recentes
    const recentSubscriptions = allSubscriptions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(sub => ({
        id: sub.id,
        user: `Usuário ${sub.userId.substring(0, 8)}...`, // Por privacidade
        plan: sub.plan.name,
        amount: sub.plan.price,
        date: sub.createdAt.toISOString().split('T')[0],
        status: sub.status
      }));

    res.json({
      success: true,
      data: {
        user: {
          name: creator.name,
          username: creator.username,
          email: creator.email
        },
        stats: {
          totalSubscribers: allSubscriptions.length,
          activeSubscribers: activeSubscriptions.length,
          monthlyRevenue: monthlyRevenue,
          totalRevenue: totalRevenue,
          pendingWithdrawals: pendingWithdrawals
        },
        recentSubscriptions,
        monthlyData
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

export const requestWithdrawal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { amount, pixKey } = req.body;

    if (!amount || !pixKey) {
      res.status(400).json({
        success: false,
        error: 'Valor e chave PIX são obrigatórios'
      });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'Valor deve ser maior que zero'
      });
      return;
    }

    // Verificar saldo disponível
    const completedTransactions = await prisma.transaction.findMany({
      where: {
        creatorId: userId,
        status: 'completed'
      }
    });

    const totalEarnings = completedTransactions.reduce((sum, t) => sum + t.netAmount, 0);
    
    const withdrawnAmount = await prisma.withdrawal.aggregate({
      where: {
        creatorId: userId,
        status: {
          in: ['completed', 'pending']
        }
      },
      _sum: {
        amount: true
      }
    });

    const availableBalance = totalEarnings - (withdrawnAmount._sum.amount || 0);

    if (amount > availableBalance) {
      res.status(400).json({
        success: false,
        error: `Saldo insuficiente. Disponível: R$ ${availableBalance.toFixed(2)}`
      });
      return;
    }

    // Criar solicitação de saque
    const withdrawal = await prisma.withdrawal.create({
      data: {
        creatorId: userId,
        amount: amount,
        pixKey: pixKey,
        status: 'pending'
      }
    });

    console.log(`💰 Nova solicitação de saque: R$ ${amount} - ${pixKey}`);

    res.json({
      success: true,
      message: 'Solicitação de saque enviada com sucesso!',
      data: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        pixKey: withdrawal.pixKey,
        status: withdrawal.status,
        requestedAt: withdrawal.createdAt
      }
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};