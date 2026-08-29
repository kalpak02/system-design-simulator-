import { type NodeProps } from '@xyflow/react'
// ICON: search "ShieldCheck" on lucide.dev — import { ShieldCheck } from 'lucide-react'
import { ShieldCheck } from 'lucide-react'
import { BaseNode, type ComponentNode } from './BaseNode'

export function FirewallNode({ data, selected, isConnectable }: NodeProps<ComponentNode>) {
  return (
    <BaseNode
      icon={<ShieldCheck className="w-3.5 h-3.5" />}
      label="Firewall"
      color="text-emerald-400"
      borderColor="border-emerald-500/40"
      status={data.status ?? 'idle'}
      metrics={data.metrics}
      selected={selected}
      isConnectable={isConnectable}
    />
  )
}