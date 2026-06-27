import * as React from 'react'
import { cn } from '@/lib/utils'

type Option = { value: string; label: string }

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  as?: 'input' | 'textarea' | 'select'
  options?: Option[]
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea'
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  as: 'select'
  options?: Option[]
}

type CombinedProps = InputProps | TextareaProps | SelectProps;

export function Input({ as = 'input', className, options, ...props }: CombinedProps) {
  const base = 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'

  if (as === 'textarea') {
    const textareaProps = props as React.TextareaHTMLAttributes<HTMLTextAreaElement>
    return (
      <textarea
        className={cn(base, 'min-h-[100px]', className)}
        {...textareaProps}
      />
    )
  }

  if (as === 'select') {
    const selectProps = props as React.SelectHTMLAttributes<HTMLSelectElement>
    return (
      <select className={cn(base, className)} {...selectProps}>
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }

  return <input className={cn(base, className)} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
}

export default Input