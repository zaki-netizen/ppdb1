import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode
  description?: React.ReactNode
}

export function Card({ className, title, description, children, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-white rounded-xl shadow-2xl p-6', className)}
      {...props}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card
