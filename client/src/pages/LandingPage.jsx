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
import TestimonialCarousel from '../components/landing/TestimonialCarousel'
import Faq from '../components/landing/Faq'
import AppDownloadCta from '../components/landing/AppDownloadCta'
import Footer from '../components/landing/Footer'

// Thin composition: each section lives in components/landing; copy and photos in landingContent.js.
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
        <TestimonialCarousel />
        <Faq />
        <AppDownloadCta />
      </main>
      <Footer />
    </div>
  )
}
