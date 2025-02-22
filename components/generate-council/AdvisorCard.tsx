import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Advisor } from '@/app/types/advisor';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AdvisorCardProps {
  advisor: Advisor;
  isSelected: boolean;
  onSelect: () => void;
}

export const AdvisorCard = ({ advisor, isSelected, onSelect }: AdvisorCardProps) => {
  return (
    <Card
      className={cn(
        "h-full hover:shadow-lg transition-shadow cursor-pointer",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 rounded-full overflow-hidden">
            <Image
              src='/samples/head1.jpg'
              alt={`Portrait of ${advisor.name}`}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{advisor.name}</CardTitle>
              <Badge
                className={`
                  ${advisor.type === 'historical' && 'bg-blue-100 text-blue-800'}
                  ${advisor.type === 'fictional' && 'bg-purple-100 text-purple-800'}
                  ${advisor.type === 'archetypal' && 'bg-green-100 text-green-800'}
                  ${advisor.type === 'other' && 'bg-gray-100 text-gray-800'}
                  capitalize
                `}
              >
                {advisor.type}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{advisor.why}</p>
      </CardContent>
    </Card>
  );
};