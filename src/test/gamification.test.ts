import { describe, it, expect } from 'vitest'

// XP Calculation Tests
describe('XP Calculation', () => {
  const calculateXP = (basePoints: number, multiplier: number = 1) => {
    return Math.floor(basePoints * multiplier)
  }

  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 1000) + 1
  }

  it('should calculate XP correctly for quiz completion', () => {
    expect(calculateXP(100)).toBe(100)
    expect(calculateXP(50, 1.5)).toBe(75)
    expect(calculateXP(25, 2)).toBe(50)
  })

  it('should calculate level progression correctly', () => {
    expect(calculateLevel(0)).toBe(1)
    expect(calculateLevel(500)).toBe(1)
    expect(calculateLevel(1000)).toBe(2)
    expect(calculateLevel(2500)).toBe(3)
    expect(calculateLevel(10000)).toBe(11)
  })

  it('should handle edge cases', () => {
    expect(calculateXP(0)).toBe(0)
    expect(calculateLevel(999)).toBe(1)
    expect(calculateLevel(1001)).toBe(2)
  })
})

// Achievement System Tests
describe('Achievement System', () => {
  interface Achievement {
    id: string
    name: string
    requirements: Record<string, any>
    xp_reward: number
  }

  const checkAchievement = (achievement: Achievement, userStats: Record<string, any>): boolean => {
    for (const [key, value] of Object.entries(achievement.requirements)) {
      if (userStats[key] === undefined || userStats[key] < value) {
        return false
      }
    }
    return true
  }

  const achievements: Achievement[] = [
    {
      id: 'first_quiz',
      name: 'First Steps',
      requirements: { quiz_count: 1 },
      xp_reward: 50
    },
    {
      id: 'quiz_master',
      name: 'Quiz Master',
      requirements: { quiz_count: 10 },
      xp_reward: 200
    },
    {
      id: 'streak_keeper',
      name: 'Streak Keeper',
      requirements: { streak_days: 7 },
      xp_reward: 150
    }
  ]

  it('should unlock achievements when requirements are met', () => {
    const userStats = { quiz_count: 1, streak_days: 0 }
    
    expect(checkAchievement(achievements[0], userStats)).toBe(true)
    expect(checkAchievement(achievements[1], userStats)).toBe(false)
    expect(checkAchievement(achievements[2], userStats)).toBe(false)
  })

  it('should handle multiple requirements', () => {
    const complexAchievement: Achievement = {
      id: 'super_student',
      name: 'Super Student',
      requirements: { quiz_count: 5, streak_days: 3, level: 2 },
      xp_reward: 300
    }

    expect(checkAchievement(complexAchievement, { quiz_count: 5, streak_days: 3, level: 2 })).toBe(true)
    expect(checkAchievement(complexAchievement, { quiz_count: 5, streak_days: 2, level: 2 })).toBe(false)
    expect(checkAchievement(complexAchievement, { quiz_count: 4, streak_days: 3, level: 2 })).toBe(false)
  })
})

// Quiz Scoring Tests
describe('Quiz Scoring', () => {
  interface Question {
    id: string
    points: number
    correct_answer: string
  }

  interface QuizAttempt {
    answers: Record<string, string>
    questions: Question[]
  }

  const calculateQuizScore = (attempt: QuizAttempt) => {
    let score = 0
    let maxScore = 0

    attempt.questions.forEach(question => {
      maxScore += question.points
      if (attempt.answers[question.id] === question.correct_answer) {
        score += question.points
      }
    })

    return {
      score,
      maxScore,
      percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
    }
  }

  const questions: Question[] = [
    { id: 'q1', points: 10, correct_answer: 'A' },
    { id: 'q2', points: 15, correct_answer: 'B' },
    { id: 'q3', points: 20, correct_answer: 'C' }
  ]

  it('should calculate perfect score correctly', () => {
    const attempt: QuizAttempt = {
      answers: { q1: 'A', q2: 'B', q3: 'C' },
      questions
    }

    const result = calculateQuizScore(attempt)
    expect(result.score).toBe(45)
    expect(result.maxScore).toBe(45)
    expect(result.percentage).toBe(100)
  })

  it('should calculate partial score correctly', () => {
    const attempt: QuizAttempt = {
      answers: { q1: 'A', q2: 'X', q3: 'C' },
      questions
    }

    const result = calculateQuizScore(attempt)
    expect(result.score).toBe(30)
    expect(result.maxScore).toBe(45)
    expect(result.percentage).toBe(67)
  })

  it('should handle zero score', () => {
    const attempt: QuizAttempt = {
      answers: { q1: 'X', q2: 'Y', q3: 'Z' },
      questions
    }

    const result = calculateQuizScore(attempt)
    expect(result.score).toBe(0)
    expect(result.maxScore).toBe(45)
    expect(result.percentage).toBe(0)
  })

  it('should handle empty quiz', () => {
    const attempt: QuizAttempt = {
      answers: {},
      questions: []
    }

    const result = calculateQuizScore(attempt)
    expect(result.score).toBe(0)
    expect(result.maxScore).toBe(0)
    expect(result.percentage).toBe(0)
  })
})