import { type NodeProps } from '@xyflow/react'
// ICON: search "Globe" on lucide.dev — import { Globe } from 'lucide-react'
import { Globe } from 'lucide-react'
import { BaseNode, type ComponentNode } from './BaseNode'

export function CDNNode({ data, selected, isConnectable }: NodeProps<ComponentNode>) {
  return (
    <BaseNode
      icon={<Globe className="w-3.5 h-3.5" />}
      label="CDN"
      color="text-teal-400"
      borderColor="border-teal-500/40"
      status={data.status ?? 'idle'}
      metrics={data.metrics }
      selected={selected}
      isConnectable={isConnectable}
    />
  )
}