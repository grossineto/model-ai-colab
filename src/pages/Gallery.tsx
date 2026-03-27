import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GeneratedModel {
  id: string;
  generated_image_url: string;
  description: string;
  custom_prompt: string;
  created_at: string;
  ai_percentage: number;
}

export default function Gallery() {
  const navigate = useNavigate();
  const [models, setModels] = useState<GeneratedModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_models')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error("Erro ao carregar galeria");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl: string, id: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `modelo-ia-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download iniciado!");
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('generated_models')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      
      setModels(models.filter(m => m.id !== deleteId));
      toast.success("Modelo excluído com sucesso!");
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error("Erro ao excluir modelo");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Galeria de Modelos
            </h1>
            <p className="text-muted-foreground">
              {models.length} {models.length === 1 ? 'modelo gerado' : 'modelos gerados'}
            </p>
          </div>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
            className="rounded-xl"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar
          </Button>
        </motion.div>

        {models.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-2xl text-muted-foreground mb-4">
              Nenhum modelo gerado ainda
            </p>
            <Button onClick={() => navigate('/')} size="lg" className="rounded-xl">
              Criar Primeiro Modelo
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model, index) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden shadow-soft border border-border group"
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={model.generated_image_url}
                    alt="Modelo gerado"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDownload(model.generated_image_url, model.id)}
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => setDeleteId(model.id)}
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    {model.ai_percentage}% IA
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {model.description}
                  </p>
                  {model.custom_prompt && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      ✨ {model.custom_prompt}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(model.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir modelo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O modelo será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
