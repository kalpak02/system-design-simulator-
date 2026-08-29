import { type NodeProps } from '@xyflow/react'
// ICON: search "ArrowLeftRight" on lucide.dev — import { ArrowLeftRight } from 'lucide-react'
import { ArrowLeftRight } from 'lucide-react'
import { BaseNode, type ComponentNode } from './BaseNode'

export function NATGatewayNode({ data, selected, isConnectable }: NodeProps<ComponentNode>) {
  return (
    <BaseNode
      icon={<ArrowLeftRight className="w-3.5 h-3.5" />}
      label="NAT Gateway"
      color="text-violet-400"
      borderColor="border-violet-500/40"
      status={data.status ?? 'idle'}
      metrics={data.metrics}
      selected={selected}
      isConnectable={isConnectable}
    />
  )
}