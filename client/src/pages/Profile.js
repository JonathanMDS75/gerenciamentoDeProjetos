import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await api.get(`/api/users/${user.id}/stats`);
      setUserStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do usuário');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-100';
      case 'user': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do usuário */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-16 w-16">
                  <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {user?.name}
                  </h3>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {user?.email}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Membro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user?.role)}`}>
                      {user?.role === 'admin' ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          Administrador
                        </>
                      ) : (
                        'Usuário'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="space-y-6">
          {userStats && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Minhas Estatísticas
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Projetos</span>
                    <span className="text-sm font-medium text-gray-900">
                      {userStats.total_projects || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Tarefas</span>
                    <span className="text-sm font-medium text-gray-900">
                      {userStats.total_tasks || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Concluídas</span>
                    <span className="text-sm font-medium text-green-600">
                      {userStats.completed_tasks || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Pendentes</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {userStats.pending_tasks || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Em Progresso</span>
                    <span className="text-sm font-medium text-blue-600">
                      {userStats.in_progress_tasks || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Ações da Conta
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              Editar Perfil
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
              Alterar Senha
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
              Excluir Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 