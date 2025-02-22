import { Question } from '@/types/survey';

// Define categories with titles
const categories = [
  {
    id: '123e4567-e89b-12d3-a456-426614174111',
    title: 'Personal Information',
    description: 'Basic information gathering',
    sequence_number: 1,
  }
] as const;

// Map category IDs to their titles for easy lookup
const categoryTitles: Record<string, string> = {
  '123e4567-e89b-12d3-a456-426614174111': 'Personal Information',
};

export const questions: Question[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000', // UUID format
    type: 'text',
    question: 'What is your name?',
    required: true,
    categoryId: '123e4567-e89b-12d3-a456-426614174111', // Replace with actual category UUID
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    type: 'radio',
    question: 'What is your age range?',
    options: ['18-24', '25-34', '35-44', '45-54', '55+'],
    required: true,
    categoryId: '123e4567-e89b-12d3-a456-426614174111',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    type: 'longtext',
    question: 'Please describe your relevant experience',
    description: 'Include any details about your background and skills',
    required: true,
    categoryId: '123e4567-e89b-12d3-a456-426614174111',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    type: 'checkbox',
    question: 'Which areas are you interested in?',
    options: ['Development', 'Design', 'Marketing', 'Sales', 'Support'],
    required: false,
    categoryId: '123e4567-e89b-12d3-a456-426614174111',
  },
];

export { categoryTitles }; 