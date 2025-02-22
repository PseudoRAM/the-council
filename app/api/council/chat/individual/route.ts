import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getIndividualResponse } from '@/utils/ai/council-chat';
import { generateVoiceWithId } from '@/utils/voice/elevenlabs';

export async function POST(request: Request) {
  try {
    const { question, memberId } = await request.json();
    console.log('Processing chat request:', { question, memberId });

    if (!question || !memberId) {
      return NextResponse.json(
        { error: 'Question and member ID are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get the council member details
    const { data: member, error: memberError } = await supabase
      .from('council_members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      console.error('Error fetching council member:', memberError);
      return NextResponse.json(
        { error: 'Council member not found' },
        { status: 404 }
      );
    }

    const response = await getIndividualResponse(question, member);
    console.log('AI Response:', {
      contentLength: response.content?.length,
      content: response.content?.substring(0, 100) + '...',
    });

    // Generate audio if voice_id exists
    let audioData = null;
    if (member.voice_id && response.content) {
      try {
        const audioBuffer = await generateVoiceWithId(response.content, member.voice_id);
        
        // Convert ArrayBuffer to Base64
        const audioArray = new Uint8Array(audioBuffer);
        const audioBase64 = Buffer.from(audioArray).toString('base64');
        
        audioData = {
          data: audioBase64,
          type: 'audio/mpeg', // MP3 format
        };

        console.log('Generated audio data:', {
          byteLength: audioBuffer.byteLength,
          base64Length: audioBase64.length,
        });
      } catch (error) {
        console.error('Voice generation failed:', error);
      }
    } else {
      console.log('Skipping voice generation:', {
        hasVoiceId: !!member.voice_id,
        hasContent: !!response.content,
      });
    }

    return NextResponse.json({ 
      response: response.content,
      audio: audioData,
    });
  } catch (error) {
    console.error('Error in individual chat:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 