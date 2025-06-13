import { useState, useEffect } from 'react';
import { useApi } from './useApi';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  });
  const [loading, setLoading] = useState(true);
  const api = useApi();

  // Verificar se há token salvo no localStorage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedToken = localStorage.getItem('televip_token');
        const savedUser = localStorage.getItem('televip_user');
        
        if (savedToken && savedUser) {
          setAuthState({
            user: JSON.parse(savedUser),
            token: savedToken,
            isAuthenticated: true
          });
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('televip_token');
        localStorage.removeItem('televip_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Salvar no localStorage
        localStorage.setItem('televip_token', token);
        localStorage.setItem('televip_user', JSON.stringify(user));
        
        setAuthState({
          user,
          token,
          isAuthenticated: true
        });
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Erro no login');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao fazer login' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const response = await api.register(userData);
      
      if (response.success) {
        // Após registro bem-sucedido, fazer login automaticamente
        const loginResult = await login(userData.email, userData.password);
        return loginResult;
      } else {
        throw new Error(response.message || 'Erro no registro');
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao criar conta' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Fazendo logout...'); // Para debug
    
    // Limpar localStorage
    localStorage.removeItem('televip_token');
    localStorage.removeItem('televip_user');
    
    // Limpar estado
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false
    });
    
    // Recarregar a página para garantir que volte ao login
    window.location.reload();
  };

  return {
    ...authState,
    loading,
    login,
    register,
    logout
  };
};