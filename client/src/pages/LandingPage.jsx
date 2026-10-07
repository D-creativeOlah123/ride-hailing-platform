import Navbar from '../components/landing/Navbar'
import HeroCarousel from '../components/landing/HeroCarousel'
import TrustBar from '../components/landing/TrustBar'
import LiveRideStrip from '../components/landing/LiveRideStrip'
import ForRiders from '../components/landing/ForRiders'
import HowItWorks from '../components/landing/HowItWorks'
import RideOptions from '../components/landing/RideOptions'
import SafetySection from '../components/landing/SafetySection'
import ForDrivers from '../components/landing/ForDrivers'
import CityCoverage from '../components/landing/CityCoverage'
import Stats from '../components/landing/Stats'
import LegacySections from '../components/landing/LegacySections'

// Sections are added phase by phase (see LANDING_PAGE_BRIEF.md §4).
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Navbar />
      <main>
        <HeroCarousel />
        <TrustBar />
        <LiveRideStrip />
        <ForRiders />
        <HowItWorks />
        <RideOptions />
        <SafetySection />
        <ForDrivers />
        <CityCoverage />
        <Stats />
        <LegacySections />
      </main>
    </div>
  )
}
