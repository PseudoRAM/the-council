export type AdvisorType = 'historical' | 'archetypal' | 'fictional' | 'other';

export type Advisor = {
  name: string;
  type: AdvisorType;
  why: string;
}

export type AdvisorResponse = {
  initialJustification: string;
  advisors: Advisor[];
  followUp: string;
} 