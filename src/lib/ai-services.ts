// AI Services using free APIs only
declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
    SpeechRecognition: typeof SpeechRecognition;
  }

  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    readonly isFinal: boolean;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
}

declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
const HUGGINGFACE_API_KEY = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_HUGGINGFACE_API_KEY || '';
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';

// Free AI models available on HuggingFace
const MODELS = {
  CHAT: 'microsoft/DialoGPT-medium',
  SENTIMENT: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
  TRANSLATION: 'Helsinki-NLP/opus-mt-en-mul',
  QUESTION_GENERATION: 'valhalla/t5-small-qg-hl',
  TEXT_CLASSIFICATION: 'facebook/bart-large-mnli'
};

interface HuggingFaceResponse {
  generated_text?: string;
  label?: string;
  score?: number;
  [key: string]: unknown;
}

interface QueryParameters {
  max_length?: number;
  temperature?: number;
  do_sample?: boolean;
  [key: string]: unknown;
}

interface MoodData {
  mood: number;
  energy_level: number;
  stress_level?: string;
  [key: string]: string | number | undefined;
}

class AIService {
  private async query(model: string, inputs: string, parameters?: QueryParameters): Promise<HuggingFaceResponse[]> {
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
            do_sample: true,
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
      // Enhanced educational prompt structure
      const prompt = `As an expert ${subject} tutor, provide a clear, educational explanation for this ${difficulty}-level question: "${question}"

Please include:
1. A step-by-step explanation
2. Key concepts involved
3. A practical example if applicable
4. Common mistakes to avoid

Explanation:`;
      
      try {
        const response = await this.query(MODELS.CHAT, prompt, {
          max_length: 300,
          temperature: 0.6
        });
        
        if (response && response[0]?.generated_text) {
          const answer = response[0].generated_text.replace(prompt, '').trim();
          
          return {
            answer: answer || this.getFallbackResponse(question, subject),
            confidence: 0.85,
            follow_up_questions: this.generateFollowUpQuestions(question, subject),
            quiz_questions: await this.generateQuizQuestions(question, subject, difficulty)
          };
        }
      } catch {
        console.warn('AI API unavailable, using enhanced fallback response');
      }

      // Enhanced fallback response
      return {
        answer: this.getEnhancedFallbackResponse(question, subject, difficulty),
        confidence: 0.75,
        follow_up_questions: this.generateFollowUpQuestions(question, subject),
        quiz_questions: this.getFallbackQuizQuestions(question, subject, difficulty)
      };
    } catch (error) {
      console.error('Error generating tutor response:', error);
      // Return fallback response instead of throwing
      return {
        answer: this.getEnhancedFallbackResponse(question, subject, difficulty),
        confidence: 0.5,
        follow_up_questions: this.generateFollowUpQuestions(question, subject),
        quiz_questions: this.getFallbackQuizQuestions(question, subject, difficulty)
      };
    }
  }

  private getEnhancedFallbackResponse(question: string, subject: string, difficulty: string): string {
    const responses = {
      mathematics: {
        easy: `Great question about "${question}"! Let me break this down step by step:

1. **Understanding the Problem**: First, let's identify what we're looking for and what information we have.

2. **Key Concepts**: This involves fundamental mathematical principles that are essential to master.

3. **Step-by-Step Solution**: 
   - Start by organizing the given information
   - Apply the relevant mathematical operations
   - Check your work by substituting back

4. **Common Mistakes**: Watch out for calculation errors and make sure to follow the order of operations.

Remember, practice makes perfect in mathematics!`,
        
        medium: `Excellent question about "${question}"! This is a medium-level problem that requires understanding of several concepts:

**Core Concepts:**
- Mathematical relationships and patterns
- Problem-solving strategies
- Logical reasoning

**Approach:**
1. Analyze what the question is asking
2. Identify the mathematical tools needed
3. Work through the solution systematically
4. Verify your answer makes sense

**Pro Tip**: Try to visualize the problem or draw a diagram when possible - it often makes complex problems clearer!`,
        
        hard: `This is a challenging question about "${question}"! Advanced problems like this require:

**Advanced Techniques:**
- Multiple mathematical concepts working together
- Strategic problem-solving approach
- Careful attention to detail

**Solution Strategy:**
1. Break the complex problem into smaller parts
2. Solve each part systematically
3. Combine the results logically
4. Double-check using alternative methods

**Remember**: Don't get discouraged by difficult problems - they're opportunities to deepen your understanding!`
      },
      
      science: {
        easy: `Interesting science question about "${question}"! Let's explore this together:

**Scientific Method Approach:**
1. **Observation**: What do we notice about this phenomenon?
2. **Hypothesis**: What might be causing this?
3. **Explanation**: Here's what science tells us...

**Key Scientific Principles:**
- Natural laws and patterns
- Cause and effect relationships
- Evidence-based reasoning

**Real-World Connection**: This concept appears in everyday life when...`,
        
        medium: `Great scientific inquiry about "${question}"! This involves several important concepts:

**Scientific Understanding:**
- Fundamental principles at work
- How different factors interact
- The importance of controlled conditions

**Analysis Process:**
1. Identify the variables involved
2. Understand the relationships
3. Apply scientific principles
4. Consider real-world applications

**Did You Know?** This concept is used in modern technology and research!`,
        
        hard: `Excellent advanced question about "${question}"! This requires deep scientific thinking:

**Complex Scientific Concepts:**
- Multiple interacting systems
- Advanced theoretical frameworks
- Quantitative analysis

**Research Approach:**
1. Review fundamental principles
2. Analyze complex interactions
3. Apply advanced scientific methods
4. Consider broader implications

**Career Connection**: Scientists working in this field use these concepts to make breakthrough discoveries!`
      },
      
      default: {
        easy: `That's a thoughtful question about "${question}"! Let me help you understand this concept:

**Learning Approach:**
1. Start with the basics
2. Build understanding step by step
3. Connect to what you already know
4. Practice with examples

**Key Points to Remember:**
- Focus on understanding, not just memorizing
- Ask questions when something isn't clear
- Practice regularly to reinforce learning

You're doing great by asking questions - that's how real learning happens!`,
        
        medium: `Excellent question about "${question}"! This shows you're thinking deeply about the subject:

**Understanding This Concept:**
- It builds on foundational knowledge
- Requires connecting multiple ideas
- Has practical applications

**Study Strategy:**
1. Review related concepts first
2. Work through examples carefully
3. Explain the concept in your own words
4. Find connections to other topics

Keep up the curious mindset - it's your greatest learning tool!`,
        
        hard: `This is a sophisticated question about "${question}"! Advanced topics like this require:

**Deep Learning Approach:**
- Synthesis of multiple concepts
- Critical thinking skills
- Analytical reasoning

**Mastery Strategy:**
1. Ensure strong foundation in prerequisites
2. Break complex ideas into components
3. Practice with challenging examples
4. Seek multiple perspectives

Remember: Mastering difficult concepts takes time and persistence. You're on the right track!`
      }
    };

    const subjectResponses = responses[subject.toLowerCase() as keyof typeof responses] || responses.default;
    return subjectResponses[difficulty as keyof typeof subjectResponses] || subjectResponses.medium;
  }

  private getFallbackResponse(question: string, subject: string): string {
    return this.getEnhancedFallbackResponse(question, subject, 'medium');
  }

  private generateFollowUpQuestions(question: string, subject: string): string[] {
    const followUps = [
      `Can you give me a real-world example of this ${subject} concept?`,
      `What are some common mistakes students make with this topic?`,
      `How does this relate to other concepts in ${subject}?`,
      `Can you show me a similar but slightly more challenging problem?`,
      `What are the practical applications of this knowledge?`,
      `What would happen if we changed one of the variables?`,
      `How do professionals use this concept in their work?`,
      `What's the historical background of this discovery?`
    ];

    // Return 3-4 relevant follow-up questions
    return followUps
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 3);
  }

  async generateQuizQuestions(topic: string, subject: string, difficulty: string = 'medium', count: number = 3) {
    try {
      return this.getFallbackQuizQuestions(topic, subject, difficulty, count);
    } catch {
      console.error('Error generating quiz questions');
      return this.getFallbackQuizQuestions(topic, subject, difficulty, count);
    }
  }

  private getFallbackQuizQuestions(topic: string, subject: string, difficulty: string, count: number = 3) {
    const questionTemplates = {
      mathematics: {
        easy: [
          {
            question: `What is the basic principle behind ${topic}?`,
            options: ['Option A: First principle', 'Option B: Second principle', 'Option C: Third principle', 'Option D: Fourth principle'],
            correct: 'Option A: First principle',
            explanation: `The basic principle of ${topic} involves understanding fundamental mathematical relationships.`
          },
          {
            question: `Which of these is an example of ${topic}?`,
            options: ['Example A', 'Example B', 'Example C', 'Example D'],
            correct: 'Example A',
            explanation: `This example demonstrates the key concepts of ${topic} in a practical way.`
          }
        ],
        medium: [
          {
            question: `How would you apply ${topic} to solve a real-world problem?`,
            options: ['Method A: Direct application', 'Method B: Modified approach', 'Method C: Combined technique', 'Method D: Alternative solution'],
            correct: 'Method A: Direct application',
            explanation: `Direct application of ${topic} principles provides the most straightforward solution.`
          }
        ],
        hard: [
          {
            question: `What are the advanced implications of ${topic} in complex scenarios?`,
            options: ['Implication A: Advanced theory', 'Implication B: Complex interaction', 'Implication C: Theoretical framework', 'Implication D: Research application'],
            correct: 'Implication A: Advanced theory',
            explanation: `Advanced applications of ${topic} require deep theoretical understanding.`
          }
        ]
      },
      science: {
        easy: [
          {
            question: `What is the main scientific concept behind ${topic}?`,
            options: ['Concept A: Basic law', 'Concept B: Natural phenomenon', 'Concept C: Scientific principle', 'Concept D: Observable pattern'],
            correct: 'Concept A: Basic law',
            explanation: `The scientific foundation of ${topic} is based on well-established natural laws.`
          }
        ],
        medium: [
          {
            question: `How does ${topic} relate to other scientific phenomena?`,
            options: ['Relationship A: Causal connection', 'Relationship B: Correlational link', 'Relationship C: Systematic interaction', 'Relationship D: Independent occurrence'],
            correct: 'Relationship A: Causal connection',
            explanation: `${topic} demonstrates clear causal relationships with other scientific phenomena.`
          }
        ],
        hard: [
          {
            question: `What are the research implications of ${topic} in modern science?`,
            options: ['Research A: Breakthrough potential', 'Research B: Theoretical advancement', 'Research C: Practical application', 'Research D: Interdisciplinary impact'],
            correct: 'Research A: Breakthrough potential',
            explanation: `Current research in ${topic} shows significant potential for scientific breakthroughs.`
          }
        ]
      }
    };

    const subjectTemplates = questionTemplates[subject.toLowerCase() as keyof typeof questionTemplates] || questionTemplates.mathematics;
    const difficultyTemplates = subjectTemplates[difficulty as keyof typeof subjectTemplates] || subjectTemplates.medium;
    
    const questions = [];
    const pointValues = { easy: 10, medium: 15, hard: 20 };
    
    for (let i = 0; i < count; i++) {
      const template = difficultyTemplates[i % difficultyTemplates.length];
      questions.push({
        id: `q_${Date.now()}_${i}`,
        question: template.question,
        type: 'multiple_choice' as const,
        options: template.options,
        correct_answer: template.correct,
        explanation: template.explanation,
        points: pointValues[difficulty as keyof typeof pointValues] || 15,
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
        const score = response[0].score || 0;

        return {
          sentiment: sentiment.includes('positive') ? 'positive' :
                    sentiment.includes('negative') ? 'negative' : 'neutral',
          confidence: score,
          stress_level: sentiment.includes('negative') && score > 0.7 ? 'high' :
                       sentiment.includes('negative') ? 'medium' : 'low'
        };
      }
    } catch {
      console.warn('Sentiment analysis unavailable, using fallback');
    }

    // Enhanced fallback sentiment analysis
    const negativeWords = ['stressed', 'anxious', 'worried', 'tired', 'overwhelmed', 'difficult', 'hard', 'frustrated', 'confused', 'upset'];
    const positiveWords = ['happy', 'excited', 'confident', 'good', 'great', 'easy', 'fun', 'enjoy', 'love', 'amazing', 'wonderful'];
    const stressWords = ['pressure', 'deadline', 'exam', 'test', 'nervous', 'panic', 'overwhelmed', 'burden'];
    
    const lowerText = text.toLowerCase();
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const stressCount = stressWords.filter(word => lowerText.includes(word)).length;
    
    let sentiment = 'neutral';
    let stressLevel = 'low';
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
    }
    
    if (stressCount > 0 || negativeCount > 2) {
      stressLevel = 'high';
    } else if (negativeCount > 0) {
      stressLevel = 'medium';
    }
    
    return {
      sentiment,
      confidence: Math.min(0.8, (Math.abs(positiveCount - negativeCount) + 1) / 5),
      stress_level: stressLevel
    };
  }

  async generateWellnessRecommendations(moodData: MoodData, stressLevel: string) {
    const recommendations = {
      high: [
        'Take 5 deep breaths - inhale for 4 counts, hold for 4, exhale for 6',
        'Step outside for fresh air and a 5-minute walk',
        'Listen to calming music or nature sounds',
        'Try progressive muscle relaxation - tense and release each muscle group',
        'Reach out to a friend, family member, or counselor for support',
        'Practice the 5-4-3-2-1 grounding technique: 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste',
        'Write down your worries and then write one small action you can take for each'
      ],
      medium: [
        'Take a 10-minute study break and stretch your body',
        'Do some light stretching or yoga poses',
        'Drink a glass of water and have a healthy snack',
        'Practice mindfulness for 3-5 minutes - focus on your breathing',
        'Organize your study space to create a calmer environment',
        'Set a small, achievable goal for the next hour',
        'Review your accomplishments from today - celebrate small wins!'
      ],
      low: [
        'Great job managing your stress! Keep up the good work',
        'Consider helping a classmate who might be struggling',
        'Set a new learning goal to challenge yourself',
        'Celebrate your recent achievements - you deserve recognition!',
        'Share a study tip with friends or classmates',
        'Take time to appreciate your progress in learning',
        'Plan something fun to do after your study session'
      ]
    };

    const baseRecommendations = recommendations[stressLevel as keyof typeof recommendations] || recommendations.medium;
    
    // Add personalized recommendations based on mood data
    const personalizedRecommendations = [...baseRecommendations];
    
    if (moodData.mood <= 2) {
      personalizedRecommendations.unshift('Remember: it\'s okay to have difficult days. Be kind to yourself.');
    }
    
    if (moodData.energy_level <= 2) {
      personalizedRecommendations.push('Consider taking a short nap or doing some light exercise to boost energy');
    }
    
    return personalizedRecommendations.slice(0, 5);
  }

  async generateLessonPlan(syllabus: string, subject: string, gradeLevel: string) {
    // Enhanced lesson plan generation
    const topics = syllabus.split('\n').filter(line => line.trim().length > 0);
    
    const lessonActivities: Record<string, string[]> = {
      mathematics: [
        'Problem-solving workshop with real-world examples',
        'Interactive demonstration using visual aids',
        'Guided practice with step-by-step solutions',
        'Peer collaboration on challenging problems',
        'Technology integration with math software'
      ],
      science: [
        'Hands-on experiment or demonstration',
        'Scientific inquiry and hypothesis formation',
        'Data collection and analysis activity',
        'Connection to current scientific research',
        'Real-world application discussion'
      ],
      default: [
        'Interactive introduction with engaging questions',
        'Collaborative learning activity',
        'Practical application exercise',
        'Discussion and reflection session',
        'Creative project or presentation'
      ]
    } as const;

    const activities = lessonActivities[subject.toLowerCase() as keyof typeof lessonActivities] || lessonActivities.default;
    
    return {
      title: `${subject} Lesson Plan - Grade ${gradeLevel}`,
      objectives: [
        `Students will understand key concepts in ${subject}`,
        'Students will be able to apply learned concepts to solve problems',
        'Students will demonstrate mastery through assessments',
        'Students will connect learning to real-world applications'
      ],
      lessons: topics.slice(0, 8).map((topic, index) => ({
        id: `lesson_${index + 1}`,
        title: topic.trim(),
        duration: 45,
        activities: [
          'Warm-up activity and review (5 minutes)',
          `${activities[index % activities.length]} (20 minutes)`,
          'Guided practice and Q&A (15 minutes)',
          'Wrap-up and assignment preview (5 minutes)'
        ],
        resources: [
          'Interactive whiteboard or projector',
          'Student handouts and worksheets',
          'Online resources and educational videos',
          'Assessment rubrics and feedback forms'
        ],
        assessment: 'Formative assessment through questioning, exit tickets, and practical exercises'
      })),
      totalDuration: topics.length * 45,
      materials: [
        'Whiteboard/projector for presentations',
        'Student handouts and reference materials',
        'Digital resources and educational technology',
        'Assessment tools and rubrics',
        'Supplementary learning materials'
      ],
      differentiation: [
        'Provide multiple difficulty levels for activities',
        'Offer visual, auditory, and kinesthetic learning options',
        'Include extension activities for advanced learners',
        'Provide additional support for struggling students'
      ]
    };
  }
}

export const aiService = new AIService();

// Text-to-Speech using Web Speech API (Free)
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

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find appropriate voice for language
    const voice = this.voices.find(v => 
      v.lang.startsWith(options.language || 'en')
    ) || this.voices.find(v => v.default) || this.voices[0];
    
    if (voice) utterance.voice = voice;
    
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = 0.8;
    
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

  isSupported() {
    return 'speechSynthesis' in window;
  }
}

export const ttsService = new TextToSpeechService();

// Speech-to-Text using Web Speech API (Free)
export class SpeechToTextService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as typeof globalThis & { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as typeof globalThis & { SpeechRecognition: typeof SpeechRecognition }).SpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError?: (error: unknown) => void,
    language = 'en-US'
  ) {
    if (!this.recognition) {
      onError?.('Speech recognition not supported in this browser');
      return;
    }

    this.recognition.lang = language;
    
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
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

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      onError?.(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      onError?.(error);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  isSupported() {
    return !!this.recognition;
  }

  getIsListening() {
    return this.isListening;
  }
}

export const sttService = new SpeechToTextService();