// Es el backend que recibe el audio y lo transcribe (Whisper), puede analizarlo con ChatGPT y generar una respuesta más natural

import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    // 1. Recibe el archivo de audio
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    if (!audioFile) {
      console.error('No audio file provided');
      return new Response('No audio file provided', { status: 400 });
    }
    console.log('Audio file received:', audioFile);
    console.log('Audio file size:', audioFile.size);

    // Convierte el File a un Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Llama a Whisper para transcribir
    const transcription = await openai.audio.transcriptions.create({
      file: {
        name: 'audio.webm',
        type: 'audio/webm',
        data: buffer
      },
      model: "whisper-1"
    });

    const transcribedText = transcription.text;

    // 4. (Opcional) Aquí podrías analizar el texto con ChatGPT y generar una respuesta más natural
    // Por ahora, solo usamos el texto transcrito como respuesta
    const responseText = transcribedText;

    // 5. Genera la voz usando TTS de OpenAI
    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: responseText
    });

    // 6. Devuelve el audio y el texto
    return new Response(speech as any, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Response-Text': responseText
      }
    });
  } catch (error) {
    console.error('Error en transcribe/route.ts:', error);
    return new Response('Error en el procesamiento', { status: 500 });
  }
}
