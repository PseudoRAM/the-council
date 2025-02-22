import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getCouncilResponse } from '@/utils/ai/council-chat';
import type { CouncilMember } from '@/utils/council/council-service';

export async function POST(request: Request) {
  try {
    const { question, memberIds } = await request.json();

    if (!question || !memberIds?.length) {
      return NextResponse.json(
        { error: 'Question and member IDs are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get all council members
    const { data: councilMembers, error: membersError } = await supabase
      .from('council_members')
      .select('*')
      .in('id', memberIds);

    if (membersError || !councilMembers) {
      console.error('Error fetching council members:', membersError);
      return NextResponse.json(
        { error: 'Failed to fetch council members' },
        { status: 500 }
      );
    }

    // Get responses from each member
    const responses = await Promise.all(
      councilMembers.map(async (member: CouncilMember) => {
        const response = await getCouncilResponse(question, member);
        return {
          memberId: member.id,
          memberName: member.name,
          response: response.content,
          error: response.error,
        };
      })
    );

    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Error in group chat:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 