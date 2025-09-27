'use client';

import { useQuery, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Car,
  Plus,
  ArrowLeft,
  Clock,
  Building
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const GET_EVENT = gql`
  query GetEvent($id: ID!) {
    event(id: $id) {
      id
      title
      description
      city
      venue
      date
      organizerCompany {
        id
        name
        description
        contactEmail
      }
      trips {
        id
        title
        originCity
        destinationCity
        date
        code
        totalParticipants
        organizer {
          id
          name
        }
      }
    }
  }
`;

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id;

  const { data, loading, error } = useQuery(GET_EVENT, {
    variables: { id: eventId },
    skip: !eventId
  });

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

  if (error || !data?.event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Evento não encontrado
            </h1>
            <p className="text-gray-500 mb-6">
              O evento que você está procurando não existe ou foi removido.
            </p>
            <Link href="/events">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Eventos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const event = data.event;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/events">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Eventos
            </Button>
          </Link>
        </div>

        {/* Event Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="text-sm">
                  {formatDate(event.date)}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {event.trips?.reduce((acc: number, trip: any) => acc + trip.totalParticipants, 0) || 0} pessoas
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>
              
              {event.description && (
                <p className="text-gray-600 text-lg mb-6">
                  {event.description}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium">{event.venue}</p>
                    <p className="text-sm text-gray-500">{event.city}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium">{formatDate(event.date)}</p>
                    <p className="text-sm text-gray-500">Data do evento</p>
                  </div>
                </div>
              </div>

              {event.organizerCompany && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Organizado por {event.organizerCompany.name}
                      </p>
                      {event.organizerCompany.description && (
                        <p className="text-sm text-gray-600">
                          {event.organizerCompany.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Viagens Disponíveis
                  </CardTitle>
                  <CardDescription>
                    {event.trips?.length || 0} viagem(ns) organizada(s) para este evento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {event.trips?.map((trip: any) => (
                      <div key={trip.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{trip.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {trip.totalParticipants} pessoas
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {trip.originCity} → {trip.destinationCity}
                        </p>
                        <p className="text-xs text-gray-500">
                          Organizado por {trip.organizer.name}
                        </p>
                        <Link href={`/trips/${trip.id}`}>
                          <Button size="sm" className="w-full mt-2">
                            Ver Viagem
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Link href="/trips/create">
                      <Button className="w-full" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Nova Viagem
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Trips Section */}
        {event.trips && event.trips.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Viagens para este Evento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {event.trips.map((trip: any) => (
                <Card key={trip.id} className="hover:shadow-lg transition-shadow duration-200">
                  <Link href={`/trips/${trip.id}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg">{trip.title}</CardTitle>
                        <Badge className="bg-blue-100 text-blue-800">
                          {trip.totalParticipants} pessoas
                        </Badge>
                      </div>
                      <CardDescription>
                        {trip.originCity} → {trip.destinationCity}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{formatDate(trip.date)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>Organizado por {trip.organizer.name}</span>
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
          </div>
        )}

        {/* Empty State for Trips */}
        {(!event.trips || event.trips.length === 0) && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma viagem organizada ainda
            </h3>
            <p className="text-gray-500 mb-6">
              Seja o primeiro a organizar uma viagem para este evento!
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
