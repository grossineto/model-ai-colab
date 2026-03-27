import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ArrowRight, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SelectedImage {
  id: string;
  url: string;
  photographer: string;
}

interface ReferenceSelectionStepProps {
  description: string;
  onNext: (images: SelectedImage[]) => void;
}

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
  };
  user: {
    name: string;
    profile_url?: string;
  };
  description?: string;
  alt_description?: string;
}

export const ReferenceSelectionStep = ({ description, onNext }: ReferenceSelectionStepProps) => {
  const [searchQuery, setSearchQuery] = useState(description || "");
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [selected, setSelected] = useState<SelectedImage[]>([]);
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

  // Busca automática quando o componente é montado com uma descrição
  useEffect(() => {
    if (description && description.trim()) {
      handleSearch();
    }
  }, []); // Executa apenas uma vez ao montar

  const toggleSelection = (image: UnsplashImage) => {
    const imageData: SelectedImage = {
      id: image.id,
      url: image.urls.regular,
      photographer: image.user.name
    };

    const isSelected = selected.some(s => s.id === image.id);
    
    if (isSelected) {
      setSelected(selected.filter((s) => s.id !== image.id));
    } else if (selected.length < 5) {
      setSelected([...selected, imageData]);
    } else {
      toast.warning("Você pode selecionar no máximo 5 imagens");
    }
  };

  const canProceed = selected.length >= 2 && selected.length <= 5;

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
            Selecione Modelos de Referência
          </h2>
          <p className="text-lg text-muted-foreground">
            Busque modelos reais da You Models por características físicas
          </p>
          
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ex: mulher negra cabelo curto olhos claros, loira alta olhos azuis..."
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

            {description && (
              <div className="inline-block bg-primary/10 rounded-full px-4 py-2 border border-primary/20">
                <p className="text-sm">
                  📝 Descrição original: <span className="font-medium text-primary">{description}</span>
                </p>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Selecionados: {selected.length} / 5 {!canProceed && "(mínimo 2)"}
            </p>
          </div>
        </motion.div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
            {images.map((image, index) => {
              const isSelected = selected.some(s => s.id === image.id);
              
              return (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  onClick={() => toggleSelection(image)}
                  className={`relative cursor-pointer group rounded-2xl overflow-hidden transition-all duration-300 ${
                    isSelected
                      ? "ring-4 ring-primary shadow-elegant scale-105"
                      : "hover:scale-105 hover:shadow-soft"
                  }`}
                >
                  <div className="aspect-[2/3] relative">
                    <img
                      src={image.urls.regular}
                      alt={`Photo by ${image.user.name}`}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center"
                      >
                        <div className="bg-primary rounded-full p-3">
                          <Check className="h-8 w-8 text-primary-foreground" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-sm font-medium truncate">
                      {image.user.name}
                    </p>
                    {image.description && (
                      <p className="text-white/80 text-xs mt-1 line-clamp-2">
                        🤖 {image.description}
                      </p>
                    )}
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
              Descreva as características físicas que você busca: cor de cabelo, olhos, tom de pele, etc.
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
            onClick={() => onNext(selected)}
            disabled={!canProceed}
            size="lg"
            className="rounded-xl px-8 hover:scale-105 transition-transform disabled:opacity-50"
          >
            Confirmar Seleção
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
