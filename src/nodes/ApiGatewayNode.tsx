import { type NodeProps } from '@xyflow/react'
// ICON: search "DoorOpen" on lucide.dev — import { DoorOpen } from 'lucide-react'
import { DoorOpen } from 'lucide-react'
import { BaseNode, type ComponentNode } from './BaseNode'

export function APIGatewayNode({ data, selected , isConnectable}: NodeProps<ComponentNode>) {
  return (
    <BaseNode
      icon={<DoorOpen className="w-3.5 h-3.5" />}
      label="API Gateway"
      color="text-purple-400"
      borderColor="border-purple-500/40"
      status={data.status  ?? 'idle'}
      metrics={data.metrics }
      selected={selected} 
      isConnectable={isConnectable}
    />
  )
}