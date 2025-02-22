'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CouncilMemberList from './CouncilMemberList';
import ChatInterface from './ChatInterface';
import GroupChat from './GroupChat';
import { ErrorBoundary } from './ErrorBoundary';
import type { CouncilMember } from '@/utils/council/council-service';

interface Props {
  initialCouncilMembers: CouncilMember[];
}

export default function CouncilChamber({ initialCouncilMembers }: Props) {
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    console.log('CouncilChamber mounted with members:', {
      count: initialCouncilMembers.length,
      members: initialCouncilMembers,
      firstMember: initialCouncilMembers[0]
    });
  }, [initialCouncilMembers]);

  if (initialCouncilMembers.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4">No Council Members Found</h2>
        <p className="text-muted-foreground">
          You haven't created any council members yet.
        </p>
        {/* Add a link or button to create council members */}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Tabs defaultValue="group" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="group">Group Discussion</TabsTrigger>
          <TabsTrigger value="individual">Individual Consultation</TabsTrigger>
        </TabsList>

        <TabsContent value="group">
          <ErrorBoundary>
            <GroupChat initialCouncilMembers={initialCouncilMembers} />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="individual">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Council Members</h2>
              <ErrorBoundary>
                <CouncilMemberList
                  councilMembers={initialCouncilMembers}
                  onSelectMember={(member) => {
                    console.log('Member selected:', member);
                    setSelectedMember(member);
                  }}
                  selectedMemberId={selectedMember?.id ?? null}
                />
              </ErrorBoundary>
            </div>

            <div>
              {selectedMember ? (
                <ChatInterface
                  councilMember={initialCouncilMembers.find(m => m.id === selectedMember.id)!}
                />
              ) : (
                <div className="flex items-center justify-center h-[600px] border rounded-lg">
                  <p className="text-muted-foreground">
                    Select a council member to begin chatting
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </ErrorBoundary>
  );
} 