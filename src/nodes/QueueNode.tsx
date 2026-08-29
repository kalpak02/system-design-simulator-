import { type NodeProps } from '@xyflow/react'
// ICON: search "ListOrdered" on lucide.dev — import { ListOrdered } from 'lucide-react'
import { ListOrdered } from 'lucide-react'
import { BaseNode, type ComponentNode } from './BaseNode'

export function QueueNode({ data, selected, isConnectable }: NodeProps<ComponentNode>) {
  return (
    <BaseNode
      icon={<ListOrdered className="w-3.5 h-3.5" />}
      label="Queue"
      color="text-orange-400"
      borderColor="border-orange-500/40"
      status={data.status ?? 'idle'}
      metrics={data.metrics }
      selected={selected}
      isConnectable={isConnectable}
    />
  )
}