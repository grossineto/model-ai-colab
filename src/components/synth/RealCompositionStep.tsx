import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Loader2, User, UserCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SelectedImage {
  id: string;
  url: string;
  photographer: string;
}

interface RealCompositionStepProps {
  description: string;
  onNext: (bodyImage: SelectedImage, faceImage: SelectedImage) => void;
}

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
  };
  user: {
    name: string;
  };
  description?: string;
}

export const RealCompositionStep = ({ description, onNext }: RealCompositionStepProps) => {
  const [searchQuery, setSearchQuery] = useState(description || "");
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [bodyImage, setBodyImage] = useState<SelectedImage | null>(null);
  const [faceImage, setFaceImage] = useState<SelectedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Digite um termo de busca");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-images', {
        body: { query: searchQuery }
      });

      if (error) throw error;

      if (data?.results) {
        setImages(data.results);
        if (data.results.length === 0) {
          toast.info("Nenhuma imagem encontrada. Tente outro termo.");
        }
      }
    } catch (error) {
      console.error('Error searching images:', error);
      toast.error("Erro ao buscar imagens. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (description && description.trim()) {
      handleSearch();
    }
  }, []);

  const selectForBody = (image: UnsplashImage) => {
    const imageData: SelectedImage = {
      id: image.id,
      url: image.urls.regular,
      photographer: image.user.name
    };
    setBodyImage(imageData);
    toast.success("Imagem selecionada para o corpo");
  };

  const selectForFace = (image: UnsplashImage) => {
    const imageData: SelectedImage = {
      id: image.id,
      url: image.urls.regular,
      photographer: image.user.name
    };
    setFaceImage(imageData);
    toast.success("Imagem selecionada para o rosto");
  };

  const canProceed = bodyImage !== null && faceImage !== null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen bg-background p-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8 space-y-4"
        >
          <h2 className="text-4xl font-bold text-foreground">
            Selecione Corpo e Rosto
          </h2>
          <p className="text-lg text-muted-foreground">
            Escolha uma imagem para o corpo e outra para o rosto
          </p>
          
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Busque modelos..."
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                className="px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Buscar
                  </>
                )}
              </Button>
            </div>

            <div className="flex gap-4 justify-center">
              <div className={`px-4 py-2 rounded-full border-2 ${bodyImage ? 'bg-primary/10 border-primary' : 'bg-muted border-border'}`}>
                <User className="inline-block mr-2 h-4 w-4" />
                <span className="text-sm font-medium">
                  Corpo: {bodyImage ? '✓ Selecionado' : 'Não selecionado'}
                </span>
              </div>
              <div className={`px-4 py-2 rounded-full border-2 ${faceImage ? 'bg-accent/10 border-accent' : 'bg-muted border-border'}`}>
                <UserCircle2 className="inline-block mr-2 h-4 w-4" />
                <span className="text-sm font-medium">
                  Rosto: {faceImage ? '✓ Selecionado' : 'Não selecionado'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {images.map((image, index) => {
              const isBodySelected = bodyImage?.id === image.id;
              const isFaceSelected = faceImage?.id === image.id;
              
              return (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="relative rounded-2xl overflow-hidden group"
                >
                  <div className="aspect-[2/3] relative">
                    <img
                      src={image.urls.regular}
                      alt={`Photo by ${image.user.name}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {(isBodySelected || isFaceSelected) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    )}
                    
                    {isBodySelected && (
                      <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium">
                        <User className="inline-block mr-1 h-3 w-3" />
                        CORPO
                      </div>
                    )}
                    
                    {isFaceSelected && (
                      <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-sm text-accent-foreground px-3 py-1.5 rounded-full text-xs font-medium">
                        <UserCircle2 className="inline-block mr-1 h-3 w-3" />
                        ROSTO
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button
                        onClick={() => selectForBody(image)}
                        size="sm"
                        variant={isBodySelected ? "default" : "secondary"}
                        className="rounded-lg"
                      >
                        <User className="mr-1 h-4 w-4" />
                        Corpo
                      </Button>
                      <Button
                        onClick={() => selectForFace(image)}
                        size="sm"
                        variant={isFaceSelected ? "default" : "secondary"}
                        className="rounded-lg"
                      >
                        <UserCircle2 className="mr-1 h-4 w-4" />
                        Rosto
                      </Button>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-sm font-medium truncate">
                      {image.user.name}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {images.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Search className="h-20 w-20 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-2xl font-semibold text-muted-foreground mb-2">
              Faça uma busca para começar
            </h3>
            <p className="text-muted-foreground">
              Busque modelos para selecionar corpo e rosto
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center"
        >
          <Button
            onClick={() => bodyImage && faceImage && onNext(bodyImage, faceImage)}
            disabled={!canProceed}
            size="lg"
            className="rounded-xl px-8 hover:scale-105 transition-transform disabled:opacity-50"
          >
            Criar Composição
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
