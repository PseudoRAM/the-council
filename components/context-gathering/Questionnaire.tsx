'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, ChevronLeft } from 'lucide-react';

type Answers = {
  [key: number]: {
    [key: number]: string;
  };
};

const QuestionnaireForm = () => {
  const [currentSection, setCurrentSection] = useState(-1); // -1 for welcome screen
  const [answers, setAnswers] = useState<Answers>({});

  const sections = [
    {
      title: "Biography",
      questions: [
        "What is your current age and gender?",
        "Where are you from?",
        "Where do you live now, and how do you feel about it? Where else have you lived?",
        "What is your current occupation, and how do you feel about it? What else have you done for work?",
        "What has your education looked like?"
      ]
    },
    {
      title: "People",
      questions: [
        "Describe the basic shape of your family and how you tend to relate to them.",
        "Describe your current social circle(s). Who do you spend most of your time with?",
        "Who are the people who energize you the most? Why?",
        "Which relationships would you like to develop or strengthen?",
        "Who are your mentors or role models in your immediate life?",
        "In what social contexts do you feel most alive?"
      ]
    },
    {
      title: "Values & Preferences",
      questions: [
        "Name an aspect of the world—a thing, a place, an experience—that consistently delights you.",
        "What do you find beautiful?",
        "Are there any traditions or philosophies that really click with how you approach life?",
        "What's something other people do, that you never do?"
      ]
    },
    {
      title: "Inspiration",
      questions: [
        "Name three real people, living or dead, who you find inspiring. What do you admire about each of them?",
        "Name three fictional characters you resonate with, and say what feels notable about each of them.",
        "What archetypal figures (e.g., The Sage, The Creator, The Explorer) do you most identify with? Why?",
        "What books, articles, talks, or works of art have significantly influenced your worldview?"
      ]
    },
    {
      title: "Personality",
      questions: [
        "What personality frameworks (e.g. Myers-Briggs, Enneagram) have you found helpful in understanding yourself?",
        "What type(s) do you identify with in those frameworks and why?",
        "What kind of animal do you most feel like / would you like to be?",
        "What descriptions of you from friends and family have struck a chord?"
      ]
    },
    {
      title: "Direction",
      questions: [
        "Who do you want to become in the next 5-10 years?",
        "What skills or qualities would you like to develop?",
        "What would be a wildly good outcome of an advisor conversation for you?"
      ]
    },
    {
      title: "Additional Thoughts",
      questions: [
        "Anything else you want to mention?"
      ]
    }
  ];

  const handleAnswerChange = (sectionIndex: number, questionIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [sectionIndex]: {
        ...prev[sectionIndex],
        [questionIndex]: value
      }
    }));
  };

  const handleSubmit = () => {
    console.log('Final answers:', answers);
    // Here you would typically send the data to your backend/LLM
  };

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
              value={answers[currentSection]?.[qIndex] || ''}
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