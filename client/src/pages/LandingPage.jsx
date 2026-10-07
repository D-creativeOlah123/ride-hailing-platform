import Navbar from '../components/landing/Navbar'
import HeroCarousel from '../components/landing/HeroCarousel'
import TrustBar from '../components/landing/TrustBar'
import LegacySections from '../components/landing/LegacySections'

// Sections are added phase by phase (see LANDING_PAGE_BRIEF.md §4).
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Navbar />
      <main>
        <HeroCarousel />
        <TrustBar />
        <LegacySections />
      </main>
    </div>
  )
}
