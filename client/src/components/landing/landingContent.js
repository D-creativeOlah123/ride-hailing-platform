// All landing-page copy, photos, numbers and links live here.
// Edit this file to change wording or swap photos — components only read from it.
// Photos are in /public/landing (see scripts/landing-images.json + `npm run images`).

import meta from './images.generated'

/** Photo descriptor: { src, srcSm, width, height, alt } — `alt: ''` marks a decorative image. */
export const photo = (file, alt) => {
  const m = meta[file] || { w: 1600, h: 1000, smW: 800 }
  return {
    file,
    src: `/landing/${file}.webp`,
    srcSm: `/landing/${file}-sm.webp`,
    width: m.w,
    height: m.h,
    smWidth: m.smW,
    alt,
  }
}

export const routes = {
  rider: '/register/rider',
  driver: '/register/driver',
  login: '/login',
  terms: '/terms',
  privacy: '/privacy',
}

export const SUPPORT_EMAIL = 'eyinjueledumareadeyosola@gmail.com'

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------
export const navLinks = [
  { label: 'Riders', href: '#riders' },
  { label: 'Drivers', href: '#drivers' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Safety', href: '#safety' },
  { label: 'Cities', href: '#cities' },
  { label: 'FAQ', href: '#faq' },
]

// ---------------------------------------------------------------------------
// Hero carousel
// ---------------------------------------------------------------------------
export const heroSlides = [
  {
    image: photo('hero-01-passenger-backseat', 'Smiling rider relaxing in the back seat of a RideLink car on a sunny Lagos afternoon'),
    headline: 'Your ride, on your terms.',
    subhead: 'Tap, match, go. Premium rides across Lagos in under 3 minutes.',
  },
  {
    image: photo('hero-02-car-waiting-kerb', 'Cars with headlights on along a palm-lined city street at dusk'),
    headline: 'Always a car nearby.',
    subhead: '12,000+ verified drivers, online around the clock.',
  },
  {
    image: photo('hero-03-booking-phone', 'Woman smiling at her phone as she books a ride on a city street'),
    headline: 'Book in seconds.',
    subhead: 'Upfront fares in ₦. No surprises, no haggling.',
  },
  {
    image: photo('hero-04-driver-opening-door', 'Man in a blue suit opening the door of a black sedan outside an office'),
    headline: 'Door to door, safely.',
    subhead: 'Every driver verified. Every trip tracked. Share it live with anyone.',
  },
  {
    image: photo('hero-05-night-city-drive', 'Light trails of cars on a city expressway at night'),
    headline: 'The city never sleeps. Neither do we.',
    subhead: '24/7 rides, 24/7 support.',
  },
]

export const heroTrustLine = 'Rated 4.9 ★ by 50,000+ riders · Available in 6 Lagos zones'

// ---------------------------------------------------------------------------
// Booking card (hero)
// ---------------------------------------------------------------------------
export const bookingExamples = [
  { pickup: 'Lekki Phase 1', destination: 'Victoria Island', eta: 4, km: 7.8, fares: { economy: 3200, comfort: 4600, xl: 6400 } },
  { pickup: 'Ikeja GRA', destination: 'MMIA Airport', eta: 6, km: 9.4, fares: { economy: 3800, comfort: 5400, xl: 7600 } },
  { pickup: 'Yaba', destination: 'Surulere', eta: 3, km: 5.1, fares: { economy: 2100, comfort: 3000, xl: 4200 } },
]

export const rideTypes = [
  { key: 'economy', label: 'Economy', seats: 4 },
  { key: 'comfort', label: 'Comfort', seats: 4 },
  { key: 'xl', label: 'XL', seats: 6 },
]

// ---------------------------------------------------------------------------
// Trust bar — fictional Lagos companies (no real brands)
// ---------------------------------------------------------------------------
export const trustBar = {
  label: 'Trusted by teams at',
  companies: ['Kora Labs', 'Ndani Capital', 'Eko Freight', 'Adire Studio', 'Lagoon Health', 'Oja Retail'],
}

// ---------------------------------------------------------------------------
// Live ride strip (moving car)
// ---------------------------------------------------------------------------
export const liveRide = {
  eyebrow: 'Live tracking',
  headline: 'Watch your driver arrive, live.',
  body: 'From the moment your driver accepts, you see exactly where they are — no calls asking “where are you?”.',
  bullets: [
    'Live GPS on the map, updated every few seconds',
    'ETA that adjusts to Lagos traffic as it happens',
    'Share a live trip link with family or friends',
  ],
  driver: { name: 'Tunde', car: 'Toyota Corolla', plate: 'LND 482 KJ' },
  stages: ['2 min away', 'Arrived at pickup', 'On trip', 'Dropped off'],
}

// ---------------------------------------------------------------------------
// For riders
// ---------------------------------------------------------------------------
export const forRiders = {
  eyebrow: 'For riders',
  headline: 'Getting around Lagos, sorted.',
  body: 'Whether it’s the school run in Surulere or a 6 a.m. flight out of MMIA, RideLink gets you there on time.',
  image: photo('business-rider', 'Professional in a black jacket stepping into a car for a work trip'),
  notification: { title: 'Driver found', body: 'Tunde · Toyota Corolla · 3 min away' },
  benefits: [
    { icon: 'Zap', title: 'Pickup in minutes', body: 'Average pickup under 3 minutes in Lekki, VI and Ikeja.' },
    { icon: 'ShieldCheck', title: 'Verified drivers', body: 'Every driver is ID-checked, background-screened and rated after each trip.' },
    { icon: 'Wallet', title: 'Upfront ₦ fares', body: 'See the price before you book. Pay with cash, card or bank transfer.' },
    { icon: 'Headset', title: 'Support 24/7', body: 'Real people on call day and night — in English, Yoruba, Igbo or Hausa.' },
  ],
}

// ---------------------------------------------------------------------------
// How it works
// ---------------------------------------------------------------------------
export const howItWorks = {
  eyebrow: 'How it works',
  headline: 'Three taps to anywhere in Lagos.',
  steps: [
    { title: 'Set your destination', body: 'Enter where you’re going and see your fare in ₦ before you confirm.', image: photo('hero-03-booking-phone', 'Rider entering a destination on her phone') },
    { title: 'Meet your driver', body: 'We match you with the nearest verified driver. Track them to your door.', image: photo('pickup', 'Rider waiting at the pickup point on a busy street') },
    { title: 'Arrive and go', body: 'Pay in the app or in cash, rate your trip, and get on with your day.', image: photo('dropoff', 'Rider stepping out of a car at the destination') },
  ],
}

// ---------------------------------------------------------------------------
// Ride options
// ---------------------------------------------------------------------------
export const rideOptions = {
  eyebrow: 'Ride options',
  headline: 'A ride for every trip.',
  options: [
    { name: 'Economy', seats: 4, from: 1500, body: 'Everyday trips at the best price. Clean, air-conditioned cars.', image: photo('economy-hatchback', 'Compact white car on a busy city street') },
    { name: 'Comfort', seats: 4, from: 2800, body: 'Newer cars, top-rated drivers and extra legroom for longer journeys.', image: photo('comfort-interior', 'Clean leather rear seats inside a comfort car') },
    { name: 'XL', seats: 6, from: 4500, body: 'SUVs and 7-seaters for families, groups and extra luggage.', image: photo('xl-suv', 'Family with an SUV ready for a group trip') },
    { name: 'Airport', seats: 4, from: 12000, body: 'Fixed fares to and from MMIA with flight tracking and meet-and-greet.', image: photo('airport', 'Cars waiting at an airport terminal kerb') },
  ],
}

// ---------------------------------------------------------------------------
// Safety
// ---------------------------------------------------------------------------
export const safety = {
  eyebrow: 'Safety',
  headline: 'Built around your safety.',
  body: 'Safety isn’t a feature we bolt on. It shapes how every trip works, from sign-up to drop-off.',
  image: photo('safety-seatbelt', 'Passenger reaching for the seatbelt before the trip starts'),
  items: [
    'Every driver ID-verified and background-checked',
    'Share your live trip with anyone you trust',
    'In-app emergency button that alerts our safety team',
    'Support team available 24 hours a day',
    'Two-way ratings keep standards high',
  ],
  stat: { value: '100%', label: 'of drivers ID-verified' },
}

// ---------------------------------------------------------------------------
// For drivers
// ---------------------------------------------------------------------------
export const forDrivers = {
  eyebrow: 'For drivers',
  headline: 'Drive when you want. Earn every week.',
  body: 'Be your own boss. Choose your hours, get paid weekly straight to your bank account, and keep more of every fare.',
  image: photo('driver-portrait', 'Driver at the wheel with his seatbelt on, ready for the next trip'),
  secondaryImage: photo('driver-dashboard-phone', 'Phone mounted on the dashboard showing turn-by-turn navigation'),
  perks: ['Weekly payouts to any Nigerian bank', 'Low commission, no hidden fees', 'Driver support line, 24/7'],
  // Simple linear model for the earnings estimate: ₦ per online hour.
  earningsPerHour: 2600,
  hours: { min: 10, max: 60, default: 30 },
}

// ---------------------------------------------------------------------------
// City coverage
// ---------------------------------------------------------------------------
export const cities = {
  eyebrow: 'Where we operate',
  headline: 'All over Lagos.',
  body: 'From the Island to the Mainland, RideLink drivers are on the road in every major zone.',
  image: photo('lagos-skyline', ''),
  zones: ['Victoria Island', 'Ikoyi', 'Lekki', 'Ajah', 'Ikeja', 'Yaba', 'Surulere', 'Festac', 'MMIA Airport'],
  footnote: 'More zones every month.',
}

// ---------------------------------------------------------------------------
// Stats (count up on scroll)
// ---------------------------------------------------------------------------
export const stats = [
  { value: 50, suffix: 'K+', label: 'Active riders' },
  { value: 12, suffix: 'K+', label: 'Verified drivers' },
  { value: 2.1, suffix: 'M', decimals: 1, label: 'Rides completed' },
  { value: 4.9, suffix: '★', decimals: 1, label: 'Average rating' },
]

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------
export const testimonials = [
  { name: 'Adaeze O.', role: 'Product Manager, Lekki', image: photo('testimonial-01', 'Portrait of Adaeze'), quote: 'I commute from Lekki to VI every day. RideLink is the first app where the driver is actually there when it says three minutes.' },
  { name: 'Emeka N.', role: 'Driver partner, 2 yrs', image: photo('testimonial-02', 'Portrait of Emeka'), quote: 'Weekly payouts land in my account every Monday. I choose my hours around my family and still earn more than before.' },
  { name: 'Funmi A.', role: 'Nurse, LUTH', image: photo('testimonial-03', 'Portrait of Funmi'), quote: 'After a night shift, I need a ride I can trust. I share my trip with my sister every time — it gives us both peace of mind.' },
  { name: 'Ibrahim S.', role: 'Founder, Yaba', image: photo('testimonial-04', 'Portrait of Ibrahim'), quote: 'We moved our whole team’s work travel to RideLink. One monthly invoice in naira instead of a pile of receipts.' },
]

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------
export const faq = [
  { q: 'How is my fare calculated?', a: 'Fares are based on distance and estimated time, and you see the full price in ₦ before you book. There’s no haggling and no surprise surcharges at the end of the trip.' },
  { q: 'How can I pay?', a: 'Pay with cash, a debit or credit card, or a bank transfer. Card and transfer payments are confirmed in the app, and you get a receipt for every trip.' },
  { q: 'Can I cancel a ride?', a: 'Yes. Cancelling is free until a driver is on the way. After that, a small fee may apply to compensate the driver for their time.' },
  { q: 'How do you keep riders safe?', a: 'Every driver is ID-verified and background-checked, every trip is tracked by GPS, and you can share your live trip or press the in-app emergency button at any time.' },
  { q: 'What do I need to drive with RideLink?', a: 'A valid Nigerian driver’s licence, a car in good condition (2008 or newer), vehicle papers and insurance, and a smartphone. Sign up online and our team will review your documents.' },
  { q: 'Do you offer corporate accounts?', a: 'Yes. Businesses get one monthly invoice in naira, trip reports for each employee, and spending limits you control. Email us to set one up.' },
]

// ---------------------------------------------------------------------------
// Download CTA
// ---------------------------------------------------------------------------
export const downloadCta = {
  headline: 'Ready to ride?',
  body: 'Join 50,000+ Lagosians who get around with RideLink every week.',
  image: photo('lagos-night', ''),
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
export const footerColumns = [
  { title: 'Company', links: [{ label: 'About', href: '#riders' }, { label: 'Careers', href: `mailto:${SUPPORT_EMAIL}` }, { label: 'Press', href: `mailto:${SUPPORT_EMAIL}` }] },
  { title: 'Riders', links: [{ label: 'How it works', href: '#how-it-works' }, { label: 'Safety', href: '#safety' }, { label: 'Cities', href: '#cities' }, { label: 'FAQ', href: '#faq' }] },
  { title: 'Drivers', links: [{ label: 'Requirements', href: '#faq' }, { label: 'Earnings', href: '#drivers' }, { label: 'Support', href: `mailto:${SUPPORT_EMAIL}` }] },
  { title: 'Legal', links: [{ label: 'Terms of Service', to: routes.terms }, { label: 'Privacy Policy', to: routes.privacy }] },
]

export const naira = (n) => `₦${Math.round(n).toLocaleString('en-NG')}`
