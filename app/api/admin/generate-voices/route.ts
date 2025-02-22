import { createClient } from '@/utils/supabase/server';
import { generateAndSaveVoiceForMember } from '@/utils/voice/council-voice-service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get all council members without voice IDs
    const { data: members, error: fetchError } = await supabase
      .from('council_members')
      .select('*')
      .is('voice_id', null);

    if (fetchError) {
      throw new Error(`Failed to fetch members: ${fetchError.message}`);
    }

    console.log('Generating voices for members:', {
      count: members?.length || 0,
    });

    const results = await Promise.all(
      (members || []).map(async (member) => {
        try {
          const voiceId = await generateAndSaveVoiceForMember(member);
          return {
            memberId: member.id,
            success: true,
            voiceId,
          };
        } catch (error) {
          return {
            memberId: member.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return NextResponse.json({
      total: members?.length || 0,
      results,
    });
  } catch (error) {
    console.error('Error in generate voices endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate voices' },
      { status: 500 }
    );
  }
} 