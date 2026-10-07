export default function SectionHeading({ eyebrow, title, body, align = 'left', className = '' }) {
  const center = align === 'center'
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} max-w-2xl ${className}`}>
      {eyebrow && <p className="eyebrow mb-3 text-accent-text">{eyebrow}</p>}
      <h2 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2.25rem]">{title}</h2>
      {body && <p className="mt-3 text-base leading-relaxed text-ink-muted">{body}</p>}
    </div>
  )
}
