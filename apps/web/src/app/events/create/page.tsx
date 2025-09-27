"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft, Plus, Calendar, MapPin } from 'lucide-react';
import { convertDateTimeLocalToISO } from '@/lib/utils';

const GET_COMPANIES = gql`
  query GetMyCompanies {
    myCompanies {
      id
      name
    }
  }
`;

const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      title
      city
      venue
      date
    }
  }
`;

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    venue: '',
    date: '',
    organizerCompanyId: ''
  });
  const [error, setError] = useState('');

  const { data: companiesData } = useQuery(GET_COMPANIES, {
    skip: !isAuthenticated,
  });

  const [createEventMutation, { loading }] = useMutation(CREATE_EVENT, {
    onCompleted: (data) => {
      router.push(`/events/${data.createEvent.id}`);
    },
    onError: (error) => {
      setError('Erro ao criar evento. Tente novamente.');
      console.error('Erro:', error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await createEventMutation({
        variables: {
          input: {
            title: formData.title,
            description: formData.description || undefined,
            city: formData.city,
            venue: formData.venue,
            date: convertDateTimeLocalToISO(formData.date),
            organizerCompanyId: formData.organizerCompanyId || undefined,
          }
        }
      });
    } catch (error) {
      console.error('Erro no envio:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso Restrito
            </h1>
            <p className="text-gray-500 mb-6">
              Você precisa estar logado para criar eventos.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button>Fazer Login</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline">Criar Conta</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/events">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Eventos
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Criar Novo Evento
          </h1>
          <p className="text-gray-600">
            Cadastre um novo evento para que pessoas possam organizar viagens
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Informações do Evento
            </CardTitle>
            <CardDescription>
              Preencha os dados do evento que você deseja cadastrar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Event Title */}
              <div>
                <Label htmlFor="title">Título do Evento</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Ex: Rock in Rio 2024"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o evento..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              {/* City */}
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Ex: Rio de Janeiro"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>

              {/* Venue */}
              <div>
                <Label htmlFor="venue">Local</Label>
                <Input
                  id="venue"
                  type="text"
                  placeholder="Ex: Parque Olímpico"
                  value={formData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  required
                />
              </div>

              {/* Date */}
              <div>
                <Label htmlFor="date">Data do Evento</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              {/* Company Selection (optional) */}
              {companiesData?.myCompanies?.length > 0 && (
                <div>
                  <Label htmlFor="company">Empresa Organizadora (opcional)</Label>
                  <select
                    id="company"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.organizerCompanyId}
                    onChange={(e) => handleInputChange('organizerCompanyId', e.target.value)}
                  >
                    <option value="">Nenhuma empresa</option>
                    {companiesData.myCompanies.map((company: any) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Criando...' : 'Criar Evento'}
                </Button>
                <Link href="/events">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
