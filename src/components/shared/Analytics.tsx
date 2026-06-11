import { useEffect } from 'react'

const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined

export function Analytics() {
  useEffect(() => {
    if (!domain || document.getElementById('plausible-script')) return

    const script = document.createElement('script')
    script.id = 'plausible-script'
    script.defer = true
    script.dataset.domain = domain
    script.src = 'https://plausible.io/js/script.js'
    document.head.appendChild(script)
  }, [])

  return null
}
