


// import React from 'react'
// import { NODE_TYPES_CONFIG } from '@/lib/nodeTypes'

// export function Sidebar() {
//   const onDragStart = (
//     e: React.DragEvent,
//     nodeType: string
//   ) => {
//     e.dataTransfer.setData('application/reactflow', nodeType)
//     e.dataTransfer.effectAllowed = 'move'
//   }

//   return (
//     <aside className="w-[200px] h-full border-r border-border bg-card flex flex-col">
//       {/* Header */}
//       <div className="p-3 border-b border-border">
//         <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
//           Components
//         </p>
//       </div>

//       {/* Node List */}
//       <div className="flex-1 overflow-y-auto p-2 space-y-1">
//         {NODE_TYPES_CONFIG.map((node) => {
//           //  Fix: Proper typing for Lucide icons
//           const Icon =
//             node.icon as React.ComponentType<{ className?: string }>

//           return (
//             <div
//               key={node.type}
//               draggable
//               onDragStart={(e) => onDragStart(e, node.type)}
//               className={`
//                 flex items-center gap-2 p-2 rounded-md border cursor-grab
//                 bg-secondary hover:bg-accent transition-colors
//                 ${node.border} active:cursor-grabbing select-none
//               `}
//             >
//               {/* Icon */}
//               <Icon className="w-4 h-4 shrink-0" />

//               {/* Text */}
//               <div className="flex flex-col min-w-0">
//                 <span className={`text-xs font-medium ${node.color}`}>
//                   {node.label}
//                 </span>
//                 <span className="text-[10px] text-muted-foreground truncate">
//                   {node.description}
//                 </span>
//               </div>
//             </div>
//           )
//         })}
//       </div>

//       {/* Footer */}
//       <div className="p-3 border-t border-border">
//         <p className="text-[10px] text-muted-foreground text-center">
//           Drag onto canvas
//         </p>
//       </div>
//     </aside>
//   )
// }
import { PALETTE } from '@/lib/nodeRegistry'

export function Sidebar() {
  const onDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('application/reactflow', nodeType)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="w-[200px] h-full border-r border-border bg-card flex flex-col">
      <div className="p-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Components
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-1 space-y-1">
        {PALETTE.map((group) => (
          <div key={group.category}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">
              {group.category}
            </p>
            <div className="space-y-1">
              {group.nodes.map((node) => (
                <div
                  key={node.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, node.type)}
                  className={`
                    flex items-center gap-2 p-2 rounded-md border cursor-grab
                    bg-secondary hover:bg-accent transition-colors
                    ${node.border} active:cursor-grabbing select-none
                  `}
                >
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-medium ${node.color}`}>
                      {node.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          Drag onto canvas
        </p>
      </div>
    </div>
  )
}