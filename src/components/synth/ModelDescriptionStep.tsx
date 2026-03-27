import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Wand2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ModelDescriptionStepProps {
  onNext: (description: string) => void;
}

export const ModelDescriptionStep = ({ onNext }: ModelDescriptionStepProps) => {
  const [description, setDescription] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen flex items-center justify-center bg-background p-8"
    >
      <div className="max-w-3xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-foreground">
              Descreva Sua Model
            </h2>
            <p className="text-lg text-muted-foreground">
              Diga-nos o que você procura e nossa IA encontrará as melhores referências.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-8 shadow-soft border border-border"
          >
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Descrição da Model
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a model que você quer criar..."
              className="min-h-[150px] text-lg rounded-xl border-2 focus:border-primary transition-colors"
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8 flex justify-end"
            >
              <Button
                onClick={() => onNext(description)}
                disabled={!description}
                size="lg"
                className="rounded-xl px-6 hover:scale-105 transition-transform"
              >
                <Wand2 className="mr-2 h-5 w-5" />
                Gerar Referências
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};
