import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-navy-900 text-gray-900 dark:text-white">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-brand-blue font-bold text-xl">RideLink</span>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 dark:text-white/60">
            <a href="#features" className="hover:text-brand-blue transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-brand-blue transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-brand-blue transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login" className="text-sm text-gray-600 dark:text-white/70 hover:text-brand-blue transition-colors">
              Sign In
            </Link>
            <Link to="/register/rider" className="bg-brand-blue hover:bg-brand-blue-hover text-white text-sm px-4 py-2 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/20 rounded-full px-4 py-1.5 text-brand-blue text-xs font-medium mb-6">
              ● Premium Ride Experience
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your Ride,{' '}
              <span className="text-brand-blue">Your Way</span>
            </h1>
            <p className="text-gray-500 dark:text-white/50 text-lg mb-8 max-w-lg">
              Experience the future of urban mobility. Premium rides engineered for comfort, safety, and speed. Every trip, on your terms.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link to="/register/rider"
                className="bg-brand-blue hover:bg-brand-blue-hover text-white px-8 py-3.5 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-brand-blue/25">
                Start Riding Now
              </Link>
              <Link to="/register/driver"
                className="border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white/70 hover:border-brand-blue hover:text-brand-blue px-8 py-3.5 rounded-xl font-medium transition-all">
                Join as Driver
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">50K+</p>
                <p className="text-xs text-gray-500 dark:text-white/40">Active Riders</p>
              </div>
              <div className="w-px h-10 bg-gray-200 dark:bg-white/10"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12K+</p>
                <p className="text-xs text-gray-500 dark:text-white/40">Expert Drivers</p>
              </div>
              <div className="w-px h-10 bg-gray-200 dark:bg-white/10"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">4.9★</p>
                <p className="text-xs text-gray-500 dark:text-white/40">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Hero Card */}
          <div className="flex-1 w-full max-w-md">
            <div className="bg-gray-50 dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Book a Ride</span>
                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">● Available Now</span>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 bg-white dark:bg-navy-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-white/5">
                  <div className="w-2 h-2 rounded-full bg-brand-blue"></div>
                  <span className="text-sm text-gray-500 dark:text-white/40">Current Location</span>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-navy-700 rounded-xl px-4 py-3 border border-gray-200 dark:border-white/5">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <span className="text-sm text-gray-500 dark:text-white/40">Enter Destination</span>
                </div>
              </div>
              <button className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white py-3 rounded-xl font-medium transition-all">
                Find a Ride
              </button>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-white/40">ETA</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">3 mins</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-white/40">Distance</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">2.4 mi</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-white/40">Est. Fare</p>
                  <p className="text-sm font-semibold text-brand-blue">$12.50</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-50 dark:bg-navy-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Engineered for Excellence</h2>
            <p className="text-gray-500 dark:text-white/40 max-w-xl mx-auto">
              Built from the ground up for riders who value their time, safety, and comfort above all else.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '⚡', title: 'Fast Pickup', desc: 'Average pickup time under 3 minutes in premium zones.' },
              { icon: '🛡️', title: 'Safe Rides', desc: 'All drivers verified with background checks and ratings.' },
              { icon: '💳', title: 'Easy Payment', desc: 'Seamless billing with corporate and personal accounts.' },
              { icon: '🕐', title: '24/7 Support', desc: 'Round the clock assistance for riders and drivers.' },
            ].map((f) => (
              <div key={f.title}
                className="bg-white dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5 hover:border-brand-blue/30 transition-all hover:shadow-lg group">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Seamless in Three Steps</h2>
            <p className="text-gray-500 dark:text-white/40">Getting around has never been this simple.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Select Destination', desc: 'Enter your pickup location and destination. Our system finds the best route instantly.' },
              { num: '02', title: 'Real-time Matching', desc: 'We match you with the nearest available premium driver within seconds.' },
              { num: '03', title: 'Enjoy the Journey', desc: 'Sit back and relax. Track your ride live and arrive at your destination safely.' },
            ].map((step) => (
              <div key={step.num} className="relative bg-gray-50 dark:bg-navy-800 rounded-2xl p-8 border border-gray-200 dark:border-white/5">
                <span className="text-5xl font-bold text-gray-100 dark:text-white/5 absolute top-6 right-6">{step.num}</span>
                <span className="text-brand-blue font-bold text-lg mb-4 block">{step.num}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-3">{step.title}</h3>
                <p className="text-gray-500 dark:text-white/40 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-gray-50 dark:bg-navy-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">What Our Elite Riders Say</h2>
            <p className="text-gray-500 dark:text-white/40">Join millions of professionals who rely on RideLink every day.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'James Cooling', role: 'Executive', text: 'The most professional ride service I have ever used. Always on time, always clean, always perfect.' },
              { name: 'Sarah Chen', role: 'Consultant', text: 'RideLink has completely changed how I commute. The drivers are courteous and the app is flawless.' },
              { name: 'Marcus Thomas', role: 'Entrepreneur', text: 'Reliable, fast, and premium. Exactly what a busy professional needs. Highly recommended.' },
            ].map((t) => (
              <div key={t.name} className="bg-white dark:bg-navy-800 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                <div className="flex text-yellow-400 text-sm mb-4">★★★★★</div>
                <p className="text-gray-600 dark:text-white/60 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center text-white text-sm font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-brand-blue rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Ride in Style?</h2>
            <p className="text-white/70 mb-8">Join thousands of professionals who trust RideLink for their daily commute.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register/rider"
                className="bg-white text-brand-blue hover:bg-gray-100 px-8 py-3.5 rounded-xl font-semibold transition-all">
                Get Started Free
              </Link>
              <Link to="/register/driver"
                className="border border-white/30 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl font-medium transition-all">
                Become a Driver
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-brand-blue font-bold text-lg">RideLink</span>
          <p className="text-xs text-gray-500 dark:text-white/30">© 2024 RideLink. Precision in Motion.</p>
          <div className="flex gap-6 text-xs text-gray-500 dark:text-white/30">
            <a href="#" className="hover:text-brand-blue transition-colors">Support</a>
            <a href="#" className="hover:text-brand-blue transition-colors">Safety</a>
            <a href="#" className="hover:text-brand-blue transition-colors">Legal</a>
            <a href="#" className="hover:text-brand-blue transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

    </div>
  )
}