import Stripe from 'stripe';
import { prisma } from './database';

// Inicializar com configurações corretas
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
  typescript: true,
});

// Interface para o resultado
interface PaymentResult {
  success: boolean;
  url?: string;
  error?: string;
  sessionId?: string;
}

export async function createCheckoutSession(
  planId: string,
  telegramUserId: string,
  telegramUsername: string
): Promise<PaymentResult> {
  try {
    console.log('📝 Iniciando criação de checkout:', { planId, telegramUserId });
    
    // Buscar plano
    const plan = await prisma.pricingPlan.findUnique({
      where: { id: planId },
      include: { group: true }
    });

    if (!plan) {
      return { success: false, error: 'Plano não encontrado' };
    }

    const priceAmount = Math.round(Number(plan.price) * 100);
    console.log('💰 Valor em centavos:', priceAmount);

    // Criar sessão com configurações mínimas primeiro
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: `${plan.group.groupName} - ${plan.name}`,
          },
          unit_amount: priceAmount,
        },
        quantity: 1,
      }],
      success_url: `https://t.me/${process.env.BOT_USERNAME}?start=paid_{CHECKOUT_SESSION_ID}`,
      cancel_url: `https://t.me/${process.env.BOT_USERNAME}`,
      metadata: {
        planId: plan.id,
        groupId: plan.groupId,
        telegramUserId: telegramUserId,
        telegramUsername: telegramUsername || 'none',
        planMonths: plan.months.toString(),
      },
    });

    console.log('✅ Sessão criada:', session.id);

    // NÃO salvar transação aqui - vamos salvar apenas quando for paga

    return {
      success: true,
      url: session.url!,
      sessionId: session.id
    };

  } catch (error: any) {
    console.error('❌ Erro Stripe:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido'
    };
  }
}

export async function verifyPayment(sessionId: string): Promise<{
  paid: boolean;
  subscription?: any;
  error?: string;
}> {
  try {
    console.log('🔍 Verificando pagamento:', sessionId);
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('📋 Status:', session.payment_status);

    if (session.payment_status !== 'paid') {
      return { paid: false };
    }

    // Verificar se já existe assinatura
    const existingSub = await prisma.subscription.findFirst({
      where: {
        telegramUserId: session.metadata!.telegramUserId,
        groupId: session.metadata!.groupId,
        status: 'active'
      }
    });

    if (existingSub) {
      console.log('⚠️ Assinatura já existe');
      return { paid: true, subscription: existingSub };
    }

    // Criar nova assinatura
    const months = parseInt(session.metadata!.planMonths);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    const subscription = await prisma.subscription.create({
      data: {
        groupId: session.metadata!.groupId,
        pricingPlanId: session.metadata!.planId,
        telegramUserId: session.metadata!.telegramUserId,
        telegramUsername: session.metadata!.telegramUsername,
        amountPaid: session.amount_total! / 100,
        expiresAt,
        status: 'active'
      }
    });

    // Agora criar a transação com o ID correto da subscription
    await prisma.transaction.create({
      data: {
        subscriptionId: subscription.id,
        type: 'payment',
        amount: session.amount_total! / 100,
        pixId: sessionId,
        status: 'completed'
      }
    });

    console.log('✅ Assinatura criada:', subscription.id);

    return { paid: true, subscription };

  } catch (error: any) {
    console.error('❌ Erro ao verificar:', error);
    return { paid: false, error: error.message };
  }
}

// Função para listar pagamentos recentes (admin)
export async function listRecentPayments(limit: number = 10) {
  try {
    const sessions = await stripe.checkout.sessions.list({
      limit,
      expand: ['data.payment_intent']
    });

    return sessions.data.map(session => ({
      id: session.id,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      created: new Date(session.created * 1000),
      metadata: session.metadata
    }));
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    return [];
  }
}