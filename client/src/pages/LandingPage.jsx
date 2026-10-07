import { lazy, Suspense } from 'react'
import Navbar from '../components/landing/Navbar'
import HeroCarousel from '../components/landing/HeroCarousel'
import TrustBar from '../components/landing/TrustBar'

// Thin composition: each section lives in components/landing; copy and photos in landingContent.js.
// Navbar, hero and trust bar render first; the rest of the page is a separate chunk.
const BelowFoldSections = lazy(() => import('../components/landing/BelowFold').then(m => ({ default: m.BelowFoldSections })))
const Footer = lazy(() => import('../components/landing/BelowFold').then(m => ({ default: m.Footer })))

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Navbar />
      <main>
        <HeroCarousel />
        <TrustBar />
        <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
          <BelowFoldSections />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  )
}
