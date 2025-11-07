import { useEffect, useRef, useState } from 'react'

export function useInView<T extends HTMLElement>(
  options?: IntersectionObserverInit
) {
  const targetRef = useRef<T | null>(null)
  const [isInView, setIsInView] = useState(false)
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    const element = targetRef.current
    if (!element || isInView) return

    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          obs.disconnect()
        }
      })
    }, optionsRef.current)

    observer.observe(element)

    return () => observer.disconnect()
  }, [isInView])

  return { ref: targetRef, isInView }
}
