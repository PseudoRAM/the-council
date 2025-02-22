import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'

interface DatabaseCouncilMember {
  id: string
  user_id?: string
  name: string
  image_description?: string
  voice_description?: string
  generation_prompt?: string
  properties?: any
  created_at?: string
  is_active?: boolean
  reason?: string
  description?: string
  character_type?: string
  voice_id?: string
}

interface GeneratedDescriptions {
  imageDescription: string
  voiceDescription: string
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST() {
  try {
    const supabase = await createClient()

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch active council members for the current user
    const { data: councilMembers, error: fetchError } = await supabase
      .from('council_members')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('is_active', true)

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch council members' }, { status: 500 })
    }

    console.log('Council members fetched:', councilMembers)

    // Process each council member
    for (const member of councilMembers as DatabaseCouncilMember[]) {
      if (!member.image_description || !member.voice_description) {
        // Generate descriptions using Claude
        const prompt = `Given this council member:
Name: ${member.name}
Description: ${member.description}
Character Type: ${member.character_type}
Properties: ${JSON.stringify(member.properties)}

Please provide two descriptions:
1. A detailed physical appearance description for generating an image (focus on visual aspects)
2. A voice description including accent, tone, pitch, and speaking style

You MUST only output a JSON object matching this exact schema:
{
  "imageDescription": "A detailed physical description...",
  "voiceDescription": "A detailed voice description..."
}

Example response:
{
  "imageDescription": "A tall woman in her mid-40s with shoulder-length silver hair, sharp green eyes, and an athletic build. She wears professional business attire with modern touches. Her posture conveys confidence and authority.",
  "voiceDescription": "Clear, authoritative alto voice with a slight British accent. Speaks at a measured pace with precise articulation. Professional tone with warm undertones, conveying both competence and approachability."
}

You MUST only output the JSON object, with no additional text or explanation.`

        const response = await anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: prompt,
          }],
          temperature: 0.7,
        })

        let descriptions: GeneratedDescriptions
        try {
          // Check if the content is a TextBlock and access its text property
          const content = response.content[0]
          if ('text' in content) {
            descriptions = JSON.parse(content.text) as GeneratedDescriptions
          } else {
            throw new Error('Unexpected response format from Claude')
          }
        } catch (error) {
          console.error('Failed to parse Claude response:', error)
          continue
        }

        console.log('Claude response:', response.content[0])
        console.log('Parsed descriptions:', descriptions)

        // Update the database with new descriptions
        const { error: updateError } = await supabase
          .from('council_members')
          .update({
            image_description: descriptions.imageDescription,
            voice_description: descriptions.voiceDescription,
            updated_at: new Date().toISOString(),
          })
          .eq('id', member.id)

        if (updateError) {
          console.error(`Failed to update member ${member.id}:`, updateError)
        }
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in populate-extra-data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
