// Es el backend que recibe el audio y lo transcribe (Whisper), puede analizarlo con ChatGPT y generar una respuesta más natural

import { OpenAI } from 'openai';
import { toFile } from 'openai/uploads';

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

    const fileForOpenAI = await toFile(buffer, 'audio.webm');

    // 2. Llama a Whisper para transcribir
    const transcription = await openai.audio.transcriptions.create({
      file: fileForOpenAI,
      model: "whisper-1"
    });

    const transcribedText = transcription.text;

    // 2. Analiza la intención con ChatGPT
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Eres un asistente para una tienda. Si el usuario pregunta por ingresos, responde solo con JSON: { "intent": "get_income", "date": "YYYY-MM-DD" }. Si pregunta por otra cosa, responde con la intención y parámetros en JSON. Si no entiendes, responde con { "intent": "unknown" }.`
        },
        {
          role: "user",
          content: transcribedText
        }
      ]
    });
    let intentData: any = { intent: "unknown" };
    try {
      const content = chatCompletion.choices[0].message.content;
      if (content) {
        intentData = JSON.parse(content);
      }
    } catch (e) {
      console.error('Error parsing intent JSON:', chatCompletion.choices[0].message.content);
    }

    console.log('ChatGPT response:', chatCompletion.choices[0].message.content);

    // 3. Si la intención es "get_income", consulta Supabase
    let responseText = "";
    if (intentData.intent === "get_income" && intentData.date) {
      // Aquí debes obtener el storeId real del usuario autenticado
      const storeId = "demo-store-id"; // <-- reemplaza esto por el storeId real
      const incomeRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/openai/get-income-by-date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-store-id': storeId },
        body: JSON.stringify({ date: intentData.date })
      });
      const incomeData = await incomeRes.json();
      responseText = `Tus ingresos de ${intentData.date} fueron $${incomeData.total}`;
    } else {
      responseText = "No entendí tu pregunta, ¿puedes repetirla?";
    }

    if (!responseText || responseText.includes('undefined') || responseText.includes('YYYY-MM-DD')) {
      responseText = "Lo siento, no pude entender tu pregunta o no encontré datos para esa fecha.";
    }

    console.log('Texto para TTS:', responseText);

    // 4. Genera la voz usando TTS de OpenAI
    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: responseText || ''
    });

    // 5. Devuelve el audio y el texto
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
