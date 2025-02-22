"use client";

import { Question, Answer } from '@/types/survey';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';

// Dynamically import TipTap editor for rich text
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
});

interface QuestionCardProps {
  question: Question;
  answer?: Answer;
  onAnswer: (value: string | string[]) => void;
}

export default function QuestionCard({ 
  question, 
  answer, 
  onAnswer 
}: QuestionCardProps) {
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            value={answer?.value as string || ''}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder="Enter your answer"
            required={question.required}
          />
        );
      
      case 'longtext':
        return (
          <RichTextEditor
            initialContent={answer?.value as string || ''}
            onChange={(content) => onAnswer(content)}
          />
        );
      
      case 'radio':
        return (
          <RadioGroup
            value={answer?.value as string}
            onValueChange={onAnswer}
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={(answer?.value as string[] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = answer?.value as string[] || [];
                    if (checked) {
                      onAnswer([...currentValues, option]);
                    } else {
                      onAnswer(currentValues.filter((v) => v !== option));
                    }
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{question.question}</h3>
        {question.description && (
          <p className="text-sm text-muted-foreground">{question.description}</p>
        )}
      </CardHeader>
      <CardContent>
        {renderQuestionInput()}
      </CardContent>
    </Card>
  );
} 