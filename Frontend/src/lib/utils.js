import * as React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function useObjectUrl(file) {
  const [url, setUrl] = React.useState('')

  React.useEffect(() => {
    if (!file) {
      setUrl('')
      return
    }

    const nextUrl = URL.createObjectURL(file)
    setUrl(nextUrl)

    return () => URL.revokeObjectURL(nextUrl)
  }, [file])

  return url
}
