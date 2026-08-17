import * as React from 'react'

interface FormFieldProps {
  label: string
  children: React.ReactNode
  required?: boolean
}

export function FormField({ label, children, required }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-danger-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
