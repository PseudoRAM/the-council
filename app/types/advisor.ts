export type AdvisorType = 'historical' | 'archetypal' | 'fictional' | 'current';

export interface Advisor {
  id: string;
  name: string;
  type: AdvisorType;
  why: string;
  description: string;
  traditions: string;
  speakingStyle: string;
  bestSuitedFor: string;
  imageUrl?: string;
}

export interface CouncilMember {
  character_type: AdvisorType;
  created_at: string;
  description: string;
  generation_prompt: string | null;
  id: string;
  image_description: string | null;
  image_url?: string;
  is_active: boolean;
  name: string;
  properties: {
    traditions: string;
    speakingStyle: string;
    bestSuitedFor: string;
  };
  reason: string;
  updated_at: string | null;
  user_id: string;
  voice_description: string | null;
  voice_id: string | null;
}

export type AdvisorResponse = {
  initialJustification: string;
  advisors: Advisor[];
  followUp: string;
  councilMembers: CouncilMember[];
} 