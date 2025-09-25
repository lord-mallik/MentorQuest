import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, BookOpen, MessageSquare, Heart } from 'lucide-react';

const QuickToolsGrid: React.FC = () => {
  return (
    <div className="border-t pt-6">
      <h4 className="font-medium text-gray-900 mb-4">Quick Tools</h4>
      <div className="grid grid-cols-2 gap-3">
        <Link to="/content-generator" className="p-3 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors text-center">
          <Brain className="w-6 h-6 text-primary-600 mx-auto mb-1" />
          <span className="text-xs font-medium">AI Content</span>
        </Link>
        <Link to="/quizzes" className="p-3 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors text-center">
          <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <span className="text-xs font-medium">Create Quiz</span>
        </Link>
        <button className="p-3 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors text-center">
          <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <span className="text-xs font-medium">Announcements</span>
        </button>
        <Link to="/analytics" className="p-3 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors text-center">
          <Heart className="w-6 h-6 text-pink-600 mx-auto mb-1" />
          <span className="text-xs font-medium">Analytics</span>
        </Link>
      </div>
    </div>
  );
};

export default QuickToolsGrid;