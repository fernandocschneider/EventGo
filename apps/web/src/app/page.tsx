"use client";

import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  MapPin,
  Users,
  Car,
  Search,
  TrendingUp,
  Shield,
  Zap,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const GET_EVENTS_AND_TRIPS = gql`
  query GetEventsAndTrips(
    $eventLimit: Int
    $tripLimit: Int
    $eventFilter: EventsFilter
  ) {
    events(limit: $eventLimit, filter: $eventFilter) {
      id
      title
      description
      city
      venue
      date
      organizerCompany {
        name
      }
      trips {
        id
        totalParticipants
      }
    }
    trips(limit: $tripLimit) {
      id
      title
      originCity
      destinationCity
      date
      totalParticipants
      event {
        title
        city
        date
      }
      organizer {
        name
      }
    }
  }
`;

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, loading, error } = useQuery(GET_EVENTS_AND_TRIPS, {
    variables: {
      eventLimit: 6,
      tripLimit: 4,
      eventFilter: searchQuery ? { search: searchQuery } : null,
    },
  });

  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const features = [
    {
      icon: Users,
      title: "Organize em Grupo",
      description: "Crie viagens e convide amigos para participar facilmente",
    },
    {
      icon: TrendingUp,
      title: "Divida os Custos",
      description: "Calcule automaticamente os gastos por pessoa",
    },
    {
      icon: Shield,
      title: "Seguro e Confiável",
      description: "Plataforma segura com controle de acesso",
    },
    {
      icon: Zap,
      title: "Rápido e Fácil",
      description: "Interface intuitiva e processo simplificado",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Organize viagens em grupo
              <span className="block text-yellow-400">
                para eventos incríveis
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Conecte-se com pessoas, divida custos e aproveite shows, festivais
              e eventos com segurança e praticidade.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Buscar eventos ou viagens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  className="pl-12 pr-4 py-4 text-lg w-full bg-white/10 border-white/20 text-white placeholder:text-gray-300 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                >
                  Ver Eventos
                </Button>
              </Link>
              <Link href="/trips/create">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-purple-600 hover:text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                >
                  Criar Viagem
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que usar o GroupTravel?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A maneira mais fácil e segura de organizar viagens em grupo para
              seus eventos favoritos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center group">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Eventos em Destaque
              </h2>
              <p className="text-gray-600">
                Descubra os próximos grandes eventos
              </p>
            </div>
            <Link href="/events">
              <Button variant="outline">Ver Todos</Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 loading-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Erro ao carregar eventos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.events?.map((event: any) => (
                <Card
                  key={event.id}
                  className="card-transition cursor-pointer bg-white border-0 shadow-md hover:shadow-xl"
                >
                  <Link href={`/events/${event.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {formatDate(event.date)}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {event.trips?.reduce(
                            (acc: number, trip: any) =>
                              acc + trip.totalParticipants,
                            0
                          ) || 0}
                        </div>
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">
                        {event.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span>
                            {event.city} • {event.venue}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        {event.organizerCompany && (
                          <div className="flex items-center text-sm text-gray-500">
                            <span>por {event.organizerCompany.name}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Trips Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Viagens Recentes
              </h2>
              <p className="text-gray-600">
                Veja as viagens organizadas pela comunidade
              </p>
            </div>
            <Link href="/trips">
              <Button variant="outline">Ver Todas</Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-xl p-6 loading-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.trips?.map((trip: any) => (
                <Card
                  key={trip.id}
                  className="card-hover cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
                >
                  <Link href={`/trips/${trip.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">
                          {trip.title}
                        </CardTitle>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {trip.totalParticipants} pessoas
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-600">
                        para {trip.event.title}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Car className="h-4 w-4 mr-2 text-blue-500" />
                          <span>
                            {trip.originCity} → {trip.destinationCity}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-blue-500" />
                          <span>{formatDate(trip.date)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Organizado por {trip.organizer.name}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para começar sua próxima aventura?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de pessoas que já organizam suas viagens com
            segurança e praticidade
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                Criar Conta Gratuita
              </Button>
            </Link>
            <Link href="/trips/create">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg font-semibold transition-smooth"
              >
                Criar Primeira Viagem
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
