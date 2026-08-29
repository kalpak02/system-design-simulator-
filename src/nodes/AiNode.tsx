import { type NodeProps } from '@xyflow/react'
// ICON: search "Bot" on lucide.dev — import { Bot } from 'lucide-react'
import { Bot } from 'lucide-react'
import { BaseNode, type ComponentNode } from './BaseNode'

export function AINode({ data, selected, isConnectable }: NodeProps<ComponentNode>) {
  return (
    <BaseNode
      icon={<Bot className="w-3.5 h-3.5" />}
      label="AI Service"
      color="text-pink-400"
      borderColor="border-pink-500/40"
      status={(data.status ) ?? 'idle'}
      metrics={data.metrics}
      selected={selected}
      isConnectable={isConnectable}
    />
  )
}