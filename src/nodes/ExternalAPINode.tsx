import { type NodeProps } from '@xyflow/react'
// ICON: search "Plug" on lucide.dev — import { Plug } from 'lucide-react'
import { Plug } from 'lucide-react'
import { BaseNode, type ComponentNode } from './BaseNode'

export function ExternalAPINode({ data, selected, isConnectable }: NodeProps<ComponentNode>) {
  return (
    <BaseNode
      icon={<Plug className="w-3.5 h-3.5" />}
      label="External API"
      color="text-indigo-400"
      borderColor="border-indigo-500/40"
      status={data.status ?? 'idle'}
      metrics={data.metrics}
      selected={selected}
      isConnectable={isConnectable}
    />
  )
}