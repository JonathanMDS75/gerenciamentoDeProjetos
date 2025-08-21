import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

const CreateTask = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "medium",
    status: "pending",
    assigned_to: "", // opcional, caso queira atribuir usuário (pode tirar se não usar)
    project_id: 1, // opcional, caso queira vincular a um projeto
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Validação simples
  const validateAll = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "O título da tarefa é obrigatório.";
    }

    if (formData.description.trim().length < 5) {
      newErrors.description = "A descrição deve ter pelo menos 5 caracteres.";
    }

    if (!formData.due_date) {
      newErrors.due_date = "A data de vencimento é obrigatória.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Atualiza o form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Enviar form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      toast.error("Corrija os erros antes de enviar.");
      return;
    }

    try {
      setLoading(true);
      console.log("Enviando dados:", formData);
      // Envia os dados para a API
      await api.post("/api/tasks", formData);
      toast.success("Tarefa criada com sucesso!");
      navigate("/tasks"); // volta para lista de tarefas
    } catch (error) {
      toast.error("Erro ao criar tarefa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Criar Nova Tarefa</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Título *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full border ${
              errors.title ? "border-red-500" : "border-gray-300"
            } rounded-md p-2`}
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição *</label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className={`mt-1 block w-full border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } rounded-md p-2`}
          ></textarea>
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}
        </div>

        {/* Data de Vencimento */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Data de Vencimento *</label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className={`mt-1 block w-full border ${
              errors.due_date ? "border-red-500" : "border-gray-300"
            } rounded-md p-2`}
          />
          {errors.due_date && (
            <p className="text-red-500 text-sm">{errors.due_date}</p>
          )}
        </div>

        {/* Prioridade */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Prioridade</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="pending">Pendente</option>
            <option value="in_progress">Em andamento</option>
            <option value="completed">Concluída</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Criando..." : "Criar Tarefa"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
