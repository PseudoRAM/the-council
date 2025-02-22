import { Suspense } from 'react';
import SurveyForm from '@/components/survey/SurveyForm';
import { SurveyProvider } from '@/components/survey/SurveyContext';
import { createClient } from '@/utils/supabase/server';

export default async function SurveyPage() {
  // Show button always in development
  const showSeedButton = process.env.NODE_ENV === 'development';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Screening Questionnaire</h1>
      
      {showSeedButton && (
        <form action="/api/survey/seed" method="POST" className="mb-4">
          <button 
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Seed Questions (Dev Only)
          </button>
        </form>
      )}

      <SurveyProvider>
        <SurveyForm />
      </SurveyProvider>
    </div>
  );
} 