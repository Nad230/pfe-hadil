import type { Habit, DisciplineScore } from "@/lib/types/habits"

// Niveaux de discipline
const DISCIPLINE_LEVELS = [
  { name: "Novice", minScore: 0 },
  { name: "Apprentice", minScore: 20 },
  { name: "Practitioner", minScore: 40 },
  { name: "Expert", minScore: 60 },
  { name: "Master", minScore: 80 },
  { name: "Grandmaster", minScore: 95 },
]

/**
 * Calcule le score de discipline basé sur les habitudes et leurs complétions
 */
export function calculateDisciplineScore(habits: Habit[]): DisciplineScore {
  if (!habits || habits.length === 0) {
    return { score: 0, level: "Novice", nextLevel: "Apprentice", progress: 0 }
  }

  // Facteurs de calcul
  const streakFactor = 0.4
  const completionRateFactor = 0.4
  const consistencyFactor = 0.2

  // Calcul du score de streak
  const maxStreak = Math.max(...habits.map((h) => h.streak))
  const streakScore = Math.min(100, (maxStreak / 30) * 100) * streakFactor

  // Calcul du taux de complétion
  let totalCompletions = 0
  let totalAttempts = 0

  habits.forEach((habit) => {
    const completions = habit.completions || []
    totalCompletions += completions.filter((c) => c.completed).length
    totalAttempts += completions.length
  })

  const completionRate = totalAttempts > 0 ? (totalCompletions / totalAttempts) * 100 : 0
  const completionScore = completionRate * completionRateFactor

  // Calcul de la consistance (régularité des check-ins)
  const consistencyScore = calculateConsistencyScore(habits) * consistencyFactor

  // Score total
  const totalScore = Math.min(100, streakScore + completionScore + consistencyScore)

  // Déterminer le niveau actuel et le prochain niveau
  const currentLevel = DISCIPLINE_LEVELS.filter((level) => level.minScore <= totalScore).pop()
  const nextLevelIndex = DISCIPLINE_LEVELS.findIndex((level) => level.name === currentLevel?.name) + 1
  const nextLevel = nextLevelIndex < DISCIPLINE_LEVELS.length ? DISCIPLINE_LEVELS[nextLevelIndex] : null

  // Calculer la progression vers le prochain niveau
  let progress = 100
  if (nextLevel) {
    const currentMin = currentLevel?.minScore || 0
    const nextMin = nextLevel.minScore
    progress = ((totalScore - currentMin) / (nextMin - currentMin)) * 100
  }

  return {
    score: Math.round(totalScore),
    level: currentLevel?.name || "Novice",
    nextLevel: nextLevel?.name || "Mastered",
    progress: Math.round(progress),
  }
}

/**
 * Calcule le score de consistance basé sur la régularité des check-ins
 */
function calculateConsistencyScore(habits: Habit[]): number {
  if (!habits || habits.length === 0) return 0

  // Analyser les derniers 14 jours
  const today = new Date()
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(today.getDate() - 14)

  // Créer un tableau des 14 derniers jours
  const days: { date: string; hasCompletion: boolean }[] = []
  for (let i = 0; i < 14; i++) {
    const date = new Date()
    date.setDate(today.getDate() - i)
    days.push({
      date: date.toISOString().split("T")[0],
      hasCompletion: false,
    })
  }

  // Marquer les jours avec des complétions
  habits.forEach((habit) => {
    const completions = habit.completions || []
    completions.forEach((completion) => {
      const completionDate = new Date(completion.date).toISOString().split("T")[0]
      const dayIndex = days.findIndex((day) => day.date === completionDate)
      if (dayIndex >= 0) {
        days[dayIndex].hasCompletion = true
      }
    })
  })

  // Calculer le pourcentage de jours avec au moins une complétion
  const daysWithCompletions = days.filter((day) => day.hasCompletion).length
  return (daysWithCompletions / 14) * 100
}

/**
 * Génère une citation entrepreneuriale motivante
 */
export function getEntrepreneurialQuote(): { quote: string; author: string } {
  const quotes = [
    {
      quote:
        "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
      author: "Steve Jobs",
    },
    { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    {
      quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
      author: "Winston Churchill",
    },
    { quote: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
    { quote: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
    { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { quote: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
    {
      quote: "If you are not willing to risk the usual, you will have to settle for the ordinary.",
      author: "Jim Rohn",
    },
    {
      quote: "The only limit to our realization of tomorrow will be our doubts of today.",
      author: "Franklin D. Roosevelt",
    },
    { quote: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
    { quote: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
    { quote: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
    { quote: "Setting goals is the first step in turning the invisible into the visible.", author: "Tony Robbins" },
    { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { quote: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" },
  ]

  return quotes[Math.floor(Math.random() * quotes.length)]
}

/**
 * Génère des suggestions d'amélioration basées sur les habitudes
 */
export function generateSuggestions(habits: Habit[]): string[] {
  const suggestions: string[] = []

  if (!habits || habits.length === 0) {
    return ["Start by creating your first entrepreneurial habit to build momentum."]
  }

  // Vérifier les habitudes sans streak
  const habitsWithoutStreak = habits.filter((h) => h.streak === 0)
  if (habitsWithoutStreak.length > 0) {
    suggestions.push(`Focus on building consistency with ${habitsWithoutStreak[0].name} to start a streak.`)
  }

  // Vérifier les habitudes avec un faible taux de complétion
  const lowCompletionHabits = habits.filter((h) => {
    const completions = h.completions || []
    if (completions.length < 5) return false
    const completionRate = completions.filter((c) => c.completed).length / completions.length
    return completionRate < 0.5
  })

  if (lowCompletionHabits.length > 0) {
    suggestions.push(
      `Try to improve your completion rate for ${lowCompletionHabits[0].name}. Consider adjusting your weekly target to make it more achievable.`,
    )
  }

  // Vérifier les habitudes avec un bon streak
  const goodStreakHabits = habits.filter((h) => h.streak >= 7)
  if (goodStreakHabits.length > 0) {
    suggestions.push(
      `Great job maintaining a streak with ${goodStreakHabits[0].name}! Consider increasing your weekly target to challenge yourself.`,
    )
  }

  // Vérifier le nombre d'habitudes
  if (habits.length < 3) {
    suggestions.push("Consider adding more entrepreneurial habits to create a balanced routine.")
  } else if (habits.length > 7) {
    suggestions.push(
      "You have many habits. Consider focusing on the most impactful ones to avoid spreading yourself too thin.",
    )
  }

  // Ajouter une suggestion générale si aucune suggestion spécifique n'a été générée
  if (suggestions.length === 0) {
    suggestions.push("Keep up the good work! Consistency is key to entrepreneurial success.")
  }

  return suggestions
}

/**
 * Génère un résumé hebdomadaire des habitudes
 */
export function generateWeeklyReview(habits: Habit[]): {
  completionRate: number
  streakGrowth: number
  topHabit: string | null
  improvementArea: string | null
  summary: string
} {
  if (!habits || habits.length === 0) {
    return {
      completionRate: 0,
      streakGrowth: 0,
      topHabit: null,
      improvementArea: null,
      summary: "No habits to review yet. Start by creating some entrepreneurial habits.",
    }
  }

  // Calculer le taux de complétion hebdomadaire
  let weeklyCompletions = 0
  let weeklyAttempts = 0

  const today = new Date()
  const weekAgo = new Date()
  weekAgo.setDate(today.getDate() - 7)

  habits.forEach((habit) => {
    const completions = habit.completions || []
    const weeklyCompletionData = completions.filter((c) => {
      const date = new Date(c.date)
      return date >= weekAgo && date <= today
    })

    weeklyCompletions += weeklyCompletionData.filter((c) => c.completed).length
    weeklyAttempts += weeklyCompletionData.length
  })

  const completionRate = weeklyAttempts > 0 ? (weeklyCompletions / weeklyAttempts) * 100 : 0

  // Trouver l'habitude avec le meilleur streak
  const topHabitObj = habits.reduce((prev, current) => (prev.streak > current.streak ? prev : current), habits[0])
  const topHabit = topHabitObj ? topHabitObj.name : null

  // Trouver une zone d'amélioration
  const improvementHabit = habits.find((h) => {
    const completions = h.completions || []
    if (completions.length < 3) return false

    const recentCompletions = completions
      .filter((c) => new Date(c.date) >= weekAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return recentCompletions.length > 0 && !recentCompletions[0].completed
  })

  const improvementArea = improvementHabit ? improvementHabit.name : null

  // Calculer la croissance du streak (moyenne)
  const streakGrowth =
    habits.reduce((sum, habit) => {
      const completions = habit.completions || []
      if (completions.length < 2) return sum

      const oldestCompletion = completions.reduce((oldest, current) =>
        new Date(oldest.date) < new Date(current.date) ? oldest : current,
      )

      const oldestDate = new Date(oldestCompletion.date)
      const daysSinceStart = Math.floor((today.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24))

      return daysSinceStart > 0 ? sum + habit.streak / daysSinceStart : sum
    }, 0) / habits.length

  // Générer un résumé
  let summary = ""
  if (completionRate >= 80) {
    summary = "Excellent week! You're showing strong entrepreneurial discipline."
  } else if (completionRate >= 60) {
    summary = "Good progress this week. Keep building on this momentum."
  } else if (completionRate >= 40) {
    summary = "Moderate progress. Focus on consistency to improve your results."
  } else {
    summary = "This week was challenging. Consider adjusting your habits or targets to build momentum."
  }

  return {
    completionRate: Math.round(completionRate),
    streakGrowth: Math.round(streakGrowth * 100) / 100,
    topHabit,
    improvementArea,
    summary,
  }
}
