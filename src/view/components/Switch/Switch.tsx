import FormControlLabel from '@mui/material/FormControlLabel'
import MuiSwitch, { type SwitchProps as MuiSwitchProps } from '@mui/material/Switch'

export type SwitchProps = MuiSwitchProps & { label: string }

export function Switch({ label, ...rest }: SwitchProps) {
  return <FormControlLabel control={<MuiSwitch {...rest} />} label={label} />
}
