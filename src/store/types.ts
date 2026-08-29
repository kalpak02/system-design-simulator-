// //import type { Edge } from '@xyflow/react'
// import type { ComponentNodeData, NodeMetrics, NodeStatus } from '@/nodes/BaseNode'
// import type { Node } from '@xyflow/react'


import type { Node } from '@xyflow/react'
import type { ComponentNodeData } from '@/nodes/BaseNode'

// ── Node type alias ──────────────────────────────────────
export type AppNode = Node<ComponentNodeData>

// ── Metric snapshot stored per tick ─────────────────────
export interface MetricSnapshot {
  timestamp: number
  avgLatency: number
  totalRps: number
  avgErrorRate: number
  avgCacheHitRate: number
  avgCpu: number
  avgApdex: number
  availability: number
}

// ── Chaos flags ──────────────────────────────────────────
export interface ChaosFlags {
  trafficSpike: boolean       // 10× normal RPS
  cacheMiss: boolean          // cache hit rate → 0
  dbCrash: boolean            // DB node goes dead
  networkPartition: boolean   // edges drop 80% of traffic
  ddos: boolean               // 100× traffic flood
  botTraffic: boolean         // fake requests pollute cache
  regionFailure: boolean      // all nodes go dead at once
  latencyInjection: boolean   // +200ms on every edge
}

// ── Defense flags ────────────────────────────────────────
export interface DefenseFlags {
  rateLimiter: boolean        // cap inbound RPS
  circuitBreaker: boolean     // stop sending to dead nodes
  autoScaling: boolean        // spawn extra app server on high CPU
}

// ── Per-node config (user adjustable) ───────────────────
export interface NodeConfig {
  capacity: number            // max RPS this node handles
  cacheSize: number           // MB — cache nodes only
  replicationFactor: number   // DB nodes only
}

// ── Hint message ─────────────────────────────────────────
export interface Hint {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
}