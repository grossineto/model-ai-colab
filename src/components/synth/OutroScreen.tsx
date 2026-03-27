import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import megamodelLogo from "@/assets/megamodel-logo.png";

interface OutroScreenProps {
  onRestart: () => void;
}

export const OutroScreen = ({ onRestart }: OutroScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center bg-background p-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-center space-y-12 max-w-3xl"
      >
        <div className="space-y-6">
          <motion.img
            src={megamodelLogo}
            alt="Mega Model Brasil"
            className="h-24 md:h-32 w-auto mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          />

          <h2 className="text-4xl md:text-5xl font-light tracking-wide">
            <span className="text-foreground">meg</span>
            <span className="font-semibold text-foreground">AI</span>
            <span className="text-foreground">model</span>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-muted-foreground font-light"
          >
            Redefinindo o futuro da modelagem, de forma transparente.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-6"
        >
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              {
                title: "Criação Potencializada por IA",
                description: "Gere modelos únicos a partir de dados existentes com atribuição precisa",
              },
              {
                title: "Atribuição Transparente",
                description: "Distribuição automática de ganhos para todos os contribuidores",
              },
              {
                title: "Ético e Justo",
                description: "Construído sobre princípios de justiça e respeito aos criadores originais",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.2 }}
                className="bg-card rounded-sm p-6 border border-border hover:shadow-soft transition-shadow"
              >
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8 }}
          >
            <Button
              onClick={onRestart}
              size="lg"
              className="text-base px-12 py-6 rounded-sm shadow-soft hover:shadow-elegant transition-all duration-300"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reiniciar Simulação
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
