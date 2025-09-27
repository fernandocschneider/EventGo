"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Upload, Save, User } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      avatarUrl
      role
      profilePublicInfo
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      email
      avatarUrl
      role
      profilePublicInfo
    }
  }
`;

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatarUrl: "",
    profilePublicInfo: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: userData, loading } = useQuery(GET_ME, {
    skip: !isAuthenticated,
  });

  const [updateProfileMutation, { loading: updating }] = useMutation(
    UPDATE_PROFILE,
    {
      onCompleted: () => {
        setSuccess("Perfil atualizado com sucesso!");
        setError("");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      },
      onError: (error) => {
        setError("Erro ao atualizar perfil. Tente novamente.");
        console.error("Erro:", error);
      },
    }
  );

  useEffect(() => {
    if (userData?.me) {
      setFormData({
        name: userData.me.name || "",
        email: userData.me.email || "",
        avatarUrl: userData.me.avatarUrl || "",
        profilePublicInfo: userData.me.profilePublicInfo || "",
      });
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await updateProfileMutation({
        variables: {
          input: {
            name: formData.name,
            email: formData.email,
            avatarUrl: formData.avatarUrl || null,
            profilePublicInfo: formData.profilePublicInfo || null,
          },
        },
      });
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso Restrito
            </h1>
            <p className="text-gray-500 mb-6">
              Você precisa estar logado para editar seu perfil.
            </p>
            <Link href="/login">
              <Button>Fazer Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
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
          <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Editar Perfil
          </h1>
          <p className="text-gray-600">
            Atualize suas informações pessoais e foto de perfil
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Mantenha suas informações sempre atualizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                  {success}
                </div>
              )}

              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={formData.avatarUrl} />
                  <AvatarFallback className="text-lg">
                    {formData.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="avatarUrl">URL da Foto de Perfil</Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    placeholder="https://exemplo.com/foto.jpg"
                    value={formData.avatarUrl}
                    onChange={(e) =>
                      handleInputChange("avatarUrl", e.target.value)
                    }
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Cole a URL de uma imagem para definir sua foto de perfil
                  </p>
                </div>
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              {/* Profile Description */}
              <div>
                <Label htmlFor="profilePublicInfo">
                  Descrição Pública (opcional)
                </Label>
                <Textarea
                  id="profilePublicInfo"
                  placeholder="Conte um pouco sobre você para outros usuários..."
                  value={formData.profilePublicInfo}
                  onChange={(e) =>
                    handleInputChange("profilePublicInfo", e.target.value)
                  }
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Esta descrição será visível para outros usuários quando você
                  participar de viagens
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={updating} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {updating ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Link href="/dashboard">
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
