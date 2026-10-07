import { MapPin } from 'lucide-react'
import Photo from './Photo'
import Reveal from './Reveal'
import { cities } from './landingContent'

/** Lagos photo as a muted full-bleed background with zone chips over it (same look in both themes). */
export default function CityCoverage() {
  return (
    <section id="cities" className="relative isolate scroll-mt-20 overflow-hidden bg-[#06080d] py-24 text-white sm:py-32">
      <Photo
        image={cities.image}
        sizes="100vw"
        className="absolute inset-0 -z-10 h-full w-full object-cover [object-position:50%_45%]"
      />
      <div className="absolute inset-0 -z-10 bg-[#06080d]/70" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#06080d]/70 via-transparent to-[#06080d]/40" aria-hidden="true" />

      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow mb-3 text-[#9db4ff]">{cities.eyebrow}</p>
          <h2 className="text-[2rem] font-semibold leading-tight tracking-tight sm:text-[2.75rem]">{cities.headline}</h2>
          <p className="mt-3 text-base leading-relaxed text-white/80 sm:text-lg">{cities.body}</p>
        </Reveal>

        <ul className="mt-10 flex max-w-3xl flex-wrap gap-2.5">
          {cities.zones.map((z, i) => (
            <Reveal
              as="li"
              key={z}
              delay={i * 50}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-md"
            >
              <MapPin className="h-3.5 w-3.5 text-[#9db4ff]" strokeWidth={2} />
              {z}
            </Reveal>
          ))}
        </ul>
        <p className="mt-6 flex items-center gap-2 text-sm text-white/70">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success/60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          {cities.footnote}
        </p>
      </div>
    </section>
  )
}
