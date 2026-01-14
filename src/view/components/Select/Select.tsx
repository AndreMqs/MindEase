import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MuiSelect, { type SelectProps as MuiSelectProps } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import type { ReactNode } from 'react'

export type SelectOption<T extends string = string> = { value: T; label: ReactNode }
export type SelectProps<T extends string = string> = Omit<MuiSelectProps<T>, 'onChange' | 'value'> & {
  label: string
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
}

export function Select<T extends string = string>({ label, value, options, onChange, ...rest }: SelectProps<T>) {
  const id = rest.id ?? `me-select-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <FormControl fullWidth size="small">
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <MuiSelect
        labelId={`${id}-label`}
        id={id}
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value as T)}
        {...rest}
      >
        {options.map((o) => (
          <MenuItem key={String(o.value)} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  )
}
