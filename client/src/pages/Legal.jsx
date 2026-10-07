import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

// Public support address shown on these pages — set it to the inbox you want users to write to.
const CONTACT_EMAIL = 'eyinjueledumareadeyosola@gmail.com'
const UPDATED = 'October 6, 2026'

function ContactLine() {
  return CONTACT_EMAIL
    ? <p>Questions or requests: <a href={'mailto:' + CONTACT_EMAIL} className="link">{CONTACT_EMAIL}</a></p>
    : <p>Questions or requests: contact the RideLink team through the Support link in the app.</p>
}

function LegalLayout({ title, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow">Last updated {UPDATED}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-ink-muted [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink [&_li]:mt-1 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-content flex-col gap-3 px-4 py-5 text-xs text-ink-subtle sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} RideLink. Precision in Motion.</p>
          <nav className="flex gap-5" aria-label="Legal">
            <Link to="/privacy" className="hover:text-ink">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-ink">Terms of Service</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

export function Privacy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>This policy explains what information RideLink collects, how we use it, and the choices you have.</p>

      <section>
        <h2>Information we collect</h2>
        <ul>
          <li><strong className="text-ink">Account details:</strong> your name, email address, phone number and password (stored only in encrypted, hashed form).</li>
          <li><strong className="text-ink">Google sign-in:</strong> if you choose “Continue with Google”, we receive your name, email address and a Google account identifier. We do not receive your Google password.</li>
          <li><strong className="text-ink">Driver details:</strong> for driver accounts, vehicle information and licence details you provide for approval.</li>
          <li><strong className="text-ink">Trip information:</strong> pickup and destination you enter, trip status, fares, and any disputes you submit.</li>
        </ul>
      </section>

      <section>
        <h2>How we use your information</h2>
        <ul>
          <li>To create and secure your account and let you sign in.</li>
          <li>To match riders with drivers and run trips.</li>
          <li>To review driver applications and resolve disputes.</li>
          <li>To send service emails, such as password reset links.</li>
        </ul>
        <p className="mt-2">We do not sell your personal information or use it for advertising.</p>
      </section>

      <section>
        <h2>Sharing</h2>
        <p>Riders and drivers on the same trip can see each other's name and phone number so they can coordinate. RideLink staff (operations managers and administrators) can see account and trip details to run the service. We use third-party providers to host the app and database and to send email; they process data only on our behalf.</p>
      </section>

      <section>
        <h2>Data retention and deletion</h2>
        <p>We keep your information while your account is active. You can ask us to delete your account and associated data at any time by emailing us.</p>
      </section>

      <section>
        <h2>Security</h2>
        <p>Passwords are hashed, connections use HTTPS, and access to account data is restricted by role. No system is perfectly secure, so please use a strong, unique password.</p>
      </section>

      <section>
        <h2>Contact</h2>
        <ContactLine />
      </section>
    </LegalLayout>
  )
}

export function Terms() {
  return (
    <LegalLayout title="Terms of Service">
      <p>By creating an account or using RideLink, you agree to these terms.</p>

      <section>
        <h2>Accounts</h2>
        <p>You must give accurate information and keep your password secure. You are responsible for activity on your account. Driver accounts must be approved by RideLink before accepting trips.</p>
      </section>

      <section>
        <h2>Using the service</h2>
        <ul>
          <li>Riders request trips; drivers choose whether to accept them.</li>
          <li>Fares shown in the app are what the rider pays for the trip.</li>
          <li>Treat other riders and drivers with respect. Harassment, fraud or unsafe behaviour may lead to suspension.</li>
        </ul>
      </section>

      <section>
        <h2>Disputes</h2>
        <p>If something goes wrong with a trip, submit a dispute in the app. Our team will review it and may adjust fares or take action on accounts.</p>
      </section>

      <section>
        <h2>Availability and liability</h2>
        <p>We work to keep RideLink available and accurate but provide it “as is”, without guarantees of uninterrupted service. To the extent allowed by law, RideLink is not liable for indirect losses arising from use of the service.</p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>We may update these terms. We'll change the date above when we do; continuing to use RideLink means you accept the updated terms.</p>
      </section>

      <section>
        <h2>Contact</h2>
        <ContactLine />
      </section>
    </LegalLayout>
  )
}
