import { createClient } from '@/utils/supabase/server';

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

interface DatabaseCouncilMember {
  id: string;
  user_id?: string;
  name: string;
  image_description?: string;
  voice_description?: string;
  generation_prompt?: string;
  properties?: any;
  created_at?: string;
  is_active?: boolean;
  reason?: string;
  description?: string;
  character_type?: string;
  voice_id?: string;
}

interface VoiceResponse {
  voice_id: string;
  name: string;
}

export async function generateAndSaveVoiceForMember(member: DatabaseCouncilMember) {
    try {
      if (!member.voice_description) {
        throw new Error(`Member ${member.id} has no voice description`);
      }
      if (!ELEVENLABS_API_KEY) {
        throw new Error('ELEVENLABS_API_KEY is not configured');
      }
      
      // Use the generated voice description rather than member.description.
      let voiceDesc = member.voice_description;
  
      // Ensure the description is at most 500 characters.
      if (voiceDesc.length > 500) {
        voiceDesc = voiceDesc.slice(0, 500);
      }
  
      // Build the preview text. Prefer the generated voice description.
      // If the resulting text is too short, append additional context.
      let previewText = `Hello, I am ${member.name}. ${voiceDesc}`;
      if (previewText.length < 100) {
        previewText = previewText + " This is a detailed description of my vocal qualities suitable for text-to-speech generation.";
      }
  
      console.log('Creating voice for member:', {
        memberId: member.id,
        name: member.name,
        description: voiceDesc
      });
  
      // Generate a preview.
      const previewResponse = await fetch(`${ELEVENLABS_API_URL}/text-to-voice/create-previews`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: previewText,
          voice_description: voiceDesc,
        }),
      });
  
      if (!previewResponse.ok) {
        const errorBody = await previewResponse.text().catch(() => 'No error body');
        throw new Error(
          `Failed to generate preview: ${previewResponse.status} ${previewResponse.statusText}\n${errorBody}`
        );
      }
  
      const previewData = await previewResponse.json();
      const generatedVoiceId = previewData.previews?.[0]?.generated_voice_id;
  
      if (!generatedVoiceId) {
        throw new Error('No generated voice ID in preview response');
      }
  
      // Create the voice from preview
      const response = await fetch(`${ELEVENLABS_API_URL}/text-to-voice/create-voice-from-preview`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voice_name: member.name,
          voice_description: voiceDesc,
          generated_voice_id: generatedVoiceId,
        }),
      });
  
      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'No error body');
        throw new Error(
          `Failed to create voice: ${response.status} ${response.statusText}\n${errorBody}`
        );
      }
  
      const voiceData: { voice_id: string } = await response.json();
      console.log('Created voice:', {
        memberId: member.id,
        voiceId: voiceData.voice_id,
      });
  
      // Update the council member with the voice ID
      const supabase = await createClient();
      const { error: updateError } = await supabase
        .from('council_members')
        .update({ 
          voice_id: voiceData.voice_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', member.id);
  
      if (updateError) {
        console.error('Failed to update council member:', updateError);
        throw new Error(`Failed to update council member: ${updateError.message}`);
      }
  
      return voiceData.voice_id;
    } catch (error) {
      console.error('Error creating voice for member:', {
        memberId: member.id,
        name: member.name,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      });
      throw error;
    }
  }
  