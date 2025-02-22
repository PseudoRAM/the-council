import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // First create a test council member
    const { data: member, error: insertError } = await supabase
      .from('council_members')
      .insert({
        name: 'Test Advisor',
        description: 'A wise test advisor',
        character_type: 'Mentor',
        properties: { expertise: ['testing', 'quality assurance'] },
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Then call the populate-extra-data endpoint
    const response = await fetch('http://localhost:3000/api/populate-extra-data', {
      method: 'POST',
    })

    const result = await response.json()

    // Fetch the updated member
    const { data: updatedMember, error: fetchError } = await supabase
      .from('council_members')
      .select('*')
      .eq('id', member.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    return NextResponse.json({
      original: member,
      result: result,
      updated: updatedMember
    })

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 