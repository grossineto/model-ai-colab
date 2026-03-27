import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import megamodelLogo from "@/assets/megamodel-logo.png";

interface IntroScreenProps {
  onStart: () => void;
}

export const IntroScreen = ({ onStart }: IntroScreenProps) => {
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
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        className="text-center space-y-8"
      >
        <div className="relative flex flex-col items-center space-y-6">
          <motion.img
            src={megamodelLogo}
            alt="Mega Model Brasil"
            className="h-20 md:h-28 w-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          />
          <h1 className="relative text-5xl md:text-6xl font-light tracking-wide">
            <span className="text-foreground">meg</span>
            <span className="font-semibold text-foreground">AI</span>
            <span className="text-foreground">model</span>
          </h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light"
        >
          Beleza gerada por IA, compartilhada de forma transparente.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="pt-8"
        >
          <Button
            onClick={onStart}
            size="lg"
            className="text-base px-12 py-6 rounded-sm shadow-soft hover:shadow-elegant transition-all duration-300"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Iniciar Simulação
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="pt-12 flex gap-3 justify-center items-center"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-16 h-16 bg-foreground/5 rounded-full"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
