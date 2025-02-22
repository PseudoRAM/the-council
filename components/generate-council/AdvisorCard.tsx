import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState } from "react";

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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={cn(
        "h-full relative py-6",
        onSelect ? "hover:shadow-lg transition-shadow cursor-pointer" : "",
        isSelected ? "ring-2 ring-primary" : ""
      )}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 transform transition-transform duration-200 ease-in-out">
          <Check className="h-4 w-4" />
        </div>
      )}
      <CardHeader className="space-y-1 py-0">
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
            <div className="flex flex-col items-start gap-1">
              <CardTitle className="text-lg">{advisor.name}</CardTitle>
              {advisor.type && (
                <Badge
                  className={`
                  ${advisor.type === "historical" && "bg-blue-100 text-blue-800"}
                  ${advisor.type === "fictional" && "bg-purple-100 text-purple-800"}
                  ${advisor.type === "archetypal" && "bg-green-100 text-green-800"}
                  ${advisor.type === "current" && "bg-yellow-100 text-yellow-800"}
                  capitalize pointer-events-none  
                `}
                >
                  {advisor.type}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      {(advisor.description || advisor.why) && (
        <CardContent className="pb-0 pt-4">
          <p className="text-sm text-gray-600 transition-opacity duration-1000">
            {isHovered && advisor.why ? advisor.why : advisor.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
};
