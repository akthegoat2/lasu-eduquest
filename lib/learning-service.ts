import { createClient } from "@/lib/supabase"

export interface Module {
  id: string
  title: string
  description: string
  emoji: string
  lessons: Lesson[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  xpReward: number
  skills: string[]
  projects: string[]
}

export interface Lesson {
  id: string
  title: string
  description: string
  content: string
  codeExample?: string
  challenge?: string
  starterCode?: string
  expectedOutput?: string
  tips?: string
  type: "theory" | "practice" | "project"
  xpReward: number
  estimatedTime: number
}

export interface Quiz {
  id: string
  title: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  questions: QuizQuestion[]
  timeLimit: number
  xpReward: number
  category: string
  type: "multiple-choice" | "coding" | "mixed"
  attempts: number
  completed: boolean
  score?: number
  locked?: boolean
}

export interface QuizQuestion {
  id: string
  type: "multiple-choice" | "coding" | "true-false"
  question: string
  code?: string
  options?: string[]
  correctAnswer: string
  explanation: string
  points: number
}

class LearningService {
  private supabase = createClient()

  // Comprehensive quiz data
  private quizzes: Quiz[] = [
    {
      id: "variables-data-types",
      title: "Variables & Data Types",
      description: "Understanding JavaScript variables, strings, numbers, and booleans",
      difficulty: "Beginner",
      questions: [
        {
          id: "1",
          type: "multiple-choice",
          question: "What is the correct way to declare a variable in JavaScript?",
          options: ["variable myVar = 5;", "let myVar = 5;", "declare myVar = 5;", "var myVar := 5;"],
          correctAnswer: "let myVar = 5;",
          explanation:
            "The 'let' keyword is the modern way to declare variables in JavaScript. It provides block scope and prevents redeclaration issues.",
          points: 10,
        },
        {
          id: "2",
          type: "multiple-choice",
          question: "Which of the following is NOT a JavaScript data type?",
          options: ["string", "boolean", "integer", "undefined"],
          correctAnswer: "integer",
          explanation:
            "JavaScript doesn't have a separate 'integer' type. All numbers in JavaScript are of type 'number', whether they're integers or floating-point numbers.",
          points: 10,
        },
        {
          id: "3",
          type: "multiple-choice",
          question: "What will be the output of: typeof null",
          options: ["null", "undefined", "object", "boolean"],
          correctAnswer: "object",
          explanation:
            "This is a well-known quirk in JavaScript. The typeof operator returns 'object' for null, even though null is not actually an object.",
          points: 10,
        },
        {
          id: "4",
          type: "coding",
          question: "Complete the code to create a variable that stores your name:",
          code: `// Create a variable called 'myName' and assign your name to it
// Your code here:`,
          correctAnswer: "let myName = ",
          explanation: "Use 'let' or 'const' to declare a variable and assign a string value to it.",
          points: 15,
        },
        {
          id: "5",
          type: "multiple-choice",
          question: "What is the result of: '5' + 3 in JavaScript?",
          options: ["8", "'53'", "53", "Error"],
          correctAnswer: "'53'",
          explanation:
            "JavaScript performs string concatenation when one operand is a string. The number 3 is converted to a string and concatenated with '5'.",
          points: 10,
        },
      ],
      timeLimit: 15,
      xpReward: 50,
      category: "javascript",
      type: "mixed",
      attempts: 0,
      completed: false,
    },
    {
      id: "functions-scope",
      title: "Functions & Scope",
      description: "Master JavaScript functions, parameters, and variable scope",
      difficulty: "Beginner",
      questions: [
        {
          id: "1",
          type: "multiple-choice",
          question: "What is the correct syntax for a function declaration?",
          options: ["function myFunc() {}", "def myFunc() {}", "func myFunc() {}", "function: myFunc() {}"],
          correctAnswer: "function myFunc() {}",
          explanation:
            "Function declarations in JavaScript use the 'function' keyword followed by the function name and parentheses.",
          points: 10,
        },
        {
          id: "2",
          type: "coding",
          question: "Write a function that adds two numbers:",
          code: `// Complete this function
function addNumbers(a, b) {
  // Your code here
}`,
          correctAnswer: "return a + b",
          explanation: "Use the return statement to return the sum of the two parameters.",
          points: 15,
        },
        {
          id: "3",
          type: "multiple-choice",
          question: "What is function scope?",
          options: [
            "Variables declared inside a function are accessible everywhere",
            "Variables declared inside a function are only accessible within that function",
            "Functions cannot access variables",
            "All variables are global",
          ],
          correctAnswer: "Variables declared inside a function are only accessible within that function",
          explanation:
            "Function scope means that variables declared inside a function are only accessible within that function's body.",
          points: 10,
        },
      ],
      timeLimit: 20,
      xpReward: 60,
      category: "javascript",
      type: "mixed",
      attempts: 0,
      completed: false,
    },
    {
      id: "arrays-objects",
      title: "Arrays & Objects",
      description: "Working with JavaScript arrays and objects",
      difficulty: "Intermediate",
      questions: [
        {
          id: "1",
          type: "multiple-choice",
          question: "How do you create an empty array in JavaScript?",
          options: ["let arr = {};", "let arr = [];", "let arr = new Array;", "Both B and C"],
          correctAnswer: "Both B and C",
          explanation: "You can create an empty array using either array literal syntax [] or the Array constructor.",
          points: 10,
        },
        {
          id: "2",
          type: "coding",
          question: "Access the first element of an array called 'fruits':",
          code: `let fruits = ['apple', 'banana', 'orange'];
// Write code to get the first element:`,
          correctAnswer: "fruits[0]",
          explanation: "Array indices start at 0, so the first element is accessed with fruits[0].",
          points: 15,
        },
      ],
      timeLimit: 25,
      xpReward: 75,
      category: "javascript",
      type: "coding",
      attempts: 0,
      completed: false,
    },
    {
      id: "react-components",
      title: "Components & Props",
      description: "Understanding React components and prop passing",
      difficulty: "Intermediate",
      questions: [
        {
          id: "1",
          type: "multiple-choice",
          question: "What is a React component?",
          options: [
            "A JavaScript function that returns HTML",
            "A reusable piece of UI",
            "A function that returns JSX",
            "All of the above",
          ],
          correctAnswer: "All of the above",
          explanation: "React components are JavaScript functions that return JSX, creating reusable pieces of UI.",
          points: 10,
        },
        {
          id: "2",
          type: "coding",
          question: "Create a simple React component that displays 'Hello World':",
          code: `// Complete this React component
function HelloWorld() {
  // Your code here
}`,
          correctAnswer: "return <h1>Hello World</h1>",
          explanation: "React components return JSX elements. Use JSX syntax to return HTML-like elements.",
          points: 15,
        },
      ],
      timeLimit: 15,
      xpReward: 65,
      category: "react",
      type: "multiple-choice",
      attempts: 0,
      completed: false,
    },
    {
      id: "react-state-hooks",
      title: "State & Hooks",
      description: "Master useState, useEffect, and other React hooks",
      difficulty: "Intermediate",
      questions: [
        {
          id: "1",
          type: "multiple-choice",
          question: "What hook is used to manage state in functional components?",
          options: ["useEffect", "useState", "useContext", "useReducer"],
          correctAnswer: "useState",
          explanation: "useState is the primary hook for managing state in React functional components.",
          points: 10,
        },
      ],
      timeLimit: 20,
      xpReward: 80,
      category: "react",
      type: "mixed",
      attempts: 0,
      completed: false,
      locked: true,
    },
    {
      id: "css-flexbox",
      title: "Flexbox Mastery",
      description: "Master CSS Flexbox layout system",
      difficulty: "Intermediate",
      questions: [
        {
          id: "1",
          type: "multiple-choice",
          question: "Which property is used to make an element a flex container?",
          options: ["display: flex", "flex: 1", "flex-direction: row", "justify-content: center"],
          correctAnswer: "display: flex",
          explanation:
            "The display: flex property makes an element a flex container, enabling flexbox layout for its children.",
          points: 10,
        },
      ],
      timeLimit: 12,
      xpReward: 55,
      category: "css",
      type: "multiple-choice",
      attempts: 0,
      completed: false,
    },
  ]

  // Module data (keeping existing modules and adding more)
  private modules: Module[] = [
    {
      id: "web-fundamentals",
      title: "Web Development Fundamentals",
      description: "Introduction to web development, how the internet works, and development environment setup",
      emoji: "🌐",
      difficulty: "Beginner",
      duration: "2 weeks",
      xpReward: 450,
      skills: ["Web Fundamentals", "Developer Tools", "Version Control"],
      projects: ["Personal Portfolio Setup", "Git Repository Creation"],
      lessons: [
        {
          id: "1",
          title: "How the Web Works",
          description: "Understanding the fundamentals of web communication",
          content: `The World Wide Web is a system of interconnected documents and resources, linked by hyperlinks and URLs. When you type a website address into your browser, a complex process begins:

1. **DNS Resolution**: Your browser contacts a DNS server to translate the domain name into an IP address
2. **HTTP Request**: Your browser sends an HTTP request to the server at that IP address
3. **Server Processing**: The server processes your request and prepares a response
4. **HTTP Response**: The server sends back HTML, CSS, JavaScript, and other resources
5. **Rendering**: Your browser interprets and displays the content

This process happens millions of times per second across the internet, enabling the seamless web experience we're familiar with.`,
          codeExample: `// Example of a simple HTTP request in JavaScript
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
          type: "theory",
          xpReward: 25,
          estimatedTime: 30,
          tips: "Think of the web like a postal system - browsers are like mailboxes, servers are like post offices, and HTTP is the postal service!",
        },
        {
          id: "2",
          title: "Setting Up Your Development Environment",
          description: "Installing and configuring essential development tools",
          content: `A proper development environment is crucial for efficient coding. Let's set up the essential tools:

**Visual Studio Code**: A powerful, free code editor with excellent extensions
**Git**: Version control system for tracking changes in your code
**Node.js**: JavaScript runtime for running JavaScript outside the browser
**Browser Developer Tools**: Built-in debugging and inspection tools

Setting up these tools properly will save you countless hours and make your development process much smoother.`,
          challenge: "Set up VS Code with essential extensions and create your first HTML file",
          starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Web Page</title>
</head>
<body>
    <!-- Add your content here -->
    
</body>
</html>`,
          expectedOutput: 'A basic HTML page displaying "Hello, World!"',
          type: "practice",
          xpReward: 35,
          estimatedTime: 45,
          tips: "Extensions like Live Server, Prettier, and GitLens will make your coding experience much better!",
        },
        {
          id: "3",
          title: "Understanding HTTP and HTTPS",
          description: "Learn about web protocols and security",
          content: `HTTP (HyperText Transfer Protocol) and HTTPS (HTTP Secure) are the foundation of web communication.

**HTTP Methods:**
- GET: Retrieve data from server
- POST: Send data to server
- PUT: Update existing data
- DELETE: Remove data

**Status Codes:**
- 200: Success
- 404: Not Found
- 500: Server Error

**HTTPS** adds encryption for secure communication.`,
          codeExample: `// Different HTTP methods with fetch
// GET request
fetch('/api/users')
  .then(response => response.json())

// POST request
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: 'John', email: 'john@example.com' })
})`,
          type: "theory",
          xpReward: 30,
          estimatedTime: 40,
          tips: "Always use HTTPS in production for security!",
        },
      ],
    },
    {
      id: "html-fundamentals",
      title: "HTML5 Mastery",
      description: "Complete HTML5 structure, semantic elements, forms, and accessibility best practices",
      emoji: "📄",
      difficulty: "Beginner",
      duration: "2 weeks",
      xpReward: 520,
      skills: ["HTML5", "Semantic Markup", "Web Accessibility", "SEO"],
      projects: ["Resume Website", "Contact Form", "Blog Layout"],
      lessons: [
        {
          id: "1",
          title: "HTML Document Structure",
          description: "Understanding the basic structure of HTML documents",
          content: `Every HTML document follows a standard structure that browsers can understand and process. This structure includes:

**DOCTYPE Declaration**: Tells the browser which version of HTML to use
**HTML Element**: The root element that contains all other elements
**Head Section**: Contains metadata about the document
**Body Section**: Contains the visible content of the page

Understanding this structure is fundamental to creating well-formed web pages.`,
          codeExample: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Title</title>
    <meta name="description" content="Page description">
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
    </header>
    <main>
        <p>This is the main content area.</p>
    </main>
    <footer>
        <p>&copy; 2024 My Website</p>
    </footer>
</body>
</html>`,
          type: "theory",
          xpReward: 25,
          estimatedTime: 30,
          tips: "Always include the lang attribute in your HTML element for better accessibility!",
        },
        {
          id: "2",
          title: "Semantic HTML Elements",
          description: "Using meaningful HTML elements for better structure and accessibility",
          content: `Semantic HTML elements provide meaning to your content, making it more accessible and SEO-friendly.

**Key Semantic Elements:**
- <header>: Page or section header
- <nav>: Navigation links
- <main>: Main content area
- <article>: Independent content
- <section>: Thematic grouping
- <aside>: Sidebar content
- <footer>: Page or section footer

These elements help screen readers and search engines understand your content structure.`,
          challenge: "Create a semantic HTML structure for a blog post",
          starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Blog Post</title>
</head>
<body>
    <!-- Create a semantic structure with header, nav, main, article, aside, and footer -->
    
</body>
</html>`,
          expectedOutput: "A properly structured HTML document using semantic elements",
          type: "practice",
          xpReward: 35,
          estimatedTime: 45,
          tips: "Think about the meaning of your content, not just how it looks!",
        },
      ],
    },
  ]

  // Get all modules
  getModules(): Module[] {
    return this.modules
  }

  // Get specific module
  getModule(moduleId: string): Module | null {
    return this.modules.find((m) => m.id === moduleId) || null
  }

  // Get lesson from module
  getLesson(moduleId: string, lessonId: string): Lesson | null {
    const module = this.getModule(moduleId)
    return module?.lessons.find((l) => l.id === lessonId) || null
  }

  // Get all quizzes with user progress
  async getQuizzes(userId?: string): Promise<Quiz[]> {
    if (!userId) return this.quizzes

    try {
      // Get user's quiz attempts
      const { data: attempts } = await this.supabase.from("quiz_attempts").select("*").eq("user_id", userId)

      // Get user profile to check completed lessons for unlocking
      const { data: profile } = await this.supabase
        .from("profiles")
        .select("completed_lessons")
        .eq("id", userId)
        .single()

      const completedLessons = profile?.completed_lessons || 0

      return this.quizzes.map((quiz) => {
        // Find user's best attempt for this quiz
        const userAttempts = attempts?.filter((a) => a.quiz_id === quiz.id) || []
        const bestAttempt = userAttempts.reduce(
          (best, current) => (!best || current.percentage > best.percentage ? current : best),
          null,
        )

        // Determine if quiz is locked (need at least 2 lessons completed for intermediate quizzes)
        const isLocked = quiz.difficulty === "Intermediate" && completedLessons < 2

        return {
          ...quiz,
          attempts: userAttempts.length,
          completed: userAttempts.length > 0,
          score: bestAttempt?.percentage || undefined,
          locked: isLocked,
        }
      })
    } catch (error) {
      console.error("Error fetching quizzes with progress:", error)
      return this.quizzes
    }
  }

  // Get specific quiz
  getQuiz(quizId: string): Quiz | null {
    return this.quizzes.find((q) => q.id === quizId) || null
  }

  // Record lesson progress
  async recordLessonProgress(
    userId: string,
    moduleId: string,
    lessonId: string,
    completed: boolean,
    timeSpent: number,
    score?: number,
  ): Promise<boolean> {
    try {
      const lesson = this.getLesson(moduleId, lessonId)
      if (!lesson) return false

      const { error } = await this.supabase.from("lesson_progress").upsert({
        user_id: userId,
        module_id: moduleId,
        lesson_id: lessonId,
        lesson_title: lesson.title,
        completed,
        score: score || 0,
        time_spent: Math.round(timeSpent),
        attempts: 1,
        completed_at: completed ? new Date().toISOString() : null,
        last_accessed: new Date().toISOString(),
      })

      return !error
    } catch (error) {
      console.error("Error recording lesson progress:", error)
      return false
    }
  }

  // Submit quiz attempt
  async submitQuizAttempt(
    userId: string,
    quizId: string,
    answers: Record<string, string>,
    timeTaken: number,
  ): Promise<{ success: boolean; score: number; percentage: number; xpEarned: number }> {
    try {
      const quiz = this.getQuiz(quizId)
      if (!quiz) return { success: false, score: 0, percentage: 0, xpEarned: 0 }

      // Calculate score
      let correctAnswers = 0
      let totalPoints = 0

      quiz.questions.forEach((question) => {
        totalPoints += question.points
        const userAnswer = answers[question.id]
        if (userAnswer && userAnswer.toLowerCase().includes(question.correctAnswer.toLowerCase())) {
          correctAnswers += question.points
        }
      })

      const percentage = Math.round((correctAnswers / totalPoints) * 100)
      const xpEarned = Math.round((percentage / 100) * quiz.xpReward)

      // Record in database
      const { error } = await this.supabase.from("quiz_attempts").insert({
        user_id: userId,
        quiz_id: quizId,
        quiz_title: quiz.title,
        score: correctAnswers,
        max_score: totalPoints,
        percentage,
        time_taken: timeTaken,
        answers,
        correct_answers: Math.round((correctAnswers / totalPoints) * quiz.questions.length),
        total_questions: quiz.questions.length,
        difficulty: quiz.difficulty,
        xp_earned: xpEarned,
      })

      if (error) throw error

      return { success: true, score: correctAnswers, percentage, xpEarned }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      return { success: false, score: 0, percentage: 0, xpEarned: 0 }
    }
  }

  // Get user progress
  async getUserProgress(userId: string) {
    try {
      const { data: lessonProgress } = await this.supabase.from("lesson_progress").select("*").eq("user_id", userId)

      const { data: quizAttempts } = await this.supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      return {
        lessons: lessonProgress || [],
        quizzes: quizAttempts || [],
      }
    } catch (error) {
      console.error("Error fetching user progress:", error)
      return { lessons: [], quizzes: [] }
    }
  }

  // Get leaderboard
  async getLeaderboard(limit = 10) {
    try {
      const { data } = await this.supabase
        .from("profiles")
        .select(
          "id, full_name, course, avatar_url, xp, level, streak, completed_lessons, completed_quizzes, weekly_xp, badges",
        )
        .order("xp", { ascending: false })
        .order("level", { ascending: false })
        .order("completed_lessons", { ascending: false })
        .limit(limit)

      return (data || []).map((user, index) => ({
        ...user,
        rank: index + 1,
        initials: user.full_name
          ? user.full_name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
          : "U",
      }))
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      return []
    }
  }

  // Award badge
  async awardBadge(userId: string, badgeName: string): Promise<boolean> {
    try {
      // Get current profile
      const { data: profile } = await this.supabase.from("profiles").select("badges").eq("id", userId).single()

      if (!profile) return false

      const currentBadges = profile.badges || []
      if (currentBadges.includes(badgeName)) return true // Already has badge

      const newBadges = [...currentBadges, badgeName]

      const { error } = await this.supabase.from("profiles").update({ badges: newBadges }).eq("id", userId)

      return !error
    } catch (error) {
      console.error("Error awarding badge:", error)
      return false
    }
  }

  // Generate certificate
  async generateCertificate(userId: string, courseId: string): Promise<boolean> {
    try {
      // Get user profile and progress
      const { data: profile } = await this.supabase.from("profiles").select("*").eq("id", userId).single()
      const { data: quizAttempts } = await this.supabase.from("quiz_attempts").select("*").eq("user_id", userId)

      if (!profile) return false

      // Check if user has completed enough content for certificate
      const requiredLessons = 5 // Minimum lessons for certificate
      const requiredQuizzes = 2 // Minimum quizzes for certificate

      if (profile.completed_lessons < requiredLessons || profile.completed_quizzes < requiredQuizzes) {
        return false
      }

      // Calculate average score
      const averageScore =
        quizAttempts?.length > 0
          ? Math.round(
              quizAttempts.reduce((sum: number, attempt: any) => sum + attempt.percentage, 0) / quizAttempts.length,
            )
          : 0

      // Generate certificate number
      const certificateNumber = `LASU-${courseId.toUpperCase()}-${Date.now()}-${userId.slice(-6)}`

      // Get course info
      const module = this.getModule(courseId)
      const courseTitle = module?.title || "Full Stack Development"

      const { error } = await this.supabase.from("certificates").insert({
        user_id: userId,
        course_id: courseId,
        course_title: courseTitle,
        certificate_number: certificateNumber,
        final_score: averageScore,
        total_lessons: profile.completed_lessons,
        total_quizzes: profile.completed_quizzes,
        study_hours: profile.total_study_hours,
        skills: module?.skills || ["Web Development", "JavaScript", "Problem Solving"],
        instructor: "Dr. Adebayo Ogundimu",
        institution: "Lagos State University",
      })

      return !error
    } catch (error) {
      console.error("Error generating certificate:", error)
      return false
    }
  }
}

export const learningService = new LearningService()
