import type { ReactNode } from 'react'
import { useId } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

interface FormFieldProps {
  label: string
  children?: ReactNode
}

export function FormField({ label, children }: FormFieldProps) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}

export function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string | number
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export function FormTextarea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">{label}</label>
      <Textarea id={id} value={value} rows={rows} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
