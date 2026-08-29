import { type NodeProps } from '@xyflow/react'
// ICON: search "Skull" on lucide.dev — import { Skull } from 'lucide-react'
import { Skull } from 'lucide-react'
import { BaseNode, type ComponentNode } from './BaseNode'

export function DDoSNode({ data, selected, isConnectable }: NodeProps<ComponentNode>) {
  return (
    <BaseNode
      icon={<Skull className="w-3.5 h-3.5" />}
      label="DDoS Source"
      color="text-red-400"
      borderColor="border-red-500/40"
      status={data.status ?? 'idle'}
      metrics={data.metrics}
      selected={selected}
      isConnectable={isConnectable}
    />
  )
}