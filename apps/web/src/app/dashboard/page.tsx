"use client";

import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  MapPin,
  Users,
  Car,
  Plus,
  Settings,
  LogOut,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      role
      avatarUrl
      organizedTrips {
        id
        title
        originCity
        destinationCity
        date
        code
        totalParticipants
        event {
          title
          city
        }
      }
      participations {
        id
        trip {
          id
          title
          originCity
          destinationCity
          date
          code
          totalParticipants
          event {
            title
            city
          }
          organizer {
            name
          }
        }
      }
      ownedCompanies {
        id
        name
        events {
          id
          title
          city
          date
        }
      }
    }
  }
`;

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const { data, loading, error } = useQuery(GET_ME, {
    skip: !user,
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Erro ao carregar dados</p>
            <Button onClick={() => router.refresh()} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const me = data?.me;
  const organizedTrips = me?.organizedTrips || [];
  const participations = me?.participations || [];
  const companies = me?.ownedCompanies || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={me?.avatarUrl} />
                <AvatarFallback>
                  {me?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Olá, {me?.name}!
                </h1>
                <p className="text-gray-600">
                  Bem-vindo ao seu painel de controle
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Viagens Organizadas
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {organizedTrips.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Participações
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {participations.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Empresas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {companies.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Trips */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Minhas Viagens Organizadas
              </h2>
              <Link href="/trips/create">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Viagem
                </Button>
              </Link>
            </div>

            {organizedTrips.length > 0 ? (
              <div className="space-y-4">
                {organizedTrips.map((trip: any) => (
                  <Card
                    key={trip.id}
                    className="hover:shadow-lg transition-shadow duration-200"
                  >
                    <Link href={`/trips/${trip.id}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {trip.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              para {trip.event.title}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {trip.totalParticipants} pessoas
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Car className="h-4 w-4 mr-2" />
                            <span>
                              {trip.originCity} → {trip.destinationCity}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(trip.date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>Código: {trip.code}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma viagem organizada
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece organizando sua primeira viagem!
                  </p>
                  <Link href="/trips/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Organizar Viagem
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* My Participations */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Viagens que Participo
            </h2>

            {participations.length > 0 ? (
              <div className="space-y-4">
                {participations.map((participation: any) => {
                  const trip = participation.trip;
                  return (
                    <Card
                      key={participation.id}
                      className="hover:shadow-lg transition-shadow duration-200"
                    >
                      <Link href={`/trips/${trip.id}`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-gray-900">
                                {trip.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                para {trip.event.title}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {trip.totalParticipants} pessoas
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Car className="h-4 w-4 mr-2" />
                              <span>
                                {trip.originCity} → {trip.destinationCity}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{formatDate(trip.date)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>Organizado por {trip.organizer.name}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma participação
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Explore eventos e participe de viagens!
                  </p>
                  <Link href="/events">
                    <Button variant="outline">Ver Eventos</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Companies Section */}
        {companies.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Minhas Empresas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company: any) => (
                <Card key={company.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <CardDescription>
                      {company.events.length} evento(s) cadastrado(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {company.events.slice(0, 3).map((event: any) => (
                        <div key={event.id} className="text-sm text-gray-600">
                          <p className="font-medium">{event.title}</p>
                          <p className="text-gray-500">
                            {event.city} • {formatDate(event.date)}
                          </p>
                        </div>
                      ))}
                      {company.events.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{company.events.length - 3} mais eventos
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
