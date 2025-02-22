"use client";

import { useState, useEffect } from 'react';
import { useSurvey } from './SurveyContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { questions } from '@/data/survey-questions';
import { useRouter } from 'next/navigation';
import { submitSurvey } from '@/app/actions/survey';

export default function SurveyForm() {
  const { state, dispatch } = useSurvey();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Clear state on mount
  useEffect(() => {
    // Clear local storage
    localStorage.removeItem('surveyProgress');
    
    // Reset state
    dispatch({ 
      type: 'LOAD_PROGRESS', 
      payload: {
        currentStep: 0,
        totalSteps: questions.length,
        answers: {},
        completed: false,
        lastSaved: new Date(),
      } 
    });
  }, []); // Empty dependency array means this runs once on mount

  const currentQuestion = questions[state.progress.currentStep];
  const progress = (state.progress.currentStep / questions.length) * 100;

  const handleNext = () => {
    if (state.progress.currentStep < questions.length - 1) {
      dispatch({ type: 'SET_STEP', payload: state.progress.currentStep + 1 });
    }
  };

  const handlePrevious = () => {
    if (state.progress.currentStep > 0) {
      dispatch({ type: 'SET_STEP', payload: state.progress.currentStep - 1 });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Log state before submission
      console.log('Current answers state:', state.progress.answers);
      
      const result = await submitSurvey(state.progress.answers);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Clear local storage and state after successful submission
      localStorage.removeItem('surveyProgress');
      dispatch({ 
        type: 'LOAD_PROGRESS', 
        payload: {
          currentStep: 0,
          totalSteps: questions.length,
          answers: {},
          completed: true,
          lastSaved: new Date(),
        } 
      });

      router.push('/survey/thank-you');
    } catch (error) {
      console.error('Survey submission error:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to submit survey' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Progress value={progress} className="mb-8" />
      
      <div className="mb-8">
        <span className="text-sm text-muted-foreground">
          Question {state.progress.currentStep + 1} of {questions.length}
        </span>
      </div>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={state.progress.currentStep === 0}
        >
          Previous
        </Button>

        {state.progress.currentStep === questions.length - 1 ? (
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Survey'}
          </Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <Button
          variant="outline"
          onClick={() => console.log('Current state:', state.progress.answers)}
          className="mt-4"
        >
          Debug State
        </Button>
      )}
    </div>
  );
} 