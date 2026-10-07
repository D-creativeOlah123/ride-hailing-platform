import { useEffect } from 'react'
import LiveRideStrip from './LiveRideStrip'
import ForRiders from './ForRiders'
import HowItWorks from './HowItWorks'
import RideOptions from './RideOptions'
import SafetySection from './SafetySection'
import ForDrivers from './ForDrivers'
import CityCoverage from './CityCoverage'
import Stats from './Stats'
import TestimonialCarousel from './TestimonialCarousel'
import Faq from './Faq'
import AppDownloadCta from './AppDownloadCta'
import Footer from './Footer'

/**
 * Everything below the hero, loaded as a separate chunk so the first paint
 * (navbar + hero + trust bar) doesn't wait for it.
 */
export function BelowFoldSections() {
  // These sections arrive after the initial load, so honour a #hash (e.g. /#faq from another page) once they exist.
  useEffect(() => {
    const { hash } = window.location
    if (hash.length > 1) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
  }, [])

  return (
    <>
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
    </>
  )
}

export { Footer }
