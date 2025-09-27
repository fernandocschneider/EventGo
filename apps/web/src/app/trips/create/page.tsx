"use client";

import { useMutation, useQuery, gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Calendar, MapPin, Car, Plus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { convertDateTimeLocalToISO } from "@/lib/utils";

const GET_EVENTS = gql`
  query GetEvents($limit: Int) {
    events(limit: $limit) {
      id
      title
      city
      venue
      date
    }
  }
`;

const CREATE_TRIP = gql`
  mutation CreateTrip($input: CreateTripInput!) {
    createTrip(input: $input) {
      id
      title
      code
      event {
        title
      }
    }
  }
`;

export default function CreateTripPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    eventId: "",
    originCity: "",
    destinationCity: "",
    date: "",
  });

  const { data: eventsData, loading: eventsLoading } = useQuery(GET_EVENTS, {
    variables: { limit: 50 },
  });

  const [createTrip, { loading: creating }] = useMutation(CREATE_TRIP, {
    onCompleted: (data) => {
      router.push(`/trips/${data.createTrip.id}`);
    },
    onError: (error) => {
      console.error("Erro ao criar viagem:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      await createTrip({
        variables: {
          input: {
            ...formData,
            date: convertDateTimeLocalToISO(formData.date),
          },
        },
      });
    } catch (error) {
      console.error("Erro ao criar viagem:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Faça login para criar uma viagem
            </h1>
            <p className="text-gray-500 mb-6">
              Você precisa estar logado para organizar viagens.
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
          <Link href="/trips">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Viagens
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Criar Nova Viagem
          </h1>
          <p className="text-gray-600">
            Organize uma viagem para um evento e convide pessoas para participar
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Informações da Viagem
            </CardTitle>
            <CardDescription>
              Preencha os dados da viagem que você quer organizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Trip Title */}
              <div>
                <Label htmlFor="title">Título da Viagem</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Ex: Galera de SP pro Rock in Rio"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>

              {/* Event Selection */}
              <div>
                <Label htmlFor="event">Evento</Label>
                <Select
                  value={formData.eventId}
                  onValueChange={(value) => handleInputChange("eventId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventsLoading ? (
                      <SelectItem value="loading" disabled>
                        Carregando eventos...
                      </SelectItem>
                    ) : (
                      eventsData?.events?.map((event: any) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} - {event.city} (
                          {new Date(event.date).toLocaleDateString("pt-BR")})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Origin City */}
              <div>
                <Label htmlFor="originCity">Cidade de Origem</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="originCity"
                    type="text"
                    placeholder="Ex: São Paulo"
                    value={formData.originCity}
                    onChange={(e) =>
                      handleInputChange("originCity", e.target.value)
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Destination City */}
              <div>
                <Label htmlFor="destinationCity">Cidade de Destino</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="destinationCity"
                    type="text"
                    placeholder="Ex: Rio de Janeiro"
                    value={formData.destinationCity}
                    onChange={(e) =>
                      handleInputChange("destinationCity", e.target.value)
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Trip Date */}
              <div>
                <Label htmlFor="date">Data da Viagem</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={creating} className="flex-1">
                  {creating ? "Criando..." : "Criar Viagem"}
                </Button>
                <Link href="/trips">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Como funciona?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                • Após criar a viagem, você receberá um código único para
                compartilhar
              </p>
              <p>
                • Pessoas podem participar da viagem usando o código ou link
              </p>
              <p>
                • Você pode adicionar custos (gasolina, hospedagem, etc.) que
                serão divididos automaticamente
              </p>
              <p>• Empresas podem oferecer veículos para sua viagem</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
