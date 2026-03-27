import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import modelBaseAI from "@/assets/model-base-ai.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SelectedImage {
  id: string;
  url: string;
  photographer: string;
}

interface CustomizeModelStepProps {
  selectedImages: SelectedImage[];
  description: string;
  onNext: (prompt: string, generatedImage: string) => void;
}

export const CustomizeModelStep = ({ selectedImages, description, onNext }: CustomizeModelStepProps) => {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  useEffect(() => {
    const generate = async () => {
      try {
        setIsGenerating(true);
        const { data, error } = await supabase.functions.invoke('generate-model', {
          body: {
            referenceImages: selectedImages,
            prompt: description,
            description
          }
        });
        if (error) throw error;
        if (data?.generatedImage) {
          setGeneratedImage(data.generatedImage);
        } else {
          toast.error("Não foi possível gerar a imagem base.");
        }
      } catch (e) {
        console.error('generate-model base error', e);
        toast.error("Erro ao gerar a imagem base.");
      } finally {
        setIsGenerating(false);
      }
    };
    if (selectedImages?.length) generate();
  }, [description, JSON.stringify(selectedImages)]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen bg-background p-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-foreground">
                Personalize Sua Modelo
              </h2>
              <p className="text-lg text-muted-foreground">
                Use o prompt para definir a pose, expressão, fundo e qualquer outro detalhe que desejar.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl p-6 shadow-soft border border-border space-y-4"
            >
              <label className="block text-sm font-medium text-muted-foreground">
                Descreva como você quer a modelo
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Modelo correndo, sorrindo, fundo de praia ao pôr do sol..."
                className="min-h-[120px] text-lg rounded-xl border-2 focus:border-primary transition-colors"
              />

              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">💡 Dicas para o prompt:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Descreva a pose (correndo, pulando, posando)</li>
                  <li>Especifique a expressão (sorrindo, séria, confiante)</li>
                  <li>Escolha o fundo (transparente, urbano, natureza)</li>
                  <li>Adicione detalhes de iluminação e ambiente</li>
                </ul>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="flex justify-end pt-2"
              >
                <Button
                  onClick={() => generatedImage && onNext(prompt, generatedImage)}
                  disabled={!prompt || !generatedImage || isGenerating}
                  size="lg"
                  className="rounded-xl px-6 hover:scale-105 transition-transform"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Gerar Imagem Final
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="bg-card rounded-2xl overflow-hidden shadow-elegant border border-border">
              <div className="aspect-[3/4] relative">
                {isGenerating ? (
                  <div className="w-full h-full flex items-center justify-center bg-muted/50">
                    <div className="text-center space-y-4">
                      <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
                      <p className="text-muted-foreground">Gerando modelo IA...</p>
                    </div>
                  </div>
                ) : generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Modelo Base Gerada por IA"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={modelBaseAI}
                    alt="Modelo Base"
                    className="w-full h-full object-cover opacity-50"
                  />
                )}
                <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                  Modelo Base IA
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-4 text-center"
            >
              <p className="text-sm text-muted-foreground">
                Esta é a modelo base. Agora personalize pose e cenário.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
