export interface CouncilMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  description: string;
  specialty: string[];
}

export const councilMembers: CouncilMember[] = [
  {
    id: '1',
    name: 'The Sage',
    role: 'Wisdom Keeper',
    avatar: '/avatars/sage.png',
    description: 'Ancient wisdom and philosophical guidance',
    specialty: ['philosophy', 'ethics', 'wisdom']
  },
  {
    id: '2',
    name: 'The Innovator',
    role: 'Future Thinker',
    avatar: '/avatars/innovator.png',
    description: 'Technology and forward-thinking perspectives',
    specialty: ['technology', 'innovation', 'future']
  },
  {
    id: '3',
    name: 'The Strategist',
    role: 'Strategic Advisor',
    avatar: '/avatars/strategist.png',
    description: 'Tactical and strategic decision making',
    specialty: ['strategy', 'planning', 'analysis']
  },
  // Add more council members as needed
]; 