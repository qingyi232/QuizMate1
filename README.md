# QuizMate 🎓

**Your AI Study Buddy** - An intelligent study companion that generates instant explanations and flashcards for any question.

![QuizMate Banner](https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=QuizMate+-+AI+Study+Assistant)

## 🌟 Features

- **🤖 AI-Powered Explanations**: Get instant, detailed explanations for any question
- **📚 Smart Flashcards**: Auto-generated flashcards optimized for spaced repetition
- **🌍 Multi-Language Support**: Study in English, Indonesian, Filipino, or Swahili
- **📱 Mobile-First Design**: Optimized for all devices with responsive UI
- **💳 Flexible Pricing**: Free tier with premium upgrade options
- **⚡ Real-time Processing**: Fast AI responses with intelligent caching
- **📊 Analytics Dashboard**: Track your learning progress and statistics
- **🔒 Secure & Private**: Enterprise-grade security with Supabase Auth

## 🚀 Tech Stack

### Frontend
- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** + **shadcn/ui** for styling
- **Radix UI** for accessible components
- **React Hook Form** + **Zod** for form validation
- **Framer Motion** for animations
- **next-intl** for internationalization

### Backend
- **Next.js API Routes** (Edge Runtime for AI, Node Runtime for webhooks)
- **Supabase** (Database, Auth, Storage, RLS)
- **Upstash Redis** for caching and rate limiting

### AI & Processing
- **OpenAI GPT-4o-mini** (with DeepSeek and Qwen alternatives)
- **Custom parsing pipeline** for question analysis
- **Multi-provider abstraction** for AI switching

### Analytics & Monitoring
- **PostHog** for product analytics
- **Sentry** for error monitoring and performance tracking
- **Comprehensive event tracking** for user behavior analysis

### Payments & Billing
- **Stripe** for subscription management
- **Flexible pricing tiers** (Free/Pro)
- **Usage-based billing** with quota management

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key (or alternative AI provider)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/quizmate.git
cd quizmate
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Provider
OPENAI_API_KEY=your_openai_api_key
AI_PROVIDER=openai

# Stripe (optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
SENTRY_DSN=your_sentry_dsn
```

4. **Set up the database**
```bash
npm run db:migrate
npm run db:seed
```

5. **Start the development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing

### Unit Tests
```bash
# Run all unit tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests
```bash
# Run all e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e:ui

# Run e2e tests in headed mode
npm run test:e2e:headed
```

### Test Structure
- `tests/parsing.test.ts` - Text processing and question analysis
- `tests/schema.test.ts` - Zod schema validation
- `tests/e2e/quiz-flow.spec.ts` - Complete user journey testing

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   - Push your code to GitHub
   - Import project in Vercel dashboard
   - Vercel will auto-detect Next.js configuration

2. **Configure Environment Variables**
   - Add all environment variables from `.env.example`
   - Use Vercel's environment variables interface
   - Set different values for Preview/Production as needed

3. **Database Setup**
   - Run migrations on your production Supabase instance
   - Update Row Level Security policies
   - Test database connectivity

4. **Domain Configuration**
   - Add custom domain in Vercel settings
   - Update `APP_BASE_URL` environment variable
   - Configure Stripe webhook endpoints

5. **Stripe Webhook Setup**
   - Add webhook endpoint: `https://your-domain.com/api/stripe-webhook`
   - Update `STRIPE_WEBHOOK_SECRET` with the webhook secret
   - Test webhook delivery

### Alternative Deployment Options

<details>
<summary>Docker Deployment</summary>

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
```
</details>

## 📊 Database Schema

<details>
<summary>Core Tables</summary>

```sql
-- User profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  display_name TEXT,
  plan TEXT DEFAULT 'free',
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions and answers
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  language TEXT,
  subject TEXT,
  grade TEXT,
  meta JSONB,
  hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI responses
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id),
  answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  confidence NUMERIC,
  model TEXT,
  tokens INTEGER,
  cost_cents INTEGER,
  lang TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcards
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id),
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  hint TEXT,
  tags TEXT[],
  difficulty INTEGER DEFAULT 2,
  spaced_due_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
</details>

## 🔧 Configuration

### AI Providers
QuizMate supports multiple AI providers:

- **OpenAI** (default): GPT-4o-mini for cost-effective responses
- **DeepSeek**: Alternative provider for competitive pricing
- **Qwen**: For regions with OpenAI restrictions

Switch providers using the `AI_PROVIDER` environment variable.

### Caching Strategy
- **In-memory caching** for frequent queries
- **Redis caching** via Upstash for distributed caching
- **Database caching** with automatic expiration
- **CDN caching** for static assets

### Rate Limiting
- **Free tier**: 5 questions per day
- **Pro tier**: 1000 questions per day
- **API rate limiting** per IP and user
- **Graceful degradation** with queue management

## 📈 Analytics & Monitoring

### Event Tracking
- User registration and authentication
- Question generation (start/finish/cache hits)
- Billing events (upgrades, cancellations)
- UI interactions and errors
- Performance metrics

### Error Monitoring
- Real-time error capturing with Sentry
- Performance monitoring and alerts
- User session replays for debugging
- Automatic error categorization

## 🌍 Internationalization

Supported languages:
- 🇺🇸 English (default)
- 🇮🇩 Bahasa Indonesia
- 🇵🇭 Filipino
- 🇹🇿 Kiswahili

Add new languages by:
1. Creating translation files in `src/lib/i18n/messages/`
2. Adding locale to `src/lib/i18n/config.ts`
3. Updating the language switcher component

## 🔒 Security

### Authentication
- Supabase Auth with email and Google OAuth
- JWT token management
- Row Level Security (RLS) policies
- Session management with automatic refresh

### Data Protection
- GDPR compliant data handling
- User data deletion capabilities
- Encrypted data transmission
- Content moderation for AI responses

### API Security
- Rate limiting and DDoS protection
- Input validation and sanitization
- CORS configuration
- Environment variable security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Follow conventional commit messages
- Ensure accessibility compliance

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o-mini API
- **Supabase** for backend infrastructure
- **Vercel** for deployment platform
- **shadcn/ui** for component library
- **PostHog** for analytics platform

## 📞 Support

- 📧 Email: support@quizmate.ai
- 💬 Discord: [Join our community](https://discord.gg/quizmate)
- 📝 Documentation: [docs.quizmate.ai](https://docs.quizmate.ai)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/quizmate/issues)

---

<div align="center">
  <p>Made with ❤️ for students worldwide</p>
  <p>
    <a href="https://quizmate.ai">Website</a> •
    <a href="https://docs.quizmate.ai">Docs</a> •
    <a href="https://twitter.com/quizmate_ai">Twitter</a> •
    <a href="https://linkedin.com/company/quizmate">LinkedIn</a>
  </p>
</div>