import React, { useState, useEffect } from 'react';

interface AdminData {
  stats: {
    totalCreators: number;
    totalGroups: number;
    totalSubscriptions: number;
    totalRevenue: number;
    totalCommission: number;
    pendingWithdrawalsCount: number;
    pendingWithdrawalsAmount: number;
  };
  pendingWithdrawals: any[];
  recentCreators: any[];
  monthlyRevenue: any[];
}

const AdminPanel = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [creators, setCreators] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Criar método para chamar APIs admin
  const adminApi = {
    getDashboard: () => fetch('http://localhost:4000/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('televip_token')}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json()),

    getCreators: () => fetch('http://localhost:4000/api/admin/creators', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('televip_token')}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json()),

    getWithdrawals: () => fetch('http://localhost:4000/api/admin/withdrawals', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('televip_token')}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json()),

    updateWithdrawal: (id: string, status: string) => fetch(`http://localhost:4000/api/admin/withdrawals/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('televip_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    }).then(res => res.json())
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [dashboardRes, creatorsRes, withdrawalsRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getCreators(),
        adminApi.getWithdrawals()
      ]);

      if (dashboardRes.success) setAdminData(dashboardRes.data);
      if (creatorsRes.success) setCreators(creatorsRes.data);
      if (withdrawalsRes.success) setWithdrawals(withdrawalsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalAction = async (withdrawalId: string, status: 'completed' | 'rejected') => {
    try {
      const result = await adminApi.updateWithdrawal(withdrawalId, status);
      if (result.success) {
        alert(`Saque ${status === 'completed' ? 'aprovado' : 'rejeitado'} com sucesso!`);
        loadAdminData(); // Recarregar dados
      } else {
        alert(result.error || 'Erro ao atualizar saque');
      }
    } catch (error) {
      alert('Erro ao atualizar saque');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { backgroundColor: '#fef3c7', color: '#92400e', text: '⏳ Pendente' },
      completed: { backgroundColor: '#dcfce7', color: '#166534', text: '✅ Aprovado' },
      rejected: { backgroundColor: '#fecaca', color: '#991b1b', text: '❌ Rejeitado' }
    };

    const style = styles[status as keyof typeof styles] || styles.pending;

    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: style.backgroundColor,
        color: style.color
      }}>
        {style.text}
      </span>
    );
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
        🔒 Carregando painel admin...
      </div>
    );
  }

  if (!adminData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        flexDirection: 'column'
      }}>
        <p>❌ Acesso negado</p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          Apenas administradores podem acessar este painel
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#1f2937', 
        color: 'white',
        padding: '16px 24px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            🔒 TeleVIP Admin
          </h1>
          <div style={{ color: '#d1d5db', fontSize: '14px' }}>
            Painel Administrativo
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'creators', label: 'Criadores', icon: '👥' },
            { id: 'withdrawals', label: 'Saques', icon: '💰' }
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: currentView === id ? '#dbeafe' : 'white',
                color: currentView === id ? '#1d4ed8' : '#6b7280',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ marginRight: '8px' }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Stats Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '24px' 
            }}>
              {[
                { title: 'Total Criadores', value: adminData.stats.totalCreators, icon: '👥', color: '#3b82f6' },
                { title: 'Total Grupos', value: adminData.stats.totalGroups, icon: '📱', color: '#10b981' },
                { title: 'Assinaturas', value: adminData.stats.totalSubscriptions, icon: '📋', color: '#8b5cf6' },
                { title: 'Receita Total', value: `R$ ${adminData.stats.totalRevenue.toFixed(2)}`, icon: '💰', color: '#f59e0b' },
                { title: 'Comissão Total', value: `R$ ${adminData.stats.totalCommission.toFixed(2)}`, icon: '📈', color: '#ef4444' },
                { title: 'Saques Pendentes', value: adminData.stats.pendingWithdrawalsCount, icon: '⏳', color: '#f97316' }
              ].map(({ title, value, icon, color }) => (
                <div key={title} style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: `${color}15`,
                      marginRight: '16px'
                    }}>
                      <span style={{ fontSize: '24px' }}>{icon}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>{title}</p>
                      <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pending Withdrawals Alert */}
            {adminData.pendingWithdrawals.length > 0 && (
              <div style={{
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '24px' }}>🚨</span>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#92400e' }}>
                    {adminData.pendingWithdrawals.length} saque(s) pendente(s)
                  </h3>
                  <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
                    Total: R$ {adminData.pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('withdrawals')}
                  style={{
                    marginLeft: 'auto',
                    padding: '8px 16px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Ver Saques
                </button>
              </div>
            )}

            {/* Recent Creators */}
            {adminData.recentCreators.length > 0 && (
              <div style={{
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '24px 24px 0 24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
                    🆕 Criadores Recentes
                  </h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                      <tr>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                          Nome
                        </th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                          Email
                        </th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                          Grupos
                        </th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                          Cadastro
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminData.recentCreators.map((creator: any) => (
                        <tr key={creator.id}>
                          <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500' }}>
                            {creator.name}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>
                            {creator.email}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                            {creator._count.groups}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>
                            {new Date(creator.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Creators View */}
        {currentView === 'creators' && (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '24px 24px 0 24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
                👥 Todos os Criadores ({creators.length})
              </h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                      Nome
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                      Email
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                      Username
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                      Grupos
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                      Receita
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                      Cadastro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {creators.map((creator: any) => (
                    <tr key={creator.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500' }}>
                        {creator.name}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>
                        {creator.email}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>
                        @{creator.username}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                        {creator.stats?.groups || 0}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500', color: '#10b981' }}>
                        R$ {(creator.stats?.totalEarnings || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>
                        {new Date(creator.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Withdrawals View */}
        {currentView === 'withdrawals' && (
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '24px 24px 0 24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' }}>
                💰 Todos os Saques ({withdrawals.length})
              </h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                      Criador
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                      Valor
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                      PIX
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                      Status
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                      Data
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal: any) => (
                    <tr key={withdrawal.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500' }}>
                        {withdrawal.creator.name}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500', color: '#10b981' }}>
                        R$ {withdrawal.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {withdrawal.pixKey}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {getStatusBadge(withdrawal.status)}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#6b7280' }}>
                        {new Date(withdrawal.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {withdrawal.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleWithdrawalAction(withdrawal.id, 'completed')}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '500'
                              }}
                            >
                              ✅ Aprovar
                            </button>
                            <button
                              onClick={() => handleWithdrawalAction(withdrawal.id, 'rejected')}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '500'
                              }}
                            >
                              ❌ Rejeitar
                            </button>
                          </div>
                        )}
                        {withdrawal.status !== 'pending' && (
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            {withdrawal.status === 'completed' ? 'Processado' : 'Rejeitado'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;