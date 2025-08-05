import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  FolderOpen,
  CheckSquare,
  Users,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    users: 0,
    completedTasks: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes, usersRes, taskStatsRes] = await Promise.all([
        api.get('/api/projects'),
        api.get('/api/tasks'),
        api.get('/api/users'),
        api.get('/api/tasks/stats/overview')
      ]);

      setStats({
        projects: projectsRes.data.length,
        tasks: tasksRes.data.length,
        users: usersRes.data.length,
        completedTasks: taskStatsRes.data.completed_tasks || 0
      });

      setRecentProjects(projectsRes.data.slice(0, 5));
      setRecentTasks(tasksRes.data.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
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
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderOpen className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Projetos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.projects}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckSquare className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Tarefas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.tasks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Usuários
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.users}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tarefas Concluídas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.completedTasks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projetos recentes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Projetos Recentes
              </h3>
              <Link
                to="/projects"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Ver todos
              </Link>
            </div>
            <div className="mt-4 space-y-4">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {project.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {project.description || 'Sem descrição'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum projeto encontrado</p>
              )}
            </div>
          </div>
        </div>

        {/* Tarefas recentes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Tarefas Recentes
              </h3>
              <Link
                to="/tasks"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Ver todas
              </Link>
            </div>
            <div className="mt-4 space-y-4">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div key={task.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {task.project_name} • {task.assigned_to_name || 'Não atribuída'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhuma tarefa encontrada</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/projects"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FolderOpen className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Criar Projeto</h4>
                <p className="text-sm text-gray-500">Adicionar novo projeto</p>
              </div>
            </Link>

            <Link
              to="/tasks"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CheckSquare className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Criar Tarefa</h4>
                <p className="text-sm text-gray-500">Adicionar nova tarefa</p>
              </div>
            </Link>

            <Link
              to="/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Gerenciar Usuários</h4>
                <p className="text-sm text-gray-500">Ver todos os usuários</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 