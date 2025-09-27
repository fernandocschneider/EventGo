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
import { Input } from "@/components/ui/input";
import {
  Calendar,
  MapPin,
  Users,
  Car,
  Search,
  Plus,
  Filter,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

const GET_TRIPS = gql`
  query GetTrips($limit: Int, $filter: TripsFilter) {
    trips(limit: $limit, filter: $filter) {
      id
      title
      originCity
      destinationCity
      date
      code
      totalParticipants
      event {
        id
        title
        city
        date
      }
      organizer {
        id
        name
      }
    }
  }
`;

export default function TripsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const { data, loading, error } = useQuery(GET_TRIPS, {
    variables: {
      limit: 20,
      filter: {
        search: searchQuery || undefined,
        city: cityFilter || undefined,
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Viagens</h1>
              <p className="text-gray-600 mt-2">
                Encontre viagens organizadas para eventos e participe
              </p>
            </div>
            <Link href="/trips/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Criar Viagem
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar viagens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Filtrar por cidade..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Erro ao carregar viagens</p>
            <Button onClick={() => router.refresh()} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.trips?.map((trip: any) => (
              <Card
                key={trip.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <Link href={`/trips/${trip.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {formatDate(trip.date)}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {trip.totalParticipants} pessoas
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">
                      {trip.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      para {trip.event.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Car className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {trip.originCity} → {trip.destinationCity}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{formatDate(trip.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{trip.event.city}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Organizado por {trip.organizer.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {trip.code}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && (!data?.trips || data.trips.length === 0) && (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma viagem encontrada
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || cityFilter
                ? "Tente ajustar os filtros de busca"
                : "Seja o primeiro a organizar uma viagem!"}
            </p>
            <Link href="/trips/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Organizar Primeira Viagem
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
