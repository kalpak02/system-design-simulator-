import { type NodeProps } from '@xyflow/react'
// ICON: search "Scale" on lucide.dev — import { Scale } from 'lucide-react'
import { Scale } from 'lucide-react'
import { BaseNode, type ComponentNode } from './BaseNode'

export function LoadBalancerNode({ data, selected , isConnectable}: NodeProps<ComponentNode>) {
  return (
    <BaseNode
      icon={<Scale className="w-3.5 h-3.5" />}
      label="Load Balancer"
      color="text-blue-400"
      borderColor="border-blue-500/40"
      status={data.status ?? 'idle'}
      metrics={data.metrics}
      selected={selected}
      isConnectable={isConnectable}
    />
  )
}