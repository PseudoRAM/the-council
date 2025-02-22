import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

interface VoiceInfo {
  id: string
  name: string
  voice_id: string | null
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch active council members with voice IDs for the current user
    const { data: members, error: fetchError } = await supabase
      .from('council_members')
      .select('id, name, voice_id')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .not('voice_id', 'is', null)

    if (fetchError) {
      console.error('Error fetching council members:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch council members' },
        { status: 500 }
      )
    }

    const voiceInfo: VoiceInfo[] = members || []

    return NextResponse.json({
      voices: voiceInfo
    })

  } catch (error) {
    console.error('Error in get-active-voices:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
