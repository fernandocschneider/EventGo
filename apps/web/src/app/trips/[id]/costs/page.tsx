"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, gql } from "@apollo/client";
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  Plus,
  DollarSign,
  Trash2,
  Edit,
  Users,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const GET_TRIP = gql`
  query GetTrip($id: ID!) {
    trip(id: $id) {
      id
      title
      totalParticipants
      organizer {
        id
        name
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
    }
  }
`;

const CREATE_COST_ITEM = gql`
  mutation CreateCostItem($input: CreateCostItemInput!) {
    createCostItem(input: $input) {
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
  }
`;

const UPDATE_COST_ITEM = gql`
  mutation UpdateCostItem($id: ID!, $input: CreateCostItemInput!) {
    updateCostItem(id: $id, input: $input) {
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
  }
`;

const DELETE_COST_ITEM = gql`
  mutation DeleteCostItem($id: ID!) {
    deleteCostItem(id: $id)
  }
`;

export default function TripCostsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id;
  const { user, isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    totalAmount: "",
  });
  const [error, setError] = useState("");

  const {
    data,
    loading,
    error: queryError,
    refetch,
  } = useQuery(GET_TRIP, {
    variables: { id: tripId },
    skip: !tripId,
  });

  const [createCostItem] = useMutation(CREATE_COST_ITEM, {
    onCompleted: () => {
      setShowForm(false);
      setFormData({ label: "", totalAmount: "" });
      setError("");
      refetch();
    },
    onError: (error) => {
      setError("Erro ao criar item de custo. Tente novamente.");
      console.error("Erro:", error);
    },
  });

  const [updateCostItem] = useMutation(UPDATE_COST_ITEM, {
    onCompleted: () => {
      setEditingItem(null);
      setFormData({ label: "", totalAmount: "" });
      setError("");
      refetch();
    },
    onError: (error) => {
      setError("Erro ao atualizar item de custo. Tente novamente.");
      console.error("Erro:", error);
    },
  });

  const [deleteCostItem] = useMutation(DELETE_COST_ITEM, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      setError("Erro ao deletar item de custo. Tente novamente.");
      console.error("Erro:", error);
    },
  });

  const trip = data?.trip;
  const isOrganizer = user?.id === trip?.organizer?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amount = parseFloat(formData.totalAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Valor deve ser um número positivo");
      return;
    }

    try {
      if (editingItem) {
        await updateCostItem({
          variables: {
            id: editingItem.id,
            input: {
              tripId: tripId,
              label: formData.label,
              totalAmount: amount,
            },
          },
        });
      } else {
        await createCostItem({
          variables: {
            input: {
              tripId: tripId,
              label: formData.label,
              totalAmount: amount,
            },
          },
        });
      }
    } catch (error) {
      console.error("Erro no envio:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      label: item.label,
      totalAmount: item.totalAmount.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (confirm("Tem certeza que deseja deletar este item de custo?")) {
      try {
        await deleteCostItem({
          variables: { id: itemId },
        });
      } catch (error) {
        console.error("Erro ao deletar:", error);
      }
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ label: "", totalAmount: "" });
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso Restrito
            </h1>
            <p className="text-gray-500 mb-6">
              Você precisa estar logado para gerenciar custos da viagem.
            </p>
            <Link href="/login">
              <Button>Fazer Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Viagem não encontrada
            </h1>
            <p className="text-gray-500 mb-6">
              A viagem que você está procurando não existe.
            </p>
            <Link href="/trips">
              <Button>Voltar para Viagens</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isOrganizer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso Negado
            </h1>
            <p className="text-gray-500 mb-6">
              Apenas o organizador da viagem pode gerenciar os custos.
            </p>
            <Link href={`/trips/${tripId}`}>
              <Button>Voltar para Viagem</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalCosts = trip.costItems.reduce(
    (sum: number, item: any) => sum + Number(item.totalAmount),
    0
  );
  const costPerPerson =
    trip.totalParticipants > 0
      ? totalCosts / trip.totalParticipants
      : totalCosts;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href={`/trips/${tripId}`}>
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Viagem
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciar Custos - {trip.title}
          </h1>
          <p className="text-gray-600">
            Adicione e gerencie os custos da viagem que serão divididos entre os
            participantes
          </p>
        </div>

        {/* Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Resumo dos Custos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  R$ {totalCosts.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">Total dos Custos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  R$ {costPerPerson.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">Por Pessoa</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {trip.totalParticipants}
                </p>
                <p className="text-sm text-gray-500">Participantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Cost Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Custo
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingItem ? "Editar Item de Custo" : "Adicionar Novo Custo"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="label">Nome do Item</Label>
                    <Input
                      id="label"
                      type="text"
                      placeholder="Ex: Gasolina, Hospedagem, Ingresso"
                      value={formData.label}
                      onChange={(e) =>
                        handleInputChange("label", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="amount">Valor Total (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.totalAmount}
                    onChange={(e) =>
                      handleInputChange("totalAmount", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit">
                    {editingItem ? "Atualizar" : "Adicionar"} Custo
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Cost Items List */}
        <div className="space-y-4">
          {trip.costItems.length > 0 ? (
            trip.costItems.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {item.label}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-medium text-gray-900">
                          R$ {Number(item.totalAmount).toFixed(2)}
                        </span>
                        <span>
                          R$ {Number(item.perPersonShare).toFixed(2)} por pessoa
                        </span>
                        <span>Criado por {item.creator.name}</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum custo adicionado
                </h3>
                <p className="text-gray-500 mb-4">
                  Comece adicionando os custos da viagem para dividir entre os
                  participantes.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Custo
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
