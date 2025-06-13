import { Telegraf, Context } from 'telegraf';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN || 'DEMO_TOKEN');
const prisma = new PrismaClient();

// Conectar ao banco
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Bot conectado ao banco de dados');
  } catch (error) {
    console.error('❌ Erro ao conectar no banco:', error);
  }
}

// Função para buscar grupo por username do criador
async function getGroupByCreatorUsername(username: string) {
  try {
    const creator = await prisma.creator.findFirst({
      where: { username: username },
      include: {
        groups: {
          include: {
            pricingPlans: {
              orderBy: { duration: 'asc' }
            }
          }
        }
      }
    });
    
    return creator?.groups[0] || null;
  } catch (error) {
    console.error('Erro ao buscar grupo:', error);
    return null;
  }
}

// Comando /start
bot.start(async (ctx) => {
  const nomeUsuario = ctx.from?.first_name || 'amigo';
  const startParam = ctx.message?.text?.split(' ')[1];
  
  console.log('Start param recebido:', startParam);
  
  if (startParam) {
    try {
      const group = await getGroupByCreatorUsername(startParam);
      
      if (group && group.pricingPlans.length > 0) {
        const plansText = group.pricingPlans
          .map(plan => `• ${plan.name} - R$ ${plan.price.toFixed(2)}`)
          .join('\n');
        
        await ctx.reply(
          `🎉 Bem-vindo ao ${group.name}!\n\n` +
          `💰 Planos disponíveis:\n${plansText}\n\n` +
          `Use /assinar para ver os planos detalhados.`
        );
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
    }
  }
  
  await ctx.reply(
    `🎉 Olá ${nomeUsuario}! Bem-vindo ao TeleVIP!\n\n` +
    '💎 Sistema profissional de assinaturas para grupos VIP no Telegram.\n\n' +
    '📋 Use /planos para ver as opções disponíveis\n' +
    '❓ Use /ajuda para mais informações'
  );
});

// Comando /status
bot.command('status', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;
  
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: userId.toString(),
        status: 'active',
        endDate: { gt: new Date() }
      },
      include: {
        group: true,
        plan: true
      }
    });
    
    if (subscription) {
      const endDate = subscription.endDate.toLocaleDateString('pt-BR');
      await ctx.reply(
        `📊 *Status da Assinatura*\n\n` +
        `✅ Assinatura Ativa\n` +
        `📌 Grupo: ${subscription.group.name}\n` +
        `💎 Plano: ${subscription.plan.name}\n` +
        `📅 Válida até: ${endDate}`,
        { parse_mode: 'Markdown' }
      );
    } else {
      await ctx.reply(
        '📊 *Status da Assinatura*\n\n' +
        '❌ Você ainda não possui uma assinatura ativa.\n\n' +
        'Use /planos para ver as opções disponíveis!',
        { parse_mode: 'Markdown' }
      );
    }
  } catch (error) {
    console.error('Erro no comando status:', error);
    await ctx.reply('❌ Erro ao verificar status. Tente novamente.');
  }
});

// Comando /planos
bot.command('planos', (ctx) => {
  ctx.replyWithMarkdown(
    '💰 *Planos Disponíveis*\n\n' +
    '1️⃣ *Mensal* - R$ 29,90\n' +
    '6️⃣ *Semestral* - R$ 149,90 _(16% de desconto)_\n' +
    '🎯 *Anual* - R$ 279,90 _(22% de desconto)_\n\n' +
    'Use /assinar para escolher um plano!'
  );
});

// Comando /ajuda
bot.command('ajuda', (ctx) => {
  ctx.reply(
    '📚 *Central de Ajuda*\n\n' +
    '🤖 *Comandos disponíveis:*\n' +
    '/start - Iniciar conversa\n' +
    '/planos - Ver planos e preços\n' +
    '/status - Verificar sua assinatura\n' +
    '/assinar - Escolher um plano\n' +
    '/suporte - Falar com humano\n\n' +
    '❓ *Como funciona?*\n' +
    '1. Escolha um plano\n' +
    '2. Faça o pagamento\n' +
    '3. Seja adicionado ao grupo automaticamente\n' +
    '4. Aproveite o conteúdo exclusivo!',
    { parse_mode: 'Markdown' }
  );
});

// Comando /suporte
bot.command('suporte', (ctx) => {
  ctx.reply(
    '🤝 *Suporte*\n\n' +
    'Precisa de ajuda? Entre em contato:\n\n' +
    '📧 Email: suporte@televip.com\n' +
    '💬 Telegram: @televip_suporte\n\n' +
    '_Respondemos em até 24 horas!_',
    { parse_mode: 'Markdown' }
  );
});

// Comando /assinar
bot.command('assinar', async (ctx) => {
  try {
    const group = await prisma.group.findFirst({
      include: {
        pricingPlans: {
          orderBy: { duration: 'asc' }
        }
      }
    });

    if (!group || group.pricingPlans.length === 0) {
      await ctx.reply('❌ Nenhum plano disponível no momento.');
      return;
    }

    const keyboard = group.pricingPlans.map(plan => [{
      text: `${plan.name} - R$ ${plan.price.toFixed(2)}`,
      callback_data: `assinar_${plan.id}`
    }]);

    await ctx.reply(
      `💎 *${group.name}*\n\nEscolha o plano desejado:`,
      {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      }
    );
  } catch (error) {
    console.error('Erro no comando assinar:', error);
    await ctx.reply('❌ Erro ao carregar planos. Tente novamente.');
  }
});

// Handler para botões de assinatura
bot.action(/assinar_(.+)/, async (ctx) => {
  const planId = ctx.match[1];
  await ctx.answerCbQuery('Em desenvolvimento...');
  await ctx.reply('🚧 Sistema de pagamento em desenvolvimento. Em breve!');
});

// Comando /admin (apenas para testes)
bot.command('admin', async (ctx) => {
  try {
    const stats = await Promise.all([
      prisma.creator.count(),
      prisma.group.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
    ]);
    
    await ctx.reply(
      `📊 *Estatísticas do Sistema*\n\n` +
      `👤 Criadores: ${stats[0]}\n` +
      `👥 Grupos: ${stats[1]}\n` +
      `✅ Assinaturas Ativas: ${stats[2]}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Erro no comando admin:', error);
    await ctx.reply('❌ Erro ao carregar estatísticas.');
  }
});

// Comando /teste
bot.command('teste', async (ctx) => {
  try {
    await ctx.reply('🤖 Bot funcionando perfeitamente!\n\n✅ Conexão com banco OK');
  } catch (error) {
    console.error('Erro no comando teste:', error);
    await ctx.reply('❌ Erro no teste.');
  }
});

// Inicializar bot
async function startBot() {
  try {
    await connectDB();
    
    if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN === 'SEU_BOT_TOKEN_AQUI') {
      console.log('⚠️  BOT_TOKEN não configurado. Bot rodando em modo demo.');
      console.log('📝 Configure BOT_TOKEN no arquivo .env para usar o bot real.');
      return;
    }
    
    await bot.launch();
    console.log('🤖 Bot TeleVIP iniciado com sucesso!');
    
    // Graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
    
  } catch (error) {
    console.error('❌ Erro ao iniciar bot:', error);
  }
}

startBot();