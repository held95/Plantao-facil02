'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';

export default function CriarPlantaoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: '',
    status: 'disponivel',
    horarioInicio: '',
    horarioFim: '',
    hospital: '',
    cidade: '',
    estado: 'SP',
    especialidade: '',
    valor: '',
    vagasTotal: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui voce adicionaria a logica para salvar o plantao
    console.log('Criando plantao:', formData);
    alert('Plantao criado com sucesso!');
    router.push('/plantoes');
  };

  const handleCancel = () => {
    router.push('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Criar Novo Plantao
          </h1>
          <p className="text-gray-600">
            Preencha os detalhes do plantao para publicar
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Informacoes do Plantao
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Titulo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titulo
                  </label>
                  <Input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Ex: Plantao Clinica Geral - Hospital Municipal"
                    className="w-full border-gray-200"
                    required
                  />
                </div>

                {/* Hospital */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital
                  </label>
                  <Input
                    type="text"
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleChange}
                    placeholder="Nome do hospital"
                    className="w-full border-gray-200"
                    required
                  />
                </div>

                {/* Especialidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidade
                  </label>
                  <select
                    name="especialidade"
                    value={formData.especialidade}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione uma especialidade</option>
                    <option value="Clinica Geral">Clinica Geral</option>
                    <option value="Cirurgia Geral">Cirurgia Geral</option>
                    <option value="Pediatria">Pediatria</option>
                    <option value="Ortopedia">Ortopedia</option>
                    <option value="Cardiologia">Cardiologia</option>
                    <option value="Pronto Socorro">Pronto Socorro</option>
                    <option value="Ginecologia e Obstetricia">Ginecologia e Obstetricia</option>
                    <option value="Anestesiologia">Anestesiologia</option>
                    <option value="Neurologia">Neurologia</option>
                    <option value="Psiquiatria">Psiquiatria</option>
                  </select>
                </div>

                {/* Descricao */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descricao
                  </label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Descricao detalhada do plantao, requisitos, etc."
                    className="w-full h-24 px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Data
                    </label>
                    <Input
                      type="date"
                      name="data"
                      value={formData.data}
                      onChange={handleChange}
                      className="w-full border-gray-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full h-10 px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="disponivel">Disponivel</option>
                      <option value="preenchido">Preenchido</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                {/* Horarios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Horario Inicio
                    </label>
                    <Input
                      type="time"
                      name="horarioInicio"
                      value={formData.horarioInicio}
                      onChange={handleChange}
                      className="w-full border-gray-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Horario Termino
                    </label>
                    <Input
                      type="time"
                      name="horarioFim"
                      value={formData.horarioFim}
                      onChange={handleChange}
                      className="w-full border-gray-200"
                      required
                    />
                  </div>
                </div>

                {/* Localizacao */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Cidade
                    </label>
                    <Input
                      type="text"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      placeholder="Nome da cidade"
                      className="w-full border-gray-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className="w-full h-10 px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="SP">Sao Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="BA">Bahia</option>
                      <option value="PR">Parana</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="SC">Santa Catarina</option>
                    </select>
                  </div>
                </div>

                {/* Valor e Vagas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Valor (R$)
                    </label>
                    <Input
                      type="number"
                      name="valor"
                      value={formData.valor}
                      onChange={handleChange}
                      placeholder="1200"
                      className="w-full border-gray-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vagas Totais
                    </label>
                    <Input
                      type="number"
                      name="vagasTotal"
                      value={formData.vagasTotal}
                      onChange={handleChange}
                      placeholder="3"
                      className="w-full border-gray-200"
                      required
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-6 pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    Criar Plantao
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
