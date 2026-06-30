import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      {title && (
        <h2 className="mb-4 text-lg font-semibold text-slate-800">{title}</h2>
      )}
      {children}
    </section>
  )
}
