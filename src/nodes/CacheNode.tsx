// import { type NodeProps } from '@xyflow/react'
// // ICON: search "Zap" on lucide.dev — import { Zap } from 'lucide-react'
// import { Zap } from 'lucide-react'
// import { BaseNode, type NodeStatus } from './BaseNode'
// import { ComponentNodeData } from './BaseNode'

// export function CacheNode({ data, selected }: NodeProps<ComponentNodeData>) {
//   return (
//     <BaseNode
//       icon={<Zap className="w-3.5 h-3.5" />}
//       label="Cache"
//       color="text-yellow-400"
//       borderColor="border-yellow-500/40"
//       status={data.status ?? 'idle'}
//       metrics={data.metrics}
//       selected={selected}
//     />
//   )
// }

import { type NodeProps } from '@xyflow/react'
import { Zap } from 'lucide-react'
import { BaseNode, type ComponentNode } from './BaseNode'

export function CacheNode({ data, selected, isConnectable }: NodeProps<ComponentNode>) {
  return (
    <BaseNode
      icon={<Zap className="w-3.5 h-3.5" />}
      label="Cache"
      color="text-yellow-400"
      borderColor="border-yellow-500/40"
      status={data.status ?? 'idle'}
      metrics={data.metrics}
      selected={selected}
       isConnectable={isConnectable}
    />
  )
}