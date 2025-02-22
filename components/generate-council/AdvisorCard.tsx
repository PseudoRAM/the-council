import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdvisorCardProps {
  advisor: {
    id?: string;
    type?: string;
    name: string;
    description?: string;
    why?: string;
    traditions?: string;
    speakingStyle?: string;
    bestSuitedFor?: string;
    imageUrl?: string;
  };
  isSelected?: boolean;
  onSelect?: () => void;
}

export const AdvisorCard = ({
  advisor,
  isSelected,
  onSelect,
}: AdvisorCardProps) => {
  return (
    <Card
      className={cn(
        "h-full",
        onSelect && "hover:shadow-lg transition-shadow cursor-pointer",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-12 rounded-xl overflow-hidden">
            {advisor.imageUrl && (
              <img
                src={advisor.imageUrl}
                alt={advisor.name}
                className="h-14 w-12 object-cover object-top rounded-xl"
              />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{advisor.name}</CardTitle>
              {advisor.type && (
                <Badge
                  className={`
                  ${advisor.type === "historical" && "bg-blue-100 text-blue-800"}
                  ${advisor.type === "fictional" && "bg-purple-100 text-purple-800"}
                  ${advisor.type === "archetypal" && "bg-green-100 text-green-800"}
                  ${advisor.type === "current" && "bg-yellow-100 text-yellow-800"}
                  capitalize
                `}
                >
                  {advisor.type}
                </Badge>
              )}
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
