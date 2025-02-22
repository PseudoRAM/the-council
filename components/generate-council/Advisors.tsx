import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Advisor {
  name: string;
  type: 'historical' | 'fictional' | 'archetypal' | 'other';
  why: string;
}

interface AdvisorGridProps {
  response: {
    content: Array<{
      type: string;
      text: string;
    }>;
  };
}

const AdvisorGrid = ({ response }: AdvisorGridProps) => {
  // Parse the JSON string from the response
  const parsedData = JSON.parse(response.content[0].text);
  const { initialJustification, advisors } = parsedData;

  // Helper function to get badge color based on advisor type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'historical':
        return 'bg-blue-100 text-blue-800';
      case 'fictional':
        return 'bg-purple-100 text-purple-800';
      case 'archetypal':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Initial Justification Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Analysis of Your Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{initialJustification}</p>
        </CardContent>
      </Card>

      {/* Advisors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {advisors.map((advisor: Advisor, index: number) => (
          <Card key={index} className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{advisor.name}</CardTitle>
                <Badge
                  variant="secondary"
                  className={`${getBadgeColor(advisor.type)} capitalize`}
                >
                  {advisor.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{advisor.why}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Follow-up Question */}
      {parsedData.followUp && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <p className="text-gray-600 italic">{parsedData.followUp}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvisorGrid;