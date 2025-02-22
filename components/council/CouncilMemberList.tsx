'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CouncilMember } from '@/utils/council/council-service';

interface Props {
  councilMembers: CouncilMember[];
  onSelectMember: (member: CouncilMember) => void;
  selectedMemberId: string | null;
}

export default function CouncilMemberList({ 
  councilMembers, 
  onSelectMember, 
  selectedMemberId 
}: Props) {
  console.log('Rendering CouncilMemberList with:', {
    memberCount: councilMembers.length,
    members: councilMembers,
    selectedId: selectedMemberId
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {councilMembers.map((member) => (
        <Card
          key={member.id}
          className={cn(
            "p-4 cursor-pointer hover:shadow-lg transition-shadow",
            selectedMemberId === member.id ? "border-2 border-primary" : ""
          )}
          onClick={() => onSelectMember(member)}
        >
          <div className="flex flex-col gap-2">
            {/* Member Initial Circle */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg leading-tight">
                  {member.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {member.specialty || 'Council Member'}
                </p>
              </div>
            </div>

            {/* Background/Description */}
            {member.background && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {member.background}
              </p>
            )}

            {/* Properties/Tags */}
            {member.properties?.characteristics && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Array.isArray(member.properties.characteristics) ? 
                  member.properties.characteristics.slice(0, 3).map((char, i) => (
                    <span 
                      key={i}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                    >
                      {char}
                    </span>
                  )) : null
                }
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
} 