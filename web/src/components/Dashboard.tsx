import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

// Interface para tipagem de dados
interface Group {
  id: string;
  name: string;
  description: string;
  price: number;
  telegram_id?: string;
  status: string;
  members?: number;
}

interface Stats {
  totalGroups: number;
  totalMembers: number;
  totalRevenue: number;
  activeSubscriptions: number;
}

// Componente para cards de estatísticas
const StatCard = ({ title, value, icon, color }: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) => (
  <div style={{
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: `3px solid ${color}`,
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', color, marginBottom: '0.5rem' }}>
      {value}
    </div>
    <div style={{ color: '#666', fontSize: '0.9rem' }}>{title}</div>
  </div>
);

// Componente para lista de grupos
const GroupCard = ({ group, onEdit }: {
  group: Group;
  onEdit: (group: Group) => void;
}) => (
  <div style={{
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>{group.name}</h3>
        <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem' }}>
          💰 R$ {group.price}/mês • 👥 {group.members || 0} membros
        </p>
      </div>
      <div style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        background: group.status === 'active' ? '#dcfce7' : '#fef3c7',
        color: group.status === 'active' ? '#166534' : '#92400e'
      }}>
        {group.status === 'active' ? '🟢 Ativo' : '🟡 Pendente'}
      </div>
    </div>
    
    <div style={{ marginBottom: '1rem', color: '#4b5563', fontSize: '0.9rem' }}>
      📱 ID: {group.telegram_id || 'Não conectado'}
    </div>
    
    <button
      onClick={() => onEdit(group)}
      style={{
        background: '#3b82f6',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem'
      }}
    >
      ✏️ Editar
    </button>
  </div>
);

function Dashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalGroups: 0,
    totalMembers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    telegram_id: ''
  });
  const [loading, setLoading] = useState(true);

  // Função para fazer requisições à API
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const token = localStorage.getItem('televip_token');
      const response = await fetch(`http://localhost:4000/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: 'Erro na comunicação com servidor' };
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar grupos (mock por enquanto)
      const mockGroups: Group[] = [
        {
          id: '1',
          name: 'Trading VIP Premium',
          description: 'Sinais premium de trading',
          price: 29.90,
          telegram_id: '@tradingvip',
          status: 'active',
          members: 0
        }
      ];
      
      // Carregar stats (mock por enquanto)
      const mockStats: Stats = {
        totalGroups: 1,
        totalMembers: 0,
        totalRevenue: 0,
        activeSubscriptions: 0
      };
      
      setGroups(mockGroups);
      setStats(mockStats);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Por enquanto, vamos simular a criação
      const newGroup: Group = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        telegram_id: formData.telegram_id || undefined,
        status: 'active',
        members: 0
      };
      
      setGroups([...groups, newGroup]);
      setShowCreateGroup(false);
      setFormData({ name: '', description: '', price: '', telegram_id: '' });
      alert('Grupo criado com sucesso!');
      
    } catch (error) {
      alert('Erro ao criar grupo');
      console.error('Erro:', error);
    }
  };

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingGroup) return;

    try {
      // Por enquanto, vamos simular a edição
      const updatedGroup: Group = {
        ...editingGroup,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        telegram_id: formData.telegram_id || undefined
      };
      
      setGroups(groups.map(g => g.id === editingGroup.id ? updatedGroup : g));
      setEditingGroup(null);
      setFormData({ name: '', description: '', price: '', telegram_id: '' });
      alert('Grupo atualizado com sucesso!');
      
    } catch (error) {
      alert('Erro ao atualizar grupo');
      console.error('Erro:', error);
    }
  };

  const startEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
      price: group.price.toString(),
      telegram_id: group.telegram_id || ''
    });
  };

  const cancelEdit = () => {
    setEditingGroup(null);
    setShowCreateGroup(false);
    setFormData({ name: '', description: '', price: '', telegram_id: '' });
  };

  if (!isAuthenticated) {
    return <div>Por favor, faça login para acessar o dashboard.</div>;
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        🚀 Carregando dashboard...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem' }}>
                📱 TeleVIP Dashboard
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>
                Olá, {user?.name || user?.email}! 👋
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={() => setShowCreateGroup(true)}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ➕ Novo Grupo
              </button>
              
              <button
                onClick={logout}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🚪 Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 20px' }}>
        {/* Estatísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <StatCard
            title="Total de Grupos"
            value={stats.totalGroups}
            icon="📱"
            color="#3b82f6"
          />
          <StatCard
            title="Total de Membros"
            value={stats.totalMembers}
            icon="👥"
            color="#10b981"
          />
          <StatCard
            title="Receita Total"
            value={`R$ ${stats.totalRevenue.toFixed(2)}`}
            icon="💰"
            color="#f59e0b"
          />
          <StatCard
            title="Assinaturas Ativas"
            value={stats.activeSubscriptions}
            icon="⭐"
            color="#8b5cf6"
          />
        </div>

        {/* Lista de Grupos */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>🔗 Meus Grupos</h2>
          
          {groups.length === 0 ? (
            <div style={{
              background: 'white',
              padding: '3rem',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
              <h3 style={{ color: '#6b7280', marginBottom: '1rem' }}>Nenhum grupo encontrado</h3>
              <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                Crie seu primeiro grupo para começar a monetizar!
              </p>
              <button
                onClick={() => setShowCreateGroup(true)}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ➕ Criar Primeiro Grupo
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {groups.map((group: Group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onEdit={startEdit}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal para criar/editar grupo */}
      {(showCreateGroup || editingGroup) && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
              {editingGroup ? '✏️ Editar Grupo' : '➕ Criar Novo Grupo'}
            </h2>
            
            <form onSubmit={editingGroup ? handleEditGroup : handleCreateGroup}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Nome do Grupo:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Descrição:
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    minHeight: '100px',
                    resize: 'vertical' as const,
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Preço Mensal (R$):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  ID do Grupo no Telegram (opcional):
                </label>
                <input
                  type="text"
                  value={formData.telegram_id}
                  onChange={(e) => setFormData({...formData, telegram_id: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Ex: @meugrupo ou ID numérico"
                />
                <small style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                  Deixe vazio se ainda não conectou o bot ao grupo
                </small>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {editingGroup ? '💾 Salvar' : '✨ Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;