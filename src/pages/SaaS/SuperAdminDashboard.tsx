import React, { useState, useEffect } from 'react';
import { X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<any[]>([]);
  const navigate = useNavigate();
  const [editingTenant, setEditingTenant] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    primary_color: '',
    secondary_color: '',
    logo: '',
    cover_image: '',
    payment_config: ''
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    const res = await fetch('/api/superadmin/tenants');
    if (res.ok) {
      setTenants(await res.json());
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    await fetch(`/api/superadmin/tenants/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchTenants();
  };

  const deleteTenant = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta conta permanentemente?')) {
      await fetch(`/api/superadmin/tenants/${id}`, { method: 'DELETE' });
      fetchTenants();
    }
  };

  const openEditModal = (tenant: any) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      primary_color: tenant.primary_color,
      secondary_color: tenant.secondary_color,
      logo: tenant.logo || '',
      cover_image: tenant.cover_image || '',
      payment_config: tenant.payment_config || ''
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    try {
      const res = await fetch(`/api/superadmin/tenants/${editingTenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setEditingTenant(null);
        fetchTenants();
      } else {
        alert('Erro ao atualizar conta');
      }
    } catch (error) {
      alert('Erro de conexão');
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Super Admin - Contas</h1>
          <button 
            onClick={() => {
              localStorage.removeItem('superadmin_token');
              navigate('/superadmin/login');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sair do Painel
          </button>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm border border-secondary overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-secondary/30">
              <tr>
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Nome</th>
                <th className="p-4 font-medium">Link (Slug)</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id} className="border-t border-secondary">
                  <td className="p-4">{t.id}</td>
                  <td className="p-4 font-medium">{t.name}</td>
                  <td className="p-4 text-primary">/{t.slug}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.status === 'active' ? 'Ativo' : 'Suspenso'}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    <button 
                      onClick={() => openEditModal(t)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => toggleStatus(t.id, t.status)}
                      className="px-3 py-1 bg-secondary rounded-lg text-sm hover:bg-secondary/80"
                    >
                      {t.status === 'active' ? 'Suspender' : 'Ativar'}
                    </button>
                    <button 
                      onClick={() => deleteTenant(t.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                    >
                      Excluir
                    </button>
                    <a 
                      href={`/${t.slug}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-accent inline-block"
                    >
                      Acessar
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-secondary flex justify-between items-center">
              <h2 className="text-xl font-bold">Editar Conta</h2>
              <button onClick={() => setEditingTenant(null)} className="text-text-light hover:text-text-main">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Negócio</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-3 rounded-xl border border-secondary bg-background"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cor Principal</label>
                  <input 
                    type="color" 
                    className="w-full h-12 rounded-xl cursor-pointer"
                    value={formData.primary_color}
                    onChange={e => setFormData({...formData, primary_color: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cor Secundária</label>
                  <input 
                    type="color" 
                    className="w-full h-12 rounded-xl cursor-pointer"
                    value={formData.secondary_color}
                    onChange={e => setFormData({...formData, secondary_color: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL do Logo</label>
                <input 
                  type="url" 
                  className="w-full p-3 rounded-xl border border-secondary bg-background"
                  value={formData.logo}
                  onChange={e => setFormData({...formData, logo: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL da Imagem de Capa</label>
                <input 
                  type="url" 
                  className="w-full p-3 rounded-xl border border-secondary bg-background"
                  value={formData.cover_image}
                  onChange={e => setFormData({...formData, cover_image: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Chave Pix</label>
                <input 
                  type="text" 
                  className="w-full p-3 rounded-xl border border-secondary bg-background"
                  value={formData.payment_config}
                  onChange={e => setFormData({...formData, payment_config: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingTenant(null)} className="px-6 py-2 rounded-xl font-medium text-text-light hover:bg-secondary transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2 rounded-xl font-medium bg-primary text-white hover:bg-accent transition-colors">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
