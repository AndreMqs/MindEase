import MuiCard, { type CardProps as MuiCardProps } from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import type { ReactNode } from 'react'

export type CardProps = MuiCardProps & {
  title?: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
  contentSx?: any
}

export function Card({ title, subtitle, children, contentSx, ...rest }: CardProps) {
  return (
    <MuiCard {...rest}>
      {title ? <CardHeader title={title} subheader={subtitle} /> : null}
      {children ? <CardContent sx={contentSx}>{children}</CardContent> : null}
    </MuiCard>
  )
}
