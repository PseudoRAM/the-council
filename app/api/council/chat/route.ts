import { NextResponse } from 'next/server';
import { getCouncilResponse } from '@/utils/ai/council-chat';
import { councilMembers } from '@/components/council/council-data';

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Get responses from all council members in parallel
    const responses = await Promise.all(
      councilMembers.map(async (member) => {
        const response = await getCouncilResponse(question, member.id);
        return {
          memberId: member.id,
          memberName: member.name,
          content: response.content,
          error: response.error
        };
      })
    );

    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Error in council chat:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 