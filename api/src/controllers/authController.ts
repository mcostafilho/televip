import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, username } = req.body;

    // Validar dados
    if (!email || !password || !name || !username) {
      res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios'
      });
      return;
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.creator.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: existingUser.email === email ? 'Email já está em uso' : 'Username já está em uso'
      });
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.creator.create({
      data: {
        email,
        password: hashedPassword,
        name,
        username
      }
    });

    // Gerar token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret_key_123',
      { expiresIn: '7d' }
    );

    console.log(`✅ Novo usuário criado: ${user.name} (${user.username})`);

    res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso!',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
      return;
    }

    // Buscar usuário
    const user = await prisma.creator.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos'
      });
      return;
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos'
      });
      return;
    }

    // Gerar token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret_key_123',
      { expiresIn: '7d' }
    );

    console.log(`✅ Login realizado: ${user.name} (${user.username})`);

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.creator.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};