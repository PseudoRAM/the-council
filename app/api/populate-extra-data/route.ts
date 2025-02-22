import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'
import { generateAndSaveVoiceForMember } from '@/utils/voice/council-voice-service'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

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
  image_url?: string
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

    const results = []

    // Process each council member
    for (const member of councilMembers as DatabaseCouncilMember[]) {
      try {
        let updatedMember = { ...member }
        
        // Generate descriptions if needed
        if (!member.image_description || !member.voice_description) {
          const descriptions = await generateDescriptions(member)
          
          // Update member with new descriptions
          const { error: updateError } = await supabase
            .from('council_members')
            .update({
              image_description: descriptions.imageDescription,
              voice_description: descriptions.voiceDescription,
              updated_at: new Date().toISOString(),
            })
            .eq('id', member.id)
            .select()
            .single()

          if (updateError) {
            throw new Error(`Failed to update descriptions: ${updateError.message}`)
          }

          updatedMember = {
            ...updatedMember,
            image_description: descriptions.imageDescription,
            voice_description: descriptions.voiceDescription,
          }
        }

        // Generate image
        try {
          const imageResponse = await fetch(
            `${BASE_URL}/api/generate-advisor-image?name=${encodeURIComponent(member.name)}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )
          
          if (!imageResponse.ok) {
            const errorData = await imageResponse.json().catch(() => ({}));
            throw new Error(
              `Failed to generate image: ${errorData.error || imageResponse.statusText}`
            );
          }
          
          // Get the image URL from the response
          const imageData = await imageResponse.json()
          if (!imageData.imageUrl) {
            throw new Error('No image URL in response')
          }

          // Update the database with the image URL
          const { error: imageUpdateError } = await supabase
            .from('council_members')
            .update({ 
              image_url: imageData.imageUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', member.id)

          if (imageUpdateError) {
            throw new Error(`Failed to update image URL: ${imageUpdateError.message}`)
          }

          console.log(`Updated image URL for member ${member.name}:`, imageData.imageUrl)
          
          updatedMember = {
            ...updatedMember,
            image_url: imageData.imageUrl
          }
        } catch (imageError) {
          console.error(`Failed to generate/store image for member ${member.name}:`, imageError)
        }

        // Generate voice if needed
        if (!member.voice_id && updatedMember.voice_description) {
          const voiceId = await generateAndSaveVoiceForMember(updatedMember)
          
          results.push({
            memberId: member.id,
            success: true,
            descriptions: !member.image_description || !member.voice_description,
            voice: true,
            voiceId,
            imageGenerated: true
          })
        } else {
          results.push({
            memberId: member.id,
            success: true,
            descriptions: !member.image_description || !member.voice_description,
            voice: false,
            voiceId: member.voice_id,
            imageGenerated: true
          })
        }

      } catch (error) {
        console.error(`Error processing member ${member.id}:`, error)
        results.push({
          memberId: member.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          imageGenerated: false
        })
      }
    }

    return NextResponse.json({ success: true, results })

  } catch (error) {
    console.error('Error in populate-extra-data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateDescriptions(member: DatabaseCouncilMember): Promise<GeneratedDescriptions> {
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

  try {
    const content = response.content[0]
    if ('text' in content) {
      return JSON.parse(content.text) as GeneratedDescriptions
    } else {
      throw new Error('Unexpected response format from Claude')
    }
  } catch (error) {
    throw new Error(`Failed to parse Claude response: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
