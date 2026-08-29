import { Handle, Position, type Node } from '@xyflow/react'
import { type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

export type NodeStatus = 'healthy' | 'degraded' | 'dead' | 'idle'

export interface NodeMetrics {
  latency: number
  rps: number
  errorRate: number
  hitRate?: number
  cpu?: number
  memory?: number
  p95?: number
  p99?: number
  queueDepth?: number
  availability?: number
  apdex?: number
}

import type { NodeConfig } from '@/store/types'

export interface ComponentNodeData extends Record<string, unknown> {
  label?: string
  status?: NodeStatus
  metrics?: NodeMetrics
  config?: NodeConfig
}

export type ComponentNode = Node<ComponentNodeData>

export interface BaseNodeProps {
  icon: ReactNode
  label: string
  color: string
  borderColor: string
  status: NodeStatus
  metrics?: NodeMetrics
  selected?: boolean
  isConnectable?: boolean
}

const statusConfig: Record<NodeStatus, { label: string; className: string }> = {
  idle:     { label: 'Idle',     className: 'bg-muted text-muted-foreground' },
  healthy:  { label: 'Healthy',  className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  degraded: { label: 'Degraded', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  dead:     { label: 'Dead',     className: 'bg-red-500/20 text-red-400 border-red-500/30' },
}

// inline style for both handles — no CSS conflicts
const handleStyle: React.CSSProperties = {
  width: 12,
  height: 12,
  background: 'oklch(0.70 0.18 265)',
  border: '2px solid oklch(0.13 0.02 265)',
  borderRadius: '50%',
  cursor: 'crosshair',
  zIndex: 10,
}

export function BaseNode({
  icon,
  label,
  color,
  borderColor,
  status,
  metrics,
  selected,
  isConnectable = true,
}: BaseNodeProps) {
  const s = statusConfig[status]

  return (
    <div
      className={`
        w-[180px] rounded-lg border bg-card p-3 shadow-lg
        transition-all duration-200 ${borderColor}
        ${selected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
      `}
    >
      {/* INPUT — top center */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ ...handleStyle, top: -6, left: '50%', transform: 'translateX(-50%)' }}
      />

      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-1.5 ${color}`}>
          {icon}
          <span className="text-xs font-semibold">{label}</span>
        </div>
        <Badge className={`text-[9px] px-1.5 py-0 h-4 border ${s.className}`}>
          {s.label}
        </Badge>
      </div>

      <div className="h-px bg-border mb-2" />

      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        <div>
          <p className="text-[9px] text-muted-foreground">Latency</p>
          <p className="text-xs font-medium text-foreground">
            {metrics ? `${metrics.latency}ms` : '—'}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground">RPS</p>
          <p className="text-xs font-medium text-foreground">
            {metrics ? metrics.rps : '—'}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground">Errors</p>
          <p className={`text-xs font-medium ${
            metrics && metrics.errorRate > 0.05 ? 'text-red-400' : 'text-foreground'
          }`}>
            {metrics ? `${(metrics.errorRate * 100).toFixed(1)}%` : '—'}
          </p>
        </div>
        {metrics?.hitRate !== undefined && (
          <div>
            <p className="text-[9px] text-muted-foreground">Hit Rate</p>
            <p className="text-xs font-medium text-green-400">
              {`${(metrics.hitRate * 100).toFixed(0)}%`}
            </p>
          </div>
        )}
        {metrics?.cpu !== undefined && (
          <div>
            <p className="text-[9px] text-muted-foreground">CPU</p>
            <p className={`text-xs font-medium ${
              metrics.cpu > 80 ? 'text-red-400' : 'text-foreground'
            }`}>
              {`${metrics.cpu.toFixed(0)}%`}
            </p>
          </div>
        )}
        {metrics?.apdex !== undefined && (
          <div>
            <p className="text-[9px] text-muted-foreground">Apdex</p>
            <p className={`text-xs font-medium ${
              metrics.apdex < 0.7 ? 'text-red-400' : 'text-green-400'
            }`}>
              {metrics.apdex.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* OUTPUT — bottom center */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ ...handleStyle, bottom: -6, left: '50%', transform: 'translateX(-50%)' }}
      />
    </div>
  )
}