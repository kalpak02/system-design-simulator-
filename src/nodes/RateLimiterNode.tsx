import { type NodeProps } from '@xyflow/react'
// ICON: search "Gauge" on lucide.dev — import { Gauge } from 'lucide-react'
import { Gauge } from 'lucide-react'
import { BaseNode, type ComponentNode } from './BaseNode'

export function RateLimiterNode({ data, selected, isConnectable }: NodeProps<ComponentNode>) {
  return (
    <BaseNode
      icon={<Gauge className="w-3.5 h-3.5" />}
      label="Rate Limiter"
      color="text-lime-400"
      borderColor="border-lime-500/40"
      status={data.status ?? 'idle'}
      metrics={data.metrics }
      selected={selected}
      isConnectable={isConnectable}
    />
  )
}