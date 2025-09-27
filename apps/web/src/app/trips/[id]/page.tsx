"use client";

import { useQuery, gql } from "@apollo/client";
import { useParams } from "next/navigation";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  MapPin,
  Users,
  Car,
  Plus,
  ArrowLeft,
  Clock,
  DollarSign,
  Share2,
  Copy,
  UserPlus,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

const GET_TRIP = gql`
  query GetTrip($id: ID!) {
    trip(id: $id) {
      id
      title
      originCity
      destinationCity
      date
      code
      totalParticipants
      totalCosts
      event {
        id
        title
        city
        venue
        date
      }
      organizer {
        id
        name
        avatarUrl
      }
      participants {
        id
        joinedAt
        user {
          id
          name
          avatarUrl
          profilePublicInfo
        }
      }
      costItems {
        id
        label
        totalAmount
        perPersonShare
        createdAt
        creator {
          id
          name
        }
      }
      vehicleOffers {
        id
        capacity
        pricePerPerson
        pickupLocation
        pickupTime
        notes
        company {
          id
          name
        }
      }
    }
  }
`;

const JOIN_TRIP = gql`
  mutation JoinTrip($tripId: ID!, $code: String) {
    joinTrip(tripId: $tripId, code: $code) {
      id
      user {
        id
        name
      }
    }
  }
`;

export default function TripDetailPage() {
  const params = useParams();
  const tripId = params.id;
  const { user, isAuthenticated } = useAuth();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const { data, loading, error } = useQuery(GET_TRIP, {
    variables: { id: tripId },
    skip: !tripId,
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

  if (error || !data?.trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Viagem não encontrada
            </h1>
            <p className="text-gray-500 mb-6">
              A viagem que você está procurando não existe ou foi removida.
            </p>
            <Link href="/trips">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Viagens
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const trip = data.trip;
  const isOrganizer = user?.id === trip.organizer.id;
  const isParticipant = trip.participants.some(
    (p: any) => p.user.id === user?.id
  );

  const copyTripCode = () => {
    navigator.clipboard.writeText(trip.code);
    // Aqui você poderia mostrar um toast de sucesso
  };

  const copyTripLink = () => {
    const link = `${origin}/trips/${trip.id}`;
    navigator.clipboard.writeText(link);
    // Aqui você poderia mostrar um toast de sucesso
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/trips">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Viagens
            </Button>
          </Link>
        </div>

        {/* Trip Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="text-sm">
                  {formatDate(trip.date)}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {trip.totalParticipants} pessoas
                </div>
                <Badge variant="outline" className="text-sm">
                  Código: {trip.code}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {trip.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Car className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {trip.originCity} → {trip.destinationCity}
                    </p>
                    <p className="text-sm text-gray-500">Rota da viagem</p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium">{formatDate(trip.date)}</p>
                    <p className="text-sm text-gray-500">Data da viagem</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={trip.organizer.avatarUrl} />
                    <AvatarFallback>
                      {trip.organizer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">
                      Organizado por {trip.organizer.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Organizador da viagem
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Compartilhar Viagem
                  </CardTitle>
                  <CardDescription>
                    Convide pessoas para participar desta viagem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Código da viagem
                    </label>
                    <div className="flex gap-2 mt-1">
                      <Input value={trip.code} readOnly className="font-mono" />
                      <Button size="sm" onClick={copyTripCode}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Link da viagem
                    </label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={`${origin}/trips/${trip.id}`}
                        readOnly
                        className="text-xs"
                      />
                      <Button size="sm" onClick={copyTripLink}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {!isAuthenticated ? (
                    <Link href="/login">
                      <Button className="w-full">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Fazer Login para Participar
                      </Button>
                    </Link>
                  ) : isParticipant ? (
                    <Button className="w-full" disabled>
                      Você já está participando
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => setShowJoinForm(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Participar da Viagem
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Cost Management Button (for organizer) */}
        {isOrganizer && (
          <div className="mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Gerenciar Custos da Viagem
                    </h3>
                    <p className="text-sm text-gray-600">
                      Adicione custos como gasolina, hospedagem e ingressos para
                      dividir entre os participantes
                    </p>
                  </div>
                  <Link href={`/trips/${trip.id}/costs`}>
                    <Button>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Gerenciar Custos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Event Info */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Evento Relacionado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {trip.event.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {trip.event.venue} • {trip.event.city}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(trip.event.date)}
                  </p>
                </div>
                <Link href={`/events/${trip.event.id}`}>
                  <Button variant="outline">Ver Evento</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Participants */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Participantes ({trip.participants.length})
            </h2>
            <div className="space-y-3">
              {trip.participants.map((participant: any) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg"
                >
                  <Avatar>
                    <AvatarImage src={participant.user.avatarUrl} />
                    <AvatarFallback>
                      {participant.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {participant.user.name}
                    </p>
                    {participant.user.profilePublicInfo && (
                      <p className="text-sm text-gray-500">
                        {participant.user.profilePublicInfo}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatDate(participant.joinedAt)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Items */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Custos da Viagem
            </h2>
            {trip.costItems.length > 0 ? (
              <div className="space-y-3">
                {trip.costItems.map((cost: any) => (
                  <div key={cost.id} className="p-4 bg-white rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        {cost.label}
                      </h4>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          R$ {Number(cost.totalAmount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          R$ {Number(cost.perPersonShare).toFixed(2)} por pessoa
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Criado por {cost.creator.name} •{" "}
                      {formatDate(cost.createdAt)}
                    </p>
                  </div>
                ))}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-gray-900">
                      R$ {Number(trip.totalCosts).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 text-right">
                    R${" "}
                    {trip.totalParticipants > 0
                      ? (
                          Number(trip.totalCosts) / trip.totalParticipants
                        ).toFixed(2)
                      : Number(trip.totalCosts).toFixed(2)}{" "}
                    por pessoa
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg">
                <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhum custo adicionado ainda</p>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Offers */}
        {trip.vehicleOffers.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Ofertas de Veículos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trip.vehicleOffers.map((offer: any) => (
                <Card key={offer.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {offer.company.name}
                      </CardTitle>
                      <Badge variant="outline">{offer.capacity} lugares</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{offer.pickupLocation}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{formatDate(offer.pickupTime)}</span>
                      </div>
                      {offer.pricePerPerson && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>
                            R$ {Number(offer.pricePerPerson).toFixed(2)} por
                            pessoa
                          </span>
                        </div>
                      )}
                      {offer.notes && (
                        <p className="text-sm text-gray-500 mt-2">
                          {offer.notes}
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
