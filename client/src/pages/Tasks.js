import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, CheckSquare, User, Calendar, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom'; // 👈 pega o ID da rota

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { id: projectId } = useParams(); // Captura o ID do projeto da rota

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/api/tasks'); // Chama a nova rota
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Função para deletar tarefa
  const deleteTask = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar esta tarefa?")) return;

    try {
      await api.delete(`/api/tasks/${id}`);
      toast.success("Tarefa deletada com sucesso!");
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      toast.error("Erro ao deletar tarefa");
    }
  };

  // 🔴 Função para deletar projeto (agora usando projectId real)
  const deleteProject = async () => {
    if (!window.confirm("Tem certeza que deseja deletar este projeto?")) return;

    try {
      await api.delete(`/api/projects/${projectId}`);
      toast.success("Projeto deletado com sucesso!");
      navigate("/projects"); // redireciona p/ lista de projetos
    } catch (error) {
      toast.error("Erro ao deletar projeto");
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/tasks/create`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Lista de tarefas */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <li key={task.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckSquare className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {task.description || 'Sem descrição'}
                      </p>
                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {task.assigned_to_name || 'Não atribuída'}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {task.project_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    {/* Botão Deletar Tarefa */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="ml-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Deletar
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center">
              <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma tarefa</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece criando sua primeira tarefa.
              </p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Tasks;
