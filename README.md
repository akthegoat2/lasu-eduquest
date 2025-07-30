# LASU Learn - E-Learning Dashboard

A comprehensive, gamified e-learning platform built for Lagos State University Computer Science students. Features interactive lessons, quizzes, certificates, and a competitive leaderboard system.

## 🚀 Features

- **Interactive Learning Modules**: Comprehensive web development curriculum
- **Gamified Experience**: XP system, levels, badges, and achievements
- **Real-time Quizzes**: Multiple choice and coding challenges
- **Certificate System**: Earn official certificates for completed courses
- **Leaderboard**: Compete with fellow students
- **Progress Tracking**: Detailed analytics and progress monitoring
- **Code Editor**: Built-in code editor for hands-on practice
- **Responsive Design**: Works perfectly on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **State Management**: React hooks and context
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **VS Code** (recommended editor)

## 🔧 Installation & Setup

### 1. Clone the Repository
\`\`\`bash
git clone <your-repository-url>
cd lasu-learn-dashboard
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Environment Setup
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials (see Supabase Setup section)

### 4. Database Setup
The SQL scripts in the `scripts/` folder will set up your database schema:
- `create-profiles-table.sql`
- `create-progress-tables.sql`
- `create-comprehensive-schema.sql`
- `create-storage-bucket.sql`

### 5. Run Development Server
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗄️ Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your keys
3. Run the SQL scripts in your Supabase SQL editor
4. Enable Row Level Security (RLS) for all tables
5. Set up authentication providers as needed

## 📁 Project Structure

\`\`\`
lasu-learn-dashboard/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth-wrapper.tsx  # Authentication wrapper
│   ├── dashboard-content.tsx
│   ├── modules-content.tsx
│   ├── quizzes-content.tsx
│   ├── leaderboard-content.tsx
│   ├── certificates-content.tsx
│   └── ...
├── lib/                  # Utility libraries
│   ├── supabase.ts      # Supabase client
│   ├── learning-service.ts
│   └── profile-service.ts
├── hooks/               # Custom React hooks
├── scripts/            # Database setup scripts
└── public/            # Static assets
\`\`\`

## 🎮 Key Features Explained

### Gamification System
- **XP Points**: Earn 25 XP per completed lesson
- **Levels**: Automatic level progression every 1000 XP
- **Badges**: 9 different achievement badges
- **Streaks**: Daily activity tracking

### Learning Modules
- **Web Fundamentals**: HTML, CSS, JavaScript basics
- **Advanced Topics**: React, Node.js, Full-stack development
- **Interactive Content**: Theory, practice, and project-based learning
- **Code Editor**: Syntax highlighting and real-time feedback

### Assessment System
- **Multiple Choice Quizzes**: Instant feedback and explanations
- **Coding Challenges**: Hands-on programming exercises
- **Progress Tracking**: Detailed performance analytics
- **Adaptive Difficulty**: Content unlocks based on progress

### Certificate System
- **Official Certificates**: PDF generation and verification
- **Skill Validation**: Comprehensive skill assessment
- **Portfolio Integration**: LinkedIn-ready certificates
- **Progress Requirements**: Merit-based certificate earning

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Manual Deployment
\`\`\`bash
npm run build
npm start
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the LASU Computer Science Department
- Email: support@lasulearn.edu.ng

## 🙏 Acknowledgments

- Lagos State University Computer Science Department
- All contributing students and faculty
- Open source community for the amazing tools and libraries

---

**Built with ❤️ for LASU Computer Science Students**
\`\`\`

Now let me write out the missing UI components:
