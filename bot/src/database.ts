import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar no banco:', error);
    return false;
  }
}

export async function getGroupByCreatorUsername(username: string) {
  const creator = await prisma.creator.findFirst({
    where: { telegramUsername: username },
    include: {
      groups: {
        include: {
          pricingPlans: {
            where: { isActive: true },
            orderBy: { months: 'asc' }
          }
        }
      }
    }
  });
  
  return creator?.groups[0] || null;
}

export async function createSubscription(
  groupId: string,
  planId: string,
  telegramUserId: string,
  telegramUsername: string,
  amountPaid: number
) {
  const plan = await prisma.pricingPlan.findUnique({
    where: { id: planId }
  });
  
  if (!plan) throw new Error('Plano não encontrado');
  
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + plan.months);
  
  return await prisma.subscription.create({
    data: {
      groupId,
      pricingPlanId: planId,
      telegramUserId: telegramUserId.toString(),
      telegramUsername,
      amountPaid,
      expiresAt,
      status: 'active'
    }
  });
}

export async function getActiveSubscription(telegramUserId: string, groupId: string) {
  return await prisma.subscription.findFirst({
    where: {
      telegramUserId: telegramUserId.toString(),
      groupId,
      status: 'active',
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      pricingPlan: true,
      group: true
    }
  });
}