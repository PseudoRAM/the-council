const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

interface ElevenLabsPreview {
  audio_base_64: string;
  generated_voice_id: string;
  media_type: string;
  duration_secs: number;
}

interface ElevenLabsResponse {
  previews: ElevenLabsPreview[];
  error?: {
    message: string;
    status: number;
  };
}

export async function generateVoicePreview(text: string, voiceDescription: string): Promise<string> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-voice/create-previews`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        voice_description: voiceDescription,
        text: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate voice: ${response.status} ${response.statusText}`);
    }

    const data: ElevenLabsResponse = await response.json();
    
    if (!data.previews?.[0]?.audio_base_64) {
      throw new Error('No audio data in response');
    }

    const audioBlob = base64ToBlob(
      data.previews[0].audio_base_64,
      data.previews[0].media_type
    );
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Error in generateVoicePreview:', error);
    throw error;
  }
}

export async function generateVoiceWithId(text: string, voiceId: string): Promise<ArrayBuffer> {
  try {
    console.log('Generating speech with voice ID:', {
      voiceId,
      textLength: text.length,
      text: text.substring(0, 100) + '...'
    });

    const url = `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      let errorText = await response.text().catch(() => 'No error body');
      throw new Error(
        `Failed to generate speech: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    // Get the audio data as an ArrayBuffer
    const audioData = await response.arrayBuffer();
    console.log('Received audio data:', {
      byteLength: audioData.byteLength,
    });

    return audioData;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

function base64ToBlob(base64: string, mediaType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mediaType });
}

// Helper function to validate the response from ElevenLabs
function validateResponse(data: any): data is ElevenLabsResponse {
  if (!data || typeof data !== 'object') {
    console.error('Invalid response format:', data);
    return false;
  }

  if ((!data.previews || data.previews.length === 0) && !data.error) {
    console.error('Response missing both previews and error:', data);
    return false;
  }

  if (data.error && (!data.error.message || !data.error.status)) {
    console.error('Invalid error format in response:', data.error);
    return false;
  }

  return true;
} 