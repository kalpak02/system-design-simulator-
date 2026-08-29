import { type NodeProps } from '@xyflow/react'
// ICON: search "Network" on lucide.dev — import { Network } from 'lucide-react'
import { Network } from 'lucide-react'
import { BaseNode, type ComponentNode } from './BaseNode'

export function InternetGatewayNode({ data, selected, isConnectable }: NodeProps<ComponentNode>) {
  return (
    <BaseNode
      icon={<Network className="w-3.5 h-3.5" />}
      label="Internet Gateway"
      color="text-sky-400"
      borderColor="border-sky-500/40"
      status={data.status ?? 'idle'}
      metrics={data.metrics}
      selected={selected}
      isConnectable={isConnectable}
    />
  )
}