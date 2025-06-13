import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

// Landing Page Component
const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const { login, register } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        alert(result.error || 'Erro ao fazer login');
      } else {
        setShowLogin(false);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (userData: any) => {
    setAuthLoading(true);
    try {
      const result = await register(userData);
      if (!result.success) {
        alert(result.error || 'Erro ao criar conta');
      } else {
        setShowRegister(false);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const openLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const openRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  return (
    <div>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 0'
          }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              📱 TeleVIP
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={openLogin}
                style={{
                  padding: '0.8rem 1.5rem',
                  border: '2px solid #667eea',
                  borderRadius: '50px',
                  background: 'transparent',
                  color: '#667eea',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#667eea';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#667eea';
                }}
              >
                🔐 Login
              </button>
              
              <button
                onClick={openRegister}
                style={{
                  padding: '0.8rem 1.5rem',
                  border: 'none',
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
              >
                ✨ Registrar
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '120px 0 80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
            gap: '4rem',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: window.innerWidth > 768 ? '3.5rem' : '2.5rem',
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: '1.5rem'
              }}>
                Monetize Seus Grupos do Telegram
              </h1>
              
              <p style={{
                fontSize: '1.3rem',
                marginBottom: '2rem',
                opacity: 0.9
              }}>
                A plataforma completa para transformar seus seguidores em receita recorrente. 
                Pague apenas 3% por transação processada. Sem custos iniciais, sem mensalidades.
              </p>

              <div style={{
                display: 'flex',
                gap: window.innerWidth > 768 ? '2rem' : '1rem',
                margin: '2rem 0',
                flexDirection: window.innerWidth > 768 ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-start'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, display: 'block' }}>10K+</span>
                  <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Criadores</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, display: 'block' }}>R$ 2M</span>
                  <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Processados</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, display: 'block' }}>99.9%</span>
                  <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Uptime</span>
                </div>
              </div>

              <button
                onClick={openRegister}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  borderRadius: '50px',
                  border: 'none',
                  background: 'white',
                  color: '#667eea',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                }}
              >
                🚀 Começar Sem Custo Inicial
              </button>
            </div>

            {/* Mockup simplificado */}
            <div style={{
              position: 'relative',
              display: window.innerWidth <= 768 ? 'none' : 'block'
            }}>
              <div style={{
                background: 'linear-gradient(145deg, #f0f0f0, #ffffff)',
                borderRadius: '30px',
                padding: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                transform: 'rotate(-5deg)',
                transition: 'transform 0.3s ease',
                maxWidth: '300px',
                margin: '0 auto'
              }}>
                <div style={{
                  background: '#2aabee',
                  borderRadius: '20px',
                  padding: '30px 20px',
                  color: 'white',
                  minHeight: '300px'
                }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '10px 15px',
                    borderRadius: '10px',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(45deg, #ff6b6b, #ffd93d)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>💰</div>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>Trading VIP</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Premium • 1.2k membros</div>
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '10px 15px',
                    borderRadius: '15px',
                    marginBottom: '10px'
                  }}>
                    📈 Sinal GOLD - Compra em 1.875
                  </div>
                  
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    right: '20px',
                    background: 'rgba(255,255,255,0.1)',
                    padding: '10px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}>
                    💰 R$ 29,90/mês • Gerenciado pelo TeleVIP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Preços */}
      <section style={{
        padding: '100px 0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              marginBottom: '1rem',
              color: 'white'
            }}>
              Preço Simples e Justo
            </h2>
            <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
              Um único plano com todos os recursos. Pague apenas quando você faturar.
            </p>
          </div>

          <div style={{
            maxWidth: '500px',
            margin: '0 auto',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              TeleVIP
            </h3>
            <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>
              3%
            </div>
            <div style={{ opacity: 0.8, marginBottom: '2rem' }}>
              por transação processada
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '1rem',
              borderRadius: '10px',
              margin: '1rem 0',
              fontSize: '0.9rem'
            }}>
              💡 <strong>Exemplo:</strong> Cliente paga R$ 100 → Você recebe R$ 97
            </div>

            <button
              onClick={openRegister}
              style={{
                background: '#fff',
                color: '#667eea',
                fontSize: '1.2rem',
                padding: '1rem 2rem',
                marginTop: '1rem',
                border: 'none',
                borderRadius: '50px',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              🚀 Começar Agora - Sem Custo Inicial
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0f172a',
        color: 'white',
        padding: '2rem 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <p>&copy; 2025 TeleVIP. Todos os direitos reservados. Feito com ❤️ para criadores de conteúdo.</p>
        </div>
      </footer>

      {/* Modals */}
      {showLogin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={closeModals}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 1
              }}
            >
              ×
            </button>
            <LoginForm
              onLogin={handleLogin}
              onSwitchToRegister={() => {
                setShowLogin(false);
                setShowRegister(true);
              }}
              loading={authLoading}
            />
          </div>
        </div>
      )}

      {showRegister && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={closeModals}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 1
              }}
            >
              ×
            </button>
            <RegisterForm
              onRegister={handleRegister}
              onSwitchToLogin={() => {
                setShowRegister(false);
                setShowLogin(true);
              }}
              loading={authLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// App principal
function App() {
  const { isAuthenticated, loading, user } = useAuth();

  // Verificar se é admin
  const isAdmin = () => {
    return user?.email === 'mauro_lcf@example.com' || user?.email === 'admin@televip.com';
  };

  // Verificar se deve mostrar painel admin
  const shouldShowAdmin = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('admin') === 'true' && isAdmin();
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        🚀 Carregando TeleVIP...
      </div>
    );
  }

  // Se não está autenticado, mostrar landing page
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Se está autenticado e deve mostrar admin
  if (shouldShowAdmin()) {
    return <AdminPanel />;
  }

  // Se está autenticado, mostrar dashboard
  return <Dashboard />;
}

export default App;