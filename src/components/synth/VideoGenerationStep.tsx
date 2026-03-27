import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Video, Download, ArrowLeft, Play, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VideoGenerationStepProps {
  generatedImageUrl: string;
  onBack: () => void;
}

const VideoGenerationStep: React.FC<VideoGenerationStepProps> = ({
  generatedImageUrl,
  onBack
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const formatVideoErrorMessage = (err: any) => {
    const code = err?.code;

    if (code === 'insufficient_credit') {
      return 'Runway ML sem créditos. Adicione créditos em dev.runwayml.com e tente novamente.';
    }

    if (code === 'rate_limited') {
      const seconds = typeof err?.retryAfter === 'number' ? err.retryAfter : 5;
      return `Limite temporário de requisições atingido. Aguarde ~${seconds}s e tente novamente.`;
    }

    if (code === 'unauthorized') {
      return 'API key do Runway inválida. Verifique sua chave em dev.runwayml.com.';
    }

    return err?.detail || err?.message || 'Falha ao gerar vídeo. Tente novamente.';
  };

  // Poll for video status
  useEffect(() => {
    if (!taskId || videoUrl) return;

    const pollInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-video', {
          body: { taskId }
        });

        if (error) {
          console.error('Error checking status:', error);
          toast.error('Erro ao consultar status do vídeo.');
          setIsGenerating(false);
          clearInterval(pollInterval);
          return;
        }

        if (data?.error) {
          toast.error(formatVideoErrorMessage(data.error));
          setIsGenerating(false);
          setTaskId(null);
          clearInterval(pollInterval);
          return;
        }

        console.log('Poll response:', data);
        setStatus(data.status);

        if (data.status === 'processing' || data.status === 'starting') {
          setProgress(prev => Math.min(prev + 3, 90));
        }

        if (data.status === 'succeeded' && data.output) {
          const outputUrl = Array.isArray(data.output) ? data.output[0] : data.output;
          setVideoUrl(outputUrl);
          setIsGenerating(false);
          setProgress(100);
          toast.success('Vídeo gerado com sucesso!');
          clearInterval(pollInterval);
        }

        if (data.status === 'failed' || data.status === 'canceled') {
          setIsGenerating(false);
          toast.error(data.error || 'Falha ao gerar vídeo. Tente novamente.');
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [taskId, videoUrl]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor, descreva o movimento/cena desejada');
      return;
    }

    setIsGenerating(true);
    setProgress(10);
    setVideoUrl(null);
    setTaskId(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-video', {
        body: {
          imageUrl: generatedImageUrl,
          prompt: prompt
        }
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(formatVideoErrorMessage(data.error));
        setIsGenerating(false);
        setProgress(0);
        return;
      }

      console.log('Generation started:', data);
      setTaskId(data.taskId || data.predictionId);
      setStatus(data.status);
      toast.info('Geração iniciada com Runway ML! Isso pode levar 1-3 minutos...');
    } catch (error: any) {
      console.error('Error generating video:', error);
      toast.error('Erro ao iniciar geração: ' + (error?.message || 'desconhecido'));
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `modelo-video-${Date.now()}.mp4`;
      a.click();
    }
  };

  const handleReset = () => {
    setVideoUrl(null);
    setTaskId(null);
    setProgress(0);
    setStatus('');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerar Vídeo</h1>
            <p className="text-muted-foreground">Transforme sua modelo em um vídeo curto</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Source Image */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Imagem de Origem</h3>
            <div className="aspect-square rounded-xl overflow-hidden border border-border bg-muted">
              <img 
                src={generatedImageUrl} 
                alt="Modelo gerada"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Video Output or Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {videoUrl ? 'Vídeo Gerado' : 'Configuração do Vídeo'}
            </h3>

            {videoUrl ? (
              <div className="space-y-4">
                <div className="aspect-square rounded-xl overflow-hidden border border-border bg-black">
                  <video 
                    src={videoUrl} 
                    controls 
                    autoPlay 
                    loop
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleDownload} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Vídeo
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Novo Vídeo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="aspect-square rounded-xl border border-dashed border-border bg-muted/50 flex items-center justify-center">
                  {isGenerating ? (
                    <div className="text-center space-y-4 p-6">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                      <div className="space-y-2">
                        <p className="font-medium">Gerando vídeo...</p>
                        <p className="text-sm text-muted-foreground">
                          Status: {status || 'iniciando'}
                        </p>
                        <div className="w-48 mx-auto bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Isso pode levar 1-3 minutos
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2 text-muted-foreground">
                      <Video className="h-12 w-12 mx-auto opacity-50" />
                      <p>O vídeo aparecerá aqui</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Descreva o movimento/cena
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: modelo caminhando elegantemente na praia ao pôr do sol, vestido flutuando com a brisa, movimentos suaves e cinematográficos"
                    className="min-h-[120px]"
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Dica: Descreva movimentos, ambiente e atmosfera para melhores resultados
                  </p>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Gerar Vídeo (~2-4 segundos)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
          <h4 className="font-medium mb-2">💡 Dicas para melhores resultados:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Descreva movimentos suaves e naturais</li>
            <li>• Mencione detalhes do ambiente (iluminação, clima)</li>
            <li>• Evite movimentos muito complexos ou rápidos</li>
            <li>• O vídeo terá ~2-4 segundos de duração</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerationStep;
