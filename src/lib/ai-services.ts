// AI Services using free APIs
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY || '';
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';

// Available free models
const MODELS = {
  CHAT: 'microsoft/DialoGPT-medium',
  SENTIMENT: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
  TRANSLATION: 'Helsinki-NLP/opus-mt-en-mul',
  QUESTION_GENERATION: 'valhalla/t5-small-qg-hl',
  TEXT_CLASSIFICATION: 'facebook/bart-large-mnli'
};

class AIService {
  private async query(model: string, inputs: any, parameters?: any) {
    try {
      const response = await fetch(`${HUGGINGFACE_API_URL}/${model}`, {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs,
          parameters: {
            max_length: 512,
            temperature: 0.7,
            ...parameters
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  async generateTutorResponse(question: string, subject: string, difficulty: string = 'medium') {
    try {
      // Use a more educational prompt structure
      const prompt = `As an AI tutor, explain this ${subject} question at ${difficulty} level: "${question}"\n\nProvide a clear, educational explanation with examples.`;
      
      // For demo purposes, we'll use a fallback response if API fails
      try {
        const response = await this.query(MODELS.CHAT, prompt);
        
        if (response && response[0]?.generated_text) {
          const answer = response[0].generated_text.replace(prompt, '').trim();
          
          return {
            answer: answer || this.getFallbackResponse(question, subject),
            confidence: 0.85,
            follow_up_questions: this.generateFollowUpQuestions(question, subject),
            quiz_questions: await this.generateQuizQuestions(question, subject, difficulty)
          };
        }
      } catch (apiError) {
        console.warn('AI API unavailable, using fallback response');
      }

      // Fallback response
      return {
        answer: this.getFallbackResponse(question, subject),
        confidence: 0.75,
        follow_up_questions: this.generateFollowUpQuestions(question, subject),
        quiz_questions: this.getFallbackQuizQuestions(question, subject, difficulty)
      };
    } catch (error) {
      console.error('Error generating tutor response:', error);
      throw error;
    }
  }

  private getFallbackResponse(question: string, subject: string): string {
    const responses = {
      math: `Let me help you understand this math concept. For questions like "${question}", it's important to break down the problem step by step. First, identify what you're looking for, then determine what information you have, and finally apply the appropriate mathematical principles.`,
      science: `This is a great ${subject} question! "${question}" relates to fundamental scientific principles. Let me explain the key concepts and how they apply to real-world situations.`,
      history: `Understanding "${question}" requires looking at the historical context and the factors that influenced events during that time period. Let me walk you through the key points.`,
      english: `For this English question about "${question}", let's analyze the literary elements, themes, and techniques involved. Understanding these components will help you grasp the deeper meaning.`,
      default: `That's an excellent question about "${question}". Let me provide you with a comprehensive explanation that covers the key concepts and practical applications.`
    };

    return responses[subject.toLowerCase() as keyof typeof responses] || responses.default;
  }

  private generateFollowUpQuestions(question: string, subject: string): string[] {
    const followUps = [
      `Can you give me a real-world example of this ${subject} concept?`,
      `What are some common mistakes students make with this topic?`,
      `How does this relate to other concepts in ${subject}?`,
      `Can you show me a similar but slightly more challenging problem?`,
      `What are the practical applications of this knowledge?`
    ];

    return followUps.slice(0, 3);
  }

  async generateQuizQuestions(topic: string, subject: string, difficulty: string = 'medium', count: number = 3) {
    try {
      // For demo purposes, return fallback questions if API fails
      return this.getFallbackQuizQuestions(topic, subject, difficulty, count);
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      return this.getFallbackQuizQuestions(topic, subject, difficulty, count);
    }
  }

  private getFallbackQuizQuestions(topic: string, subject: string, difficulty: string, count: number = 3) {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      questions.push({
        id: `q_${Date.now()}_${i}`,
        question: `Question ${i + 1}: What is an important concept related to "${topic}" in ${subject}?`,
        type: 'multiple_choice' as const,
        options: [
          'Option A: First possible answer',
          'Option B: Second possible answer',
          'Option C: Third possible answer',
          'Option D: Fourth possible answer'
        ],
        correct_answer: 'Option A: First possible answer',
        explanation: `This question tests your understanding of key concepts in ${subject} related to ${topic}.`,
        points: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15,
        difficulty: difficulty as 'easy' | 'medium' | 'hard'
      });
    }

    return questions;
  }

  async analyzeSentiment(text: string) {
    try {
      const response = await this.query(MODELS.SENTIMENT, text);
      
      if (response && response[0]?.label) {
        const sentiment = response[0].label.toLowerCase();
        const score = response[0].score;
        
        return {
          sentiment: sentiment.includes('positive') ? 'positive' : 
                    sentiment.includes('negative') ? 'negative' : 'neutral',
          confidence: score,
          stress_level: sentiment.includes('negative') && score > 0.7 ? 'high' : 
                       sentiment.includes('negative') ? 'medium' : 'low'
        };
      }
    } catch (error) {
      console.warn('Sentiment analysis unavailable, using fallback');
    }

    // Fallback sentiment analysis
    const negativeWords = ['stressed', 'anxious', 'worried', 'tired', 'overwhelmed', 'difficult', 'hard', 'frustrated'];
    const positiveWords = ['happy', 'excited', 'confident', 'good', 'great', 'easy', 'fun', 'enjoy'];
    
    const lowerText = text.toLowerCase();
    const hasNegative = negativeWords.some(word => lowerText.includes(word));
    const hasPositive = positiveWords.some(word => lowerText.includes(word));
    
    return {
      sentiment: hasNegative && !hasPositive ? 'negative' : 
                hasPositive && !hasNegative ? 'positive' : 'neutral',
      confidence: 0.6,
      stress_level: hasNegative ? 'medium' : 'low'
    };
  }

  async translateText(text: string, targetLanguage: string) {
    try {
      // For demo purposes, return mock translations
      const translations: Record<string, Record<string, string>> = {
        'es': {
          'Welcome to MentorQuest': 'Bienvenido a MentorQuest',
          'AI Tutor': 'Tutor de IA',
          'Dashboard': 'Panel de Control',
          'Profile': 'Perfil',
          'Settings': 'Configuración'
        },
        'fr': {
          'Welcome to MentorQuest': 'Bienvenue à MentorQuest',
          'AI Tutor': 'Tuteur IA',
          'Dashboard': 'Tableau de Bord',
          'Profile': 'Profil',
          'Settings': 'Paramètres'
        },
        'de': {
          'Welcome to MentorQuest': 'Willkommen bei MentorQuest',
          'AI Tutor': 'KI-Tutor',
          'Dashboard': 'Dashboard',
          'Profile': 'Profil',
          'Settings': 'Einstellungen'
        },
        'hi': {
          'Welcome to MentorQuest': 'मेंटरक्वेस्ट में आपका स्वागत है',
          'AI Tutor': 'एआई शिक्षक',
          'Dashboard': 'डैशबोर्ड',
          'Profile': 'प्रोफ़ाइल',
          'Settings': 'सेटिंग्स'
        }
      };

      return translations[targetLanguage]?.[text] || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  async generateWellnessRecommendations(moodData: any, stressLevel: string) {
    const recommendations = {
      high: [
        'Take a 5-minute breathing exercise',
        'Go for a short walk outside',
        'Listen to calming music',
        'Practice progressive muscle relaxation',
        'Talk to a friend or counselor'
      ],
      medium: [
        'Take a short break from studying',
        'Do some light stretching',
        'Drink some water and have a healthy snack',
        'Practice mindfulness for 3 minutes',
        'Organize your study space'
      ],
      low: [
        'Great job managing your stress!',
        'Keep up the good work with your study routine',
        'Consider helping a classmate who might be struggling',
        'Set a new learning goal for yourself',
        'Celebrate your recent achievements'
      ]
    };

    return recommendations[stressLevel as keyof typeof recommendations] || recommendations.medium;
  }

  async generateLessonPlan(syllabus: string, subject: string, gradeLevel: string) {
    // Fallback lesson plan generation
    const topics = syllabus.split('\n').filter(line => line.trim().length > 0);
    
    return {
      title: `${subject} Lesson Plan - Grade ${gradeLevel}`,
      objectives: [
        `Students will understand key concepts in ${subject}`,
        'Students will be able to apply learned concepts to real-world scenarios',
        'Students will demonstrate mastery through assessments'
      ],
      lessons: topics.slice(0, 5).map((topic, index) => ({
        id: `lesson_${index + 1}`,
        title: topic.trim(),
        duration: 45,
        activities: [
          'Introduction and warm-up (5 minutes)',
          'Main instruction and examples (20 minutes)',
          'Guided practice (15 minutes)',
          'Wrap-up and homework assignment (5 minutes)'
        ],
        resources: [
          'Textbook chapters',
          'Online interactive exercises',
          'Video demonstrations',
          'Practice worksheets'
        ],
        assessment: 'Formative assessment through questioning and exit tickets'
      })),
      totalDuration: topics.length * 45,
      materials: [
        'Whiteboard/projector',
        'Student handouts',
        'Digital resources',
        'Assessment rubrics'
      ]
    };
  }
}

export const aiService = new AIService();

// Text-to-Speech using Web Speech API
export class TextToSpeechService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
    
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  speak(text: string, options: { language?: string; rate?: number; pitch?: number } = {}) {
    if (!this.synth) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find appropriate voice
    const voice = this.voices.find(v => 
      v.lang.startsWith(options.language || 'en')
    ) || this.voices[0];
    
    if (voice) utterance.voice = voice;
    
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    
    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  getAvailableVoices() {
    return this.voices;
  }
}

export const ttsService = new TextToSpeechService();

// Speech-to-Text using Web Speech API
export class SpeechToTextService {
  private recognition: any;
  private isListening = false;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    }
  }

  startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError?: (error: any) => void,
    language = 'en-US'
  ) {
    if (!this.recognition) {
      onError?.('Speech recognition not supported');
      return;
    }

    this.recognition.lang = language;
    
    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      onResult(finalTranscript || interimTranscript, !!finalTranscript);
    };

    this.recognition.onerror = (event: any) => {
      onError?.(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.start();
    this.isListening = true;
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  isSupported() {
    return !!this.recognition;
  }
}

export const sttService = new SpeechToTextService();