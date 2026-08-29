import { type NodeProps } from '@xyflow/react'
// ICON: search "Database" on lucide.dev — import { Database } from 'lucide-react'
import { Database } from 'lucide-react'
import { BaseNode, type ComponentNode } from './BaseNode'

export function DatabaseNode({ data, selected, isConnectable }: NodeProps<ComponentNode>) {
  return (
    <BaseNode
      icon={<Database className="w-3.5 h-3.5" />}
      label="Database"
      color="text-green-400"
      borderColor="border-green-500/40"
      status={data.status ?? 'idle'}
      metrics={data.metrics }
      selected={selected}
      isConnectable={isConnectable}
    />
  )
}