import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { aiService } from '../lib/ai-services';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Brain, BookOpen, Zap, Download, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { LessonPlan, Quiz } from '../types';

interface FormData {
  contentType: 'lesson' | 'quiz';
  subject: string;
  gradeLevel: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const ContentGenerator: React.FC = () => {
  const { supabaseUser } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    contentType: 'lesson',
    subject: '',
    gradeLevel: '',
    topic: '',
    difficulty: 'medium'
  });
  const [generatedContent, setGeneratedContent] = useState<LessonPlan | Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUser) return;

    setLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      if (formData.contentType === 'lesson') {
        const syllabus = formData.topic; // Use topic as syllabus for lesson plan
        const lessonPlan = await aiService.generateLessonPlan(syllabus, formData.subject, formData.gradeLevel);
        setGeneratedContent(lessonPlan);
      } else {
        const quiz = await aiService.generateQuizQuestions(
          formData.topic,
          formData.subject,
          formData.difficulty,
          5 // Generate 5 questions
        );
        setGeneratedContent({
          id: `quiz_${Date.now()}`,
          title: `Generated Quiz: ${formData.topic}`,
          description: `AI-generated quiz for ${formData.subject} - Grade ${formData.gradeLevel}`,
          questions: quiz,
          difficulty_level: formData.difficulty,
          subject: formData.subject,
          created_by: supabaseUser.id,
          created_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedContent) {
      const content = JSON.stringify(generatedContent, null, 2);
      navigator.clipboard.writeText(content);
      // Could add a toast notification here
    }
  };

  const handleDownload = () => {
    if (generatedContent) {
      const content = JSON.stringify(generatedContent, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-content-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message="Generating content with AI..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-4">
          AI Content Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create engaging lesson plans and quizzes effortlessly with AI. Tailored for your classroom needs.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <Card padding="lg">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contentType"
                    value="lesson"
                    checked={formData.contentType === 'lesson'}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span className="text-sm">Lesson Plan <BookOpen className="w-4 h-4 inline" /></span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="contentType"
                    value="quiz"
                    checked={formData.contentType === 'quiz'}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span className="text-sm">Quiz <Zap className="w-4 h-4 inline" /></span>
                </label>
              </div>
            </div>

            <Input
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="e.g., Mathematics, Science, History"
              required
              leftIcon={<Brain className="w-4 h-4" />}
            />

            <Input
              label="Grade Level"
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleInputChange}
              placeholder="e.g., Grade 10, High School"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic / Syllabus
              </label>
              <textarea
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder={formData.contentType === 'lesson' ? "Enter syllabus topics (one per line)" : "Enter main topic for quiz questions"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-vertical min-h-[120px]"
                required
              />
            </div>

            {formData.contentType === 'quiz' && (
              <Input
                label="Difficulty"
                name="difficulty"
                type="select"
                value={formData.difficulty}
                onChange={handleInputChange}
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Input>
            )}

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

            <Button type="submit" variant="primary" size="lg" fullWidth icon={<Brain className="w-5 h-5" />}>
              Generate Content
            </Button>
          </form>
        </Card>

        {/* Generated Content Section */}
        <div className="space-y-6">
          {generatedContent ? (
            <Card padding="lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {formData.contentType === 'lesson' ? 'Generated Lesson Plan' : 'Generated Quiz'}
                </h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    icon={<Copy className="w-4 h-4" />}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    icon={<Download className="w-4 h-4" />}
                  >
                    Download
                  </Button>
                </div>
              </div>

              <div className="prose max-w-none">
                {formData.contentType === 'lesson' && generatedContent && 'lessons' in generatedContent && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{(generatedContent as LessonPlan).title}</h3>
                    <p className="text-gray-600 mb-4">Objectives: {(generatedContent as LessonPlan).objectives?.join(', ')}</p>
                    <div className="space-y-4">
                      {(generatedContent as LessonPlan).lessons?.map((lesson) => (
                        <div key={lesson.id} className="border-l-4 border-primary-500 pl-4">
                          <h4 className="font-semibold">{lesson.title}</h4>
                          <p className="text-sm text-gray-600">Duration: {lesson.duration} minutes</p>
                          <ul className="list-disc list-inside mt-2">
                            {lesson.activities?.map((activity, idx) => (
                              <li key={idx}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Materials Needed:</h4>
                      <ul className="list-disc list-inside">
                        {(generatedContent as LessonPlan).materials?.map((material, idx) => (
                          <li key={idx}>{material}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {formData.contentType === 'quiz' && generatedContent && 'questions' in generatedContent && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{generatedContent.title}</h3>
                    <p className="text-gray-600 mb-4">{generatedContent.description}</p>
                    <div className="space-y-6">
                      {generatedContent.questions.map((question) => (
                        <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold mb-2">{question.question}</h4>
                          <p className="text-sm text-gray-500 mb-3">Type: {question.type} | Points: {question.points} | Difficulty: {question.difficulty}</p>
                          {question.options && (
                            <ul className="space-y-1 mb-3">
                              {question.options.map((option, idx) => (
                                <li key={idx} className="ml-4">{option}</li>
                              ))}
                            </ul>
                          )}
                          <div className="bg-green-50 p-3 rounded mt-3">
                            <strong>Correct Answer:</strong> {question.correct_answer}
                          </div>
                          {question.explanation && (
                            <div className="bg-blue-50 p-3 rounded mt-2">
                              <strong>Explanation:</strong> {question.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card padding="lg" className="text-center">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Content Generated Yet</h3>
              <p className="text-gray-600">Fill out the form on the left to create lesson plans or quizzes with AI.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator;
