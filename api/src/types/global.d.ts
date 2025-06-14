// Tipos globais para o projeto TeleVIP

import { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

// Estender JwtPayload para incluir nossos campos customizados
declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id?: string;
    email?: string;
  }
}

// Tipos para as respostas da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
  token: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  telegramId: string;
  inviteLink?: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  groupId: string;
  planId: string;
  status: string;
  startDate: Date;
  endDate: Date;
  stripeSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  subscriptionId: string;
  creatorId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: string;
  stripeSessionId?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Withdrawal {
  id: string;
  creatorId: string;
  amount: number;
  status: string;
  pixKey?: string;
  bankData?: string;
  createdAt: Date;
  updatedAt: Date;
}

export {};