'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, ChevronLeft } from 'lucide-react';

type Answers = {
  [key: number]: {
    title: string;
    responses: {
      [key: number]: {
        question: string;
        answer: string;
      };
    };
  };
};

const transformToFormattedData = (answers: Answers) => {
  return Object.entries(answers).map(([_, sectionData]) => ({
    section: sectionData.title,
    responses: Object.values(sectionData.responses)
  }));
};

const QuestionnaireForm = () => {
  const [currentSection, setCurrentSection] = useState(-1); // -1 for welcome screen
  const [answers, setAnswers] = useState<Answers>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sections = [
    {
      title: "Personal Context",
      questions: [
        "What is your current age, location, and primary occupation?",
        "What's the most significant change you're currently navigating in your life (career, relationships, personal growth, etc.)?"
      ]
    },
    {
      title: "Relationships & Social Dynamics",
      questions: [
        "Who are the three people who most energize or inspire you, and what quality in each of them resonates with you?",
        "In what social contexts or relationships do you feel most alive and authentic?"
      ]
    },
    {
      title: "Values & Identity",
      questions: [
        "Name three things (experiences, places, activities) that consistently bring you joy or satisfaction. Why?",
        "What's a strong conviction or approach to life that sets you apart from others?"
      ]
    },
    {
      title: "Inspiration & Models",
      questions: [
        "Name one real person and one fictional character you deeply resonate with. What specific qualities in each speak to you?",
        "What book, philosophy, or piece of wisdom has most shaped how you see the world and why?"
      ]
    },
    {
      title: "Growth & Aspirations",
      questions: [
        "What specific quality or capability would you most like to develop in yourself over the next year?",
        "Describe your ideal day three years from now - what would you be doing, and more importantly, who would you be being?"
      ]
    },
    {
      title: "Self-Understanding",
      questions: [
        "What's the most insightful feedback you've received about yourself from others?",
        "Complete this sentence: \"People who know me well would say I'm the kind of person who...\""
      ]
    }
  ];

  const handleAnswerChange = (sectionIndex: number, questionIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [sectionIndex]: {
        title: sections[sectionIndex].title,
        responses: {
          ...prev[sectionIndex]?.responses,
          [questionIndex]: {
            question: sections[sectionIndex].questions[questionIndex],
            answer: value
          }
        }
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const formattedAnswers = transformToFormattedData(answers);

      const response = await fetch('/api/generate-advisors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionnaireData: formattedAnswers
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate advisors');
      }

      const data = await response.json();
      console.log('Advisors generated:', data);
      // Handle the response (e.g., store in state, navigate to results page)

    } catch (error) {
      console.error('Error:', error);
      // Handle error (show error message to user)
    } finally {
      setIsLoading(false);
    }
  }; Q

  if (currentSection === -1) {
    return (
      <Card className="max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome to Your Personal Advisory Council</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            We'll ask you a series of questions to understand you better and create your personalized council of advisors.
          </p>
          <p className="text-center text-gray-600">
            Take your time with each response - the more detailed and honest you are, the better we can help you.
          </p>
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => setCurrentSection(0)}
              className="flex items-center gap-2"
            >
              Begin Journey <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {sections[currentSection].title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections[currentSection].questions.map((question, qIndex) => (
          <div key={qIndex} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question}
            </label>
            <Textarea
              value={answers[currentSection]?.responses?.[qIndex]?.answer || ''}
              onChange={(e) => handleAnswerChange(currentSection, qIndex, e.target.value)}
              rows={4}
              className="w-full"
              placeholder="Share your thoughts..."
            />
          </div>
        ))}

        <div className="flex justify-between mt-6">
          <Button
            onClick={() => setCurrentSection(prev => prev - 1)}
            disabled={currentSection === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>

          {currentSection === sections.length - 1 ? (
            <Button
              onClick={handleSubmit}
              className="flex items-center gap-2"
            >
              Submit
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentSection(prev => prev + 1)}
              className="flex items-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionnaireForm;