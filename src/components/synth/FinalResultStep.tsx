import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { ArrowRight, Download, Share2, Loader2, Video, ImagePlus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SelectedImage {
  id: string;
  url: string;
  photographer: string;
}

interface FinalResultStepProps {
  selectedImages: SelectedImage[];
  description: string;
  customPrompt: string;
  generatedBaseImage: string;
  onNext: (generatedImageUrl?: string) => void;
  onGenerateNewPhoto?: () => void;
}

export const FinalResultStep = ({ selectedImages, description, customPrompt, generatedBaseImage, onNext, onGenerateNewPhoto }: FinalResultStepProps) => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [aiPercentage, setAiPercentage] = useState(55);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generateFinalModel();
  }, []);

  const generateFinalModel = async () => {
    setIsGenerating(true);
    try {
      console.log('Calling generate-model for final with:', { 
        imagesCount: selectedImages.length, 
        description, 
        customPrompt 
      });

      const { data, error } = await supabase.functions.invoke('generate-model', {
        body: {
          referenceImages: selectedImages,
          prompt: `${description}. ${customPrompt}`,
          description: `${description}. Additional customization: ${customPrompt}`
        }
      });

      console.log('Response from generate-model:', { data, error });

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }

      if (data?.generatedImage) {
        console.log('Generated image received, length:', data.generatedImage.length);
        setGeneratedImage(data.generatedImage);
        setAiPercentage(data.aiPercentage || 55);
        
        // Criar dados para o gráfico de distribuição incluindo IA
        const chartData = [
          {
            name: 'IA Original',
            value: data.aiPercentage || 55,
            color: "hsl(var(--primary))"
          },
          ...selectedImages.map((img, index) => ({
            name: `Modelo ${index + 1}`,
            value: data.referencePercentages[index] || 0,
            color: index === 0 ? "hsl(var(--accent))" : 
                   index === 1 ? "hsl(var(--secondary))" :
                   index === 2 ? "hsl(var(--chart-1))" :
                   index === 3 ? "hsl(var(--chart-2))" :
                   "hsl(var(--chart-3))"
          }))
        ];
        
        setDistributionData(chartData);

        // Salvar a geração no banco de dados
        const { data: { user } } = await supabase.auth.getUser();
        const { error: insertError } = await supabase
          .from('generated_models')
          .insert([{
            user_id: user?.id || null,
            generated_image_url: data.generatedImage,
            description,
            custom_prompt: customPrompt,
            reference_images: selectedImages as any,
            ai_percentage: data.aiPercentage
          }]);

        if (insertError) {
          console.error('Error saving generation:', insertError);
        } else {
          console.log('Generation saved successfully');
        }
        
        toast.success("Modelo gerado com sucesso!");
      } else {
        console.error('No generatedImage in response:', data);
        toast.error("Imagem não foi gerada. Verifique os logs.");
      }
    } catch (error) {
      console.error('Error generating model:', error);
      toast.error("Erro ao gerar modelo. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    // Criar um link temporário para download
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `modelo-ia-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download iniciado!");
  };

  const handleShare = () => {
    toast.info("Funcionalidade de compartilhamento em breve!");
  };

  if (isGenerating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-background"
      >
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
          <h3 className="text-2xl font-bold text-foreground">Gerando sua modelo com IA...</h3>
          <p className="text-muted-foreground">Isso pode levar alguns segundos</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Sua Modelo IA Está Pronta
          </h2>
          <p className="text-lg text-muted-foreground">
            Gerada a partir de {selectedImages.length} modelos selecionados com características correspondentes ao prompt
          </p>
          <div className="inline-block bg-muted/50 rounded-full px-4 py-2 mt-2">
            <p className="text-sm text-muted-foreground">
              📝 Descrição: <span className="font-medium text-foreground">{description}</span>
            </p>
          </div>
          {customPrompt && (
            <div className="inline-block bg-muted/50 rounded-full px-4 py-2 mt-2 ml-2">
              <p className="text-sm text-muted-foreground">
                ✨ Personalização: <span className="font-medium text-foreground">{customPrompt}</span>
              </p>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl overflow-hidden shadow-elegant border-2 border-dashed border-border">
              <div className="aspect-[3/4] relative flex items-center justify-center p-8">
                {generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Modelo Gerada com IA"
                    className="w-full h-full object-contain drop-shadow-2xl"
                    style={{ 
                      filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-muted-foreground">Erro ao carregar imagem</p>
                  </div>
                )}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
                  <div className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                    Gerado por IA
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-4"
            >
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1 rounded-xl"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Baixar Imagem
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1 rounded-xl"
                size="lg"
              >
                <Share2 className="mr-2 h-5 w-5" />
                Compartilhar
              </Button>
            </motion.div>

            {/* Action buttons for video/new photo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-card rounded-2xl p-6 shadow-soft border border-border space-y-4"
            >
              <h3 className="text-xl font-bold text-foreground text-center">O que você deseja fazer agora?</h3>
              <div className="flex flex-col gap-4">
                <Button
                  onClick={() => onNext(generatedImage || undefined)}
                  size="lg"
                  className="w-full rounded-xl py-6 text-lg hover:scale-[1.02] transition-transform bg-gradient-to-r from-primary to-primary/80"
                >
                  <Video className="mr-3 h-6 w-6" />
                  Criar Vídeo com a Modelo
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
                {onGenerateNewPhoto && (
                  <Button
                    onClick={onGenerateNewPhoto}
                    variant="outline"
                    size="lg"
                    className="w-full rounded-xl py-6 text-lg hover:scale-[1.02] transition-transform border-2"
                  >
                    <ImagePlus className="mr-3 h-6 w-6" />
                    Gerar Nova Foto com Prompt
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Distribuição de Características
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {aiPercentage}% gerado por IA original + {100 - aiPercentage}% distribuído entre modelos de referência
              </p>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border space-y-4">
              <h3 className="text-xl font-bold text-foreground">Modelos de Referência</h3>
              <div className="grid grid-cols-2 gap-4">
                {selectedImages.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={`Referência ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div>
                        <p className="text-white text-sm font-medium">Modelo {index + 1}</p>
                        <p className="text-white/80 text-xs">
                          {distributionData[index + 1]?.value || 0}% de influência
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
