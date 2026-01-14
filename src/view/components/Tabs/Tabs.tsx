import MuiTabs, { type TabsProps as MuiTabsProps } from '@mui/material/Tabs'
import MuiTab, { type TabProps as MuiTabProps } from '@mui/material/Tab'

export type TabsProps = MuiTabsProps
export type TabProps = MuiTabProps

export function Tabs(props: TabsProps) {
  return <MuiTabs {...props} />
}
export function Tab(props: TabProps) {
  return <MuiTab {...props} />
}
