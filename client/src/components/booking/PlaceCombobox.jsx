import { useState, useMemo, useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import { findPlace, matchPlaces } from './placeSearch'

/**
 * Text input with a dropdown of known places (ARIA 1.2 combobox + listbox).
 * The parent owns the text; a place counts as chosen when the text matches one exactly.
 */
export default function PlaceCombobox({
  id, label, placeholder, value, onChange, onChoose, places, marker, inputRef, inputClassName = '',
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const listRef = useRef(null)

  const matches = useMemo(() => matchPlaces(places, value, value.trim() ? 8 : places.length), [places, value])
  const chosen = useMemo(() => findPlace(places, value), [places, value])
  const listId = `${id}-listbox`
  const optionId = (i) => `${id}-option-${i}`
  const showList = open && places.length > 0
  const activeIndex = showList && active < matches.length ? active : -1

  // Keep the highlighted option visible while moving with the arrow keys
  useEffect(() => {
    if (activeIndex < 0) return
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const choose = (place) => {
    onChange(place.name)
    setOpen(false)
    setActive(-1)
    onChoose?.(place)
  }

  const handleKeyDown = (e) => {
    const count = matches.length
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) { setOpen(true); setActive(0); return }
        if (count) setActive(i => (i + 1) % count)
        return
      case 'ArrowUp':
        e.preventDefault()
        if (!open) { setOpen(true); setActive(count - 1); return }
        if (count) setActive(i => (i <= 0 ? count - 1 : i - 1))
        return
      case 'Enter':
        if (!showList) return
        if (activeIndex >= 0) { e.preventDefault(); choose(matches[activeIndex].place); return }
        // Enter picks the best (top) match, which also turns an alias like "vi" into the full place name
        if (count >= 1 && value.trim()) { e.preventDefault(); choose(matches[0].place) }
        return
      case 'Escape':
        if (open) { e.preventDefault(); setOpen(false); setActive(-1) }
        return
      default:
    }
  }

  return (
    <div className="relative">
      {marker}
      <label htmlFor={id} className="sr-only">{label}</label>
      <input
        id={id}
        ref={inputRef}
        type="text"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
        placeholder={placeholder}
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); setActive(-1) }}
        onFocus={() => { if (!chosen) setOpen(true) }}
        onClick={() => { if (!open) { setOpen(true); setActive(-1) } }}
        onBlur={() => { setOpen(false); setActive(-1) }}
        onKeyDown={handleKeyDown}
        className={`input pl-10 ${inputClassName}`}
      />

      <div
        className={`absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-line bg-surface shadow-overlay ${showList ? '' : 'hidden'}`}
      >
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="max-h-64 overflow-y-auto overscroll-contain py-1"
        >
          {matches.map(({ place, alias }, i) => {
            const isChosen = chosen?.name === place.name
            return (
              <li
                key={place.name}
                id={optionId(i)}
                role="option"
                aria-selected={i === activeIndex}
                // Keep focus in the input so blur doesn't close the list before the click lands
                onMouseDown={e => e.preventDefault()}
                onClick={() => choose(place)}
                onMouseMove={() => { if (active !== i) setActive(i) }}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${i === activeIndex ? 'bg-accent-soft text-ink' : 'text-ink'}`}
              >
                <span className="min-w-0 flex-1 truncate">
                  <span className={isChosen ? 'font-medium' : ''}>{place.name}</span>
                  {alias && <span className="ml-1.5 text-xs text-ink-subtle">“{alias}”</span>}
                </span>
                <span className="shrink-0 text-2xs text-ink-subtle">{place.area}</span>
                {isChosen && <Check className="h-3.5 w-3.5 shrink-0 text-accent-text" aria-hidden="true" />}
              </li>
            )
          })}
        </ul>
        {matches.length === 0 && (
          <p className="px-3 py-2.5 text-xs text-ink-muted">
            No Lagos area matches “{value.trim()}”.
          </p>
        )}
      </div>
    </div>
  )
}
