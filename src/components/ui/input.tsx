import * as React from 'react'
import { cn } from '@/lib/utils'

type Option = { value: string; label: string }

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  as?: 'input' | 'textarea' | 'select'
  options?: Option[]
}

export function Input({ as = 'input', className, options, ...props }: InputProps) {
  const base = 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'

  if (as === 'textarea') {
    return <textarea className={cn(base, className)} {...(props as any)} />
  }

  if (as === 'select') {
    return (
      <select className={cn(base, className)} {...(props as any)}>
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }

  return <input className={cn(base, className)} {...props} />
}

export default Input
