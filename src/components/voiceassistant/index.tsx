// Lo que hace es grabar el audio, lo envia al backend, y luego lo reproduce
// El backend transcribe el audio y lo envia de vuelta al frontend
// El frontend reproduce el audio y muestra el texto
// El texto se puede editar y enviar al backend
// El backend procesa el texto y lo envia de vuelta al frontend
// El frontend reproduce el audio y muestra el texto
// El texto se puede editar y enviar al backend
// El backend procesa el texto y lo envia de vuelta al frontend


import { useState } from 'react';
import { VoiceButton } from './voicebutton';
import { ResponsePlayer } from './responseplayer';

export function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [response, setResponse] = useState<{
    text: string;
    audioUrl: string;
  } | null>(null);

  const handleRecording = async (audioBlob: Blob) => {
    try {
      // 1. Enviamos el audio al backend
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/openai/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error en la transcripción');
      }

      // 2. Obtenemos la respuesta (texto y audio)
      const responseText = response.headers.get('X-Response-Text');
      const audioResponseBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioResponseBlob);

      // 3. Actualizamos el estado
      setResponse({
        text: responseText || '',
        audioUrl
      });
    } catch (error) {
      console.error('Error:', error);
      // Manejar el error apropiadamente
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <VoiceButton 
        isRecording={isRecording}
        onRecordingStart={() => setIsRecording(true)}
        onRecordingStop={handleRecording}
      />
      
      {response && (
        <ResponsePlayer
          text={response.text}
          audioUrl={response.audioUrl}
        />
      )}
    </div>
  );
}