import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Share2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SelectedImage {
  id: string;
  url: string;
  photographer: string;
}

interface RealCompositionResultStepProps {
  bodyImage: SelectedImage;
  faceImage: SelectedImage;
  description: string;
  onNext: () => void;
}

export const RealCompositionResultStep = ({ 
  bodyImage, 
  faceImage, 
  description,
  onNext 
}: RealCompositionResultStepProps) => {
  const [composedImage, setComposedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generateComposition();
  }, []);

  const generateComposition = async () => {
    setIsGenerating(true);
    try {
      console.log('Calling compose-real-model with:', { 
        bodyImageUrl: bodyImage.url,
        faceImageUrl: faceImage.url
      });

      const { data, error } = await supabase.functions.invoke('compose-real-model', {
        body: {
          bodyImageUrl: bodyImage.url,
          faceImageUrl: faceImage.url
        }
      });

      console.log('Response from compose-real-model:', { data, error });

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }

      if (data?.composedImage) {
        console.log('Composed image received');
        setComposedImage(data.composedImage);
        
        // Save to database
        const { data: { user } } = await supabase.auth.getUser();
        const { error: insertError } = await supabase
          .from('generated_models')
          .insert([{
            user_id: user?.id || null,
            generated_image_url: data.composedImage,
            description: description,
            custom_prompt: 'Modelo Real Composta',
            reference_images: [bodyImage, faceImage] as any,
            ai_percentage: 0 // Real composition, not AI generated
          }]);

        if (insertError) {
          console.error('Error saving composition:', insertError);
        } else {
          console.log('Composition saved successfully');
        }
        
        toast.success("Composição criada com sucesso!");
      } else {
        console.error('No composedImage in response:', data);
        toast.error("Imagem não foi gerada. Verifique os logs.");
      }
    } catch (error) {
      console.error('Error composing model:', error);
      toast.error("Erro ao criar composição. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!composedImage) return;
    
    const link = document.createElement('a');
    link.href = composedImage;
    link.download = `modelo-composta-${Date.now()}.png`;
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
          <h3 className="text-2xl font-bold text-foreground">Criando composição...</h3>
          <p className="text-muted-foreground">Mesclando corpo e rosto</p>
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
            Sua Modelo Composta Está Pronta
          </h2>
          <p className="text-lg text-muted-foreground">
            Combinação do corpo e rosto de modelos reais
          </p>
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
                {composedImage ? (
                  <img
                    src={composedImage}
                    alt="Modelo Composta"
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
                  <div className="bg-accent/90 backdrop-blur-sm text-accent-foreground px-4 py-2 rounded-full text-sm font-medium">
                    Modelo Real Composta
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border space-y-4">
              <h3 className="text-xl font-bold text-foreground">Imagens de Origem</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Corpo:</p>
                  <div className="relative group rounded-xl overflow-hidden">
                    <img
                      src={bodyImage.url}
                      alt="Corpo"
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm">{bodyImage.photographer}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Rosto:</p>
                  <div className="relative group rounded-xl overflow-hidden">
                    <img
                      src={faceImage.url}
                      alt="Rosto"
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm">{faceImage.photographer}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex justify-end"
            >
              <Button
                onClick={onNext}
                size="lg"
                className="rounded-xl px-8 hover:scale-105 transition-transform"
              >
                Ver Galeria
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
