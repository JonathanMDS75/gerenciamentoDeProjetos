import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

const CreateProject = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "medium",
    status: "active",
    start_date: "",
  });

  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    let error = "";

    if (field === "name" && !value.trim()) {
      error = "O nome do projeto é obrigatório.";
    }

    if (field === "description" && value.trim().length < 10) {
      error = "A descrição deve ter pelo menos 10 caracteres.";
    }

    if (field === "start_date" && !value) {
      error = "A data de início é obrigatória.";
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    validate(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Valida todos os campos antes de enviar
    Object.keys(formData).forEach((key) => validate(key, formData[key]));

    // Se houver erros, impede o envio
    if (Object.values(errors).some((err) => err)) {
      toast.error("Corrija os erros antes de enviar.");
      return;
    }

    try {
      await api.post("/api/projects", formData);
      toast.success("Projeto criado com sucesso!");
      navigate("/projects");
    } catch (error) {
      toast.error("Erro ao criar projeto");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Criar Novo Projeto</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome do Projeto *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded-md p-2 focus:ring-primary-500 focus:border-primary-500`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descrição *
          </label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className={`mt-1 block w-full border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } rounded-md p-2 focus:ring-primary-500 focus:border-primary-500`}
          ></textarea>
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Prioridade */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Prioridade
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="active">Ativo</option>
            <option value="paused">Pausado</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        {/* Data de início */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Data de Início *
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className={`mt-1 block w-full border ${
              errors.start_date ? "border-red-500" : "border-gray-300"
            } rounded-md p-2 focus:ring-primary-500 focus:border-primary-500`}
          />
          {errors.start_date && (
            <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
          )}
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Criar Projeto
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
