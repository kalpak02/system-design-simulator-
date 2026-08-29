import { type NodeProps } from '@xyflow/react'
// ICON: search "Server" on lucide.dev — import { Server } from 'lucide-react'
import { Server } from 'lucide-react'
import { BaseNode, type ComponentNode } from './BaseNode'

export function AppServerNode({ data, selected, isConnectable }: NodeProps<ComponentNode>) {
  return (
    <BaseNode
      icon={<Server className="w-3.5 h-3.5" />}
      label="App Server"
      color="text-cyan-400"
      borderColor="border-cyan-500/40"
      status={data.status ?? 'idle'}
      metrics={data.metrics}
      selected={selected}
      isConnectable={isConnectable}
    />
  )
}