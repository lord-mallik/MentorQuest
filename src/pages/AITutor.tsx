import React from 'react';
import AITutorInterface from '../components/AITutor/AITutorInterface';

const AITutor: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Tutor</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get personalized help with any subject. Ask questions, get explanations, 
          and generate practice quizzes tailored to your learning level.
        </p>
      </div>
      
      <AITutorInterface />
    </div>
  );
};

export default AITutor;