import { useInView } from './useInView'

/**
 * Fades children up once they scroll into view. `delay` (ms) staggers siblings.
 * With reduced motion the content is simply shown.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, inView] = useInView()
  return (
    <Tag
      ref={ref}
      className={`${inView ? 'motion-safe:animate-fade-up' : 'motion-safe:opacity-0'} ${className}`}
      style={inView && delay ? { animationDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}
