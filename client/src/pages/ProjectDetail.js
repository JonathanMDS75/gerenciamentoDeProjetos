import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { FolderOpen, Users, Calendar, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes, membersRes] = await Promise.all([
        api.get(`/api/projects/${id}`),
        api.get(`/api/tasks?project_id=${id}`),
        api.get(`/api/projects/${id}/members`)
      ]);

      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setMembers(membersRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados do projeto');
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
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
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

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Projeto não encontrado</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do projeto */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderOpen className="h-12 w-12 text-primary-600" />
            </div>
            <div className="ml-4 flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {project.name}
              </h1>
              <p className="text-gray-500 mt-1">
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

          {/* Informações do projeto */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">
                Gerente: {project.manager_name}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">
                Início: {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">
                Fim: {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">
                Orçamento: {project.budget ? `R$ ${project.budget}` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarefas do projeto */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Tarefas ({tasks.length})
            </h3>
            <div className="space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {task.assigned_to_name || 'Não atribuída'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
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

        {/* Membros do projeto */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Membros ({members.length})
            </h3>
            <div className="space-y-3">
              {members.length > 0 ? (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {member.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {member.email}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      member.role === 'manager' ? 'text-blue-600 bg-blue-100' : 'text-gray-600 bg-gray-100'
                    }`}>
                      {member.role === 'manager' ? 'Gerente' : 'Membro'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum membro encontrado</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail; 