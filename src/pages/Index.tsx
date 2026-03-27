import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, UserCircle, UserPlus, Users, Image } from "lucide-react";
import { IntroScreen } from "@/components/synth/IntroScreen";
import { ModelTypeSelectionStep } from "@/components/synth/ModelTypeSelectionStep";
import { ModelDescriptionStep } from "@/components/synth/ModelDescriptionStep";
import { LoadingScreen } from "@/components/synth/LoadingScreen";
import { ReferenceSelectionStep } from "@/components/synth/ReferenceSelectionStep";
import { RealCompositionStep } from "@/components/synth/RealCompositionStep";
import { RealCompositionResultStep } from "@/components/synth/RealCompositionResultStep";
import { CustomizeModelStep } from "@/components/synth/CustomizeModelStep";
import { FinalResultStep } from "@/components/synth/FinalResultStep";
import { DashboardStep } from "@/components/synth/DashboardStep";
import { OutroScreen } from "@/components/synth/OutroScreen";
import VideoGenerationStep from "@/components/synth/VideoGenerationStep";

type Step = "intro" | "typeSelection" | "description" | "loading1" | "references" | "realComposition" | "realCompositionResult" | "loading2" | "customize" | "loading3" | "result" | "video" | "dashboard" | "outro";
type ModelType = 'synthetic' | 'real' | null;

interface SelectedImage {
  id: string;
  url: string;
  photographer: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>("intro");
  const [modelType, setModelType] = useState<ModelType>(null);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [bodyImage, setBodyImage] = useState<SelectedImage | null>(null);
  const [faceImage, setFaceImage] = useState<SelectedImage | null>(null);
  const [description, setDescription] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedBaseImage, setGeneratedBaseImage] = useState("");
  const [finalGeneratedImage, setFinalGeneratedImage] = useState("");
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  // Temporariamente pulando a seleção de tipo - indo direto para sintético
  const handleStart = () => {
    setModelType('synthetic');
    setCurrentStep("description");
  };

  const handleTypeSelection = (type: 'synthetic' | 'real') => {
    setModelType(type);
    setCurrentStep("description");
  };

  const handleDescriptionNext = (desc: string) => {
    setDescription(desc);
    setCurrentStep("loading1");
    setTimeout(() => setCurrentStep("references"), 2500);
  };

  const handleReferenceNext = (images: SelectedImage[]) => {
    setSelectedImages(images);
    if (modelType === 'real') {
      setCurrentStep("realComposition");
    } else {
      setCurrentStep("loading2");
      setTimeout(() => setCurrentStep("customize"), 2500);
    }
  };

  const handleRealCompositionNext = (body: SelectedImage, face: SelectedImage) => {
    setBodyImage(body);
    setFaceImage(face);
    setCurrentStep("realCompositionResult");
  };

  const handleRealCompositionResultNext = () => {
    navigate('/gallery');
  };

  const handleCustomizeNext = (prompt: string, baseImage: string) => {
    setCustomPrompt(prompt);
    setGeneratedBaseImage(baseImage);
    setCurrentStep("loading3");
    setTimeout(() => setCurrentStep("result"), 2500);
  };

  const handleResultNext = (generatedImageUrl?: string) => {
    if (generatedImageUrl) {
      setFinalGeneratedImage(generatedImageUrl);
    }
    setCurrentStep("video");
  };

  const handleVideoBack = () => setCurrentStep("result");

  const handleDashboardNext = () => setCurrentStep("outro");

  const handleRestart = () => {
    setCurrentStep("intro");
    setModelType(null);
    setSelectedImages([]);
    setBodyImage(null);
    setFaceImage(null);
    setDescription("");
    setCustomPrompt("");
    setGeneratedBaseImage("");
    setFinalGeneratedImage("");
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Auth Navigation */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <UserCircle className="h-4 w-4 mr-2" />
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/gallery')}>
                <Image className="h-4 w-4 mr-2" />
                Galeria de Modelos
              </DropdownMenuItem>
              {isAdmin ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/register-model')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Cadastrar Modelo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin-models')}>
                    <Users className="h-4 w-4 mr-2" />
                    Administrar Modelos
                  </DropdownMenuItem>
                </>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/auth')}
          >
            <UserCircle className="h-4 w-4 mr-2" />
            Entrar
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {currentStep === "intro" && <IntroScreen key="intro" onStart={handleStart} />}
        {currentStep === "typeSelection" && <ModelTypeSelectionStep key="typeSelection" onNext={handleTypeSelection} />}
        {currentStep === "description" && <ModelDescriptionStep key="description" onNext={handleDescriptionNext} />}
        {currentStep === "loading1" && <LoadingScreen key="loading1" message="Buscando no banco de dados interno..." />}
        {currentStep === "references" && <ReferenceSelectionStep key="references" description={description} onNext={handleReferenceNext} />}
        {currentStep === "realComposition" && <RealCompositionStep key="realComposition" description={description} onNext={handleRealCompositionNext} />}
        {currentStep === "realCompositionResult" && bodyImage && faceImage && (
          <RealCompositionResultStep 
            key="realCompositionResult" 
            bodyImage={bodyImage} 
            faceImage={faceImage} 
            description={description}
            onNext={handleRealCompositionResultNext} 
          />
        )}
        {currentStep === "loading2" && <LoadingScreen key="loading2" message="Gerando modelo IA base..." />}
        {currentStep === "customize" && <CustomizeModelStep key="customize" selectedImages={selectedImages} description={description} onNext={handleCustomizeNext} />}
        {currentStep === "loading3" && <LoadingScreen key="loading3" message="Gerando imagem com IA..." />}
        {currentStep === "result" && <FinalResultStep key="result" selectedImages={selectedImages} description={description} customPrompt={customPrompt} generatedBaseImage={generatedBaseImage} onNext={handleResultNext} onGenerateNewPhoto={() => setCurrentStep("customize")} />}
        {currentStep === "video" && finalGeneratedImage && (
          <VideoGenerationStep 
            key="video" 
            generatedImageUrl={finalGeneratedImage} 
            onBack={handleVideoBack} 
          />
        )}
        {currentStep === "dashboard" && <DashboardStep key="dashboard" onNext={handleDashboardNext} />}
        {currentStep === "outro" && <OutroScreen key="outro" onRestart={handleRestart} />}
      </AnimatePresence>
    </div>
  );
};

export default Index;
