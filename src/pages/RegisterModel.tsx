import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "@/components/TagInput";
import { ArrowLeft, Upload } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  gender: z.string().min(1, "Selecione o gênero"),
  ethnicity: z.string().optional(),
  birth_date: z.string().min(1, "Data de nascimento é obrigatória"),
  weight: z.string().optional(),
  measurements: z.string().optional(),
  height: z.string().optional(),
  eye_color: z.string().optional(),
  hair_color: z.string().optional(),
  hair_length: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const RegisterModel = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const [facePhoto, setFacePhoto] = useState<File | null>(null);
  const [bodyPhoto, setBodyPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gender: "",
      ethnicity: "",
      birth_date: "",
      weight: "",
      measurements: "",
      height: "",
      eye_color: "",
      hair_color: "",
      hair_length: "",
    },
  });

  const uploadPhoto = async (file: File, prefix: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${prefix}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('model-photos')
      .upload(fileName, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('model-photos')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const onSubmit = async (data: FormData) => {
    if (!facePhoto || !bodyPhoto) {
      toast({
        title: "Fotos obrigatórias",
        description: "Por favor, adicione a foto de rosto e de corpo inteiro",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const facePhotoUrl = await uploadPhoto(facePhoto, 'face');
      const bodyPhotoUrl = await uploadPhoto(bodyPhoto, 'body');

      const { error } = await supabase.from('models').insert({
        name: data.name,
        gender: data.gender,
        ethnicity: data.ethnicity || null,
        birth_date: data.birth_date,
        weight: data.weight ? parseFloat(data.weight) : null,
        measurements: data.measurements,
        height: data.height ? parseFloat(data.height) : null,
        eye_color: data.eye_color,
        hair_color: data.hair_color,
        hair_length: data.hair_length,
        tags: tags,
        face_photo_url: facePhotoUrl,
        body_photo_url: bodyPhotoUrl,
      });

      if (error) throw error;

      toast({
        title: "Modelo cadastrado",
        description: "O modelo foi cadastrado com sucesso!",
      });

      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao cadastrar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao cadastrar o modelo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Nova Modelo</CardTitle>
            <CardDescription>
              Preencha os dados da modelo para cadastrá-la no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gênero *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="feminino">Feminino</SelectItem>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ethnicity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Etnia</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="branca">Branca</SelectItem>
                            <SelectItem value="negra">Negra</SelectItem>
                            <SelectItem value="parda">Parda</SelectItem>
                            <SelectItem value="asiática">Asiática</SelectItem>
                            <SelectItem value="indígena">Indígena</SelectItem>
                            <SelectItem value="latina">Latina</SelectItem>
                            <SelectItem value="ruiva">Ruiva</SelectItem>
                            <SelectItem value="outra">Outra</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="Ex: 65.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altura (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="Ex: 175" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="measurements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medidas</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 90-60-90" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="eye_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor dos Olhos</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Castanhos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hair_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor do Cabelo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Castanho" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hair_length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comprimento do Cabelo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="curto">Curto</SelectItem>
                            <SelectItem value="medio">Médio</SelectItem>
                            <SelectItem value="longo">Longo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label>Características / Tags</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Digite uma característica e pressione Enter para adicionar
                  </p>
                  <TagInput
                    tags={tags}
                    onChange={setTags}
                    placeholder="Ex: plus size, rastafári, tatuagens..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Foto de Rosto *</Label>
                    <div className="mt-2">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {facePhoto ? facePhoto.name : "Clique para adicionar"}
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => setFacePhoto(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label>Foto de Corpo Inteiro *</Label>
                    <div className="mt-2">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {bodyPhoto ? bodyPhoto.name : "Clique para adicionar"}
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => setBodyPhoto(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Cadastrando..." : "Cadastrar Modelo"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterModel;
