import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QuizMate - Your AI Study Buddy',
  description: 'Paste questions. Get instant explanations & flashcards.',
  keywords: ['AI', 'education', 'quiz', 'flashcards', 'study', 'learning'],
  authors: [{ name: 'QuizMate Team' }],
  creator: 'QuizMate',
  publisher: 'QuizMate',
  openGraph: {
    title: 'QuizMate - Your AI Study Buddy',
    description: 'Paste questions. Get instant explanations & flashcards.',
    url: 'https://quizmate.app',
    siteName: 'QuizMate',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'QuizMate - AI Study Assistant',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuizMate - Your AI Study Buddy',
    description: 'Paste questions. Get instant explanations & flashcards.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className} suppressHydrationWarning={true}>
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  )
}