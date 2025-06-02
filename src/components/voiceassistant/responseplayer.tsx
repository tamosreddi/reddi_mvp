// Lo que hace es reproducir el audio y mostrar el texto

import React from 'react';

interface ResponsePlayerProps {
  text: string;
  audioUrl: string;
}

export const ResponsePlayer: React.FC<ResponsePlayerProps> = ({ text, audioUrl }) => (
  <div className="w-full flex flex-col items-center">
    <p className="mb-2">{text}</p>
    <audio controls src={audioUrl} />
  </div>
);

