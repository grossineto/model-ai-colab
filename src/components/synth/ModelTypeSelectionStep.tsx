import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Users } from "lucide-react";

interface ModelTypeSelectionStepProps {
  onNext: (type: 'synthetic' | 'real') => void;
}

export const ModelTypeSelectionStep = ({ onNext }: ModelTypeSelectionStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background flex items-center justify-center p-8"
    >
      <div className="max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold text-foreground mb-4">
            Escolha o Tipo de Modelo
          </h2>
          <p className="text-xl text-muted-foreground">
            Você prefere criar uma modelo sintética com IA ou compor partes reais de diferentes modelos?
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative group"
          >
            <div className="bg-card rounded-3xl p-8 shadow-elegant border-2 border-border hover:border-primary transition-all duration-300 h-full flex flex-col">
              <div className="flex-1">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  Modelo IA Sintética
                </h3>
                <p className="text-muted-foreground mb-6">
                  Crie uma modelo completamente nova usando inteligência artificial. 
                  A IA combina características de múltiplas referências para gerar uma pessoa única e realista.
                </p>
                <ul className="space-y-3 text-muted-foreground mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Resultado 100% gerado por IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Combina múltiplas características</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Personalização total via prompt</span>
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => onNext('synthetic')}
                size="lg"
                className="w-full rounded-xl hover:scale-105 transition-transform"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Criar com IA
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative group"
          >
            <div className="bg-card rounded-3xl p-8 shadow-elegant border-2 border-border hover:border-accent transition-all duration-300 h-full flex flex-col">
              <div className="flex-1">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  Modelo Real Composta
                </h3>
                <p className="text-muted-foreground mb-6">
                  Combine partes reais de diferentes modelos. Por exemplo, o corpo de uma modelo 
                  com o rosto de outra, mantendo características originais de cada uma.
                </p>
                <ul className="space-y-3 text-muted-foreground mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">•</span>
                    <span>Usa imagens reais de modelos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">•</span>
                    <span>Escolha corpo e rosto separadamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">•</span>
                    <span>Ajustes automáticos de junção</span>
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => onNext('real')}
                size="lg"
                variant="outline"
                className="w-full rounded-xl hover:scale-105 transition-transform border-2"
              >
                <Users className="mr-2 h-5 w-5" />
                Compor de Reais
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
