// Graba el audio y lo envia al backend

import React, { useRef } from 'react';

interface VoiceButtonProps {
  isRecording: boolean;
  onRecordingStart: () => void;
  onRecordingStop: (audioBlob: Blob) => void;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isRecording,
  onRecordingStart,
  onRecordingStop,
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleClick = async () => {
    if (!isRecording) {
      // Iniciar grabación
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Tipo de audioBlob:', audioBlob.type);
        console.log('Audio file size:', audioBlob.size);
        onRecordingStop(audioBlob);
      };

      mediaRecorder.start();
      onRecordingStart();
    } else {
      // Detener grabación
      mediaRecorderRef.current?.stop();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="p-4 bg-blue-500 text-white rounded-full"
    >
      {isRecording ? 'Detener' : 'Háblale al tío Reddi'}
    </button>
  );
};

