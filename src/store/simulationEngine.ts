import { useSimStore } from './useSimStore'
import type { AppNode } from './types'
import type { Edge } from '@xyflow/react'
import type { NodeMetrics, NodeStatus } from '@/nodes/BaseNode'

// ── Real-world latency baselines (ms) ───────────────────
export const BASE_LATENCY: Record<string, number> = {
  loadBalancer:    1.5,
  apiGateway:      10,
  appServer:       30,
  cache:           0.5,
  database:        20,
  queue:           3,
  cdn:             2,
  externalAPI:     150,
  internetGateway: 1,
  natGateway:      2,
  rateLimiter:     1,
  firewall:        1,
  aiNode:          800,
  ddos:            0,
}

// ── Real-world throughput caps (rps) ─────────────────────
export const BASE_CAPACITY: Record<string, number> = {
  loadBalancer:    100_000,
  apiGateway:      50_000,
  appServer:       5_000,
  cache:           100_000,
  database:        10_000,
  queue:           500_000,
  cdn:             1_000_000,
  externalAPI:     500,
  internetGateway: 1_000_000,
  natGateway:      100_000,
  rateLimiter:     50_000,
  firewall:        200_000,
  aiNode:          50,
  ddos:            0,
}

// ── Step 1: Build adjacency + in-degree map ──────────────
function buildGraph(nodes: AppNode[], edges: Edge[]) {
  // in-degree = how many incoming edges a node has
  const inDegree: Record<string, number> = {}
  // neighbours = which nodes does this node point TO
  const neighbours: Record<string, string[]> = {}
  // upstream = which nodes feed INTO this node
  const upstream: Record<string, string[]> = {}

  for (const node of nodes) {
    inDegree[node.id] = 0
    neighbours[node.id] = []
    upstream[node.id] = []
  }

  for (const edge of edges) {
    if (!neighbours[edge.source]) neighbours[edge.source] = []
    if (!upstream[edge.target]) upstream[edge.target] = []

    neighbours[edge.source].push(edge.target)
    upstream[edge.target].push(edge.source)
    inDegree[edge.target] = (inDegree[edge.target] ?? 0) + 1
  }

  return { inDegree, neighbours, upstream }
}

// ── Step 2: Kahn's topological sort ──────────────────────
function topologicalSort(
  nodes: AppNode[],
  inDegree: Record<string, number>,
  neighbours: Record<string, string[]>
): AppNode[] {
  // start with all nodes that have no incoming edges
  const queue: string[] = nodes
    .filter((n) => inDegree[n.id] === 0)
    .map((n) => n.id)

  const sorted: string[] = []
  const degCopy = { ...inDegree }

  while (queue.length > 0) {
    const id = queue.shift()!
    sorted.push(id)

    for (const neighbourId of neighbours[id] ?? []) {
      degCopy[neighbourId]--
      if (degCopy[neighbourId] === 0) {
        queue.push(neighbourId)
      }
    }
  }

  // map sorted ids back to nodes
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]))
  return sorted.map((id) => nodeMap[id]).filter(Boolean)
}

// ── Step 3: Compute metrics for one node ─────────────────
function computeNodeMetrics(
  node: AppNode,
  upstreamNodes: AppNode[],
  computedMetrics: Record<string, NodeMetrics>,
  chaos: ReturnType<typeof useSimStore.getState>['chaosFlags'],
  defense: ReturnType<typeof useSimStore.getState>['defenseFlags'],
  baseRps: number
): { metrics: NodeMetrics; status: NodeStatus } {
  const nodeType = node.type ?? 'appServer'
  const baseLatency = BASE_LATENCY[nodeType] ?? 20
  const capacity = node.data?.config?.capacity ?? BASE_CAPACITY[nodeType] ?? 5000

  // gather upstream metrics
  const upstreamMetrics = upstreamNodes
    .map((n) => computedMetrics[n.id])
    .filter(Boolean)

  // calculate incoming RPS from upstream or base
  let incomingRps = upstreamMetrics.length > 0
    ? upstreamMetrics.reduce((sum, m) => sum + m.rps, 0)
    : baseRps

  // ── Apply chaos ────────────────────────────────────────
  if (chaos.trafficSpike) incomingRps *= 10
  if (chaos.ddos)         incomingRps *= 100
  if (chaos.botTraffic)   incomingRps *= 3

  // defense: rate limiter caps RPS
  if (defense.rateLimiter && nodeType === 'rateLimiter') {
    incomingRps = Math.min(incomingRps, 10_000)
  }

  // saturation ratio — how loaded is this node
  const saturation = Math.min(incomingRps / capacity, 2)

  // ── Latency formula ────────────────────────────────────
  // base + upstream sum + saturation penalty + jitter
  const upstreamLatency = upstreamMetrics.length > 0
    ? Math.max(...upstreamMetrics.map((m) => m.latency))
    : 0

  let latency = baseLatency + upstreamLatency
  // saturation penalty — exponential above 80% load
  if (saturation > 0.8) latency *= 1 + (saturation - 0.8) * 5
  // chaos latency injection
  if (chaos.latencyInjection) latency += 200
  // add jitter ±10%
  latency *= 0.9 + Math.random() * 0.2
  latency = Math.round(latency * 10) / 10

  // ── Error rate formula ─────────────────────────────────
  let errorRate = 0
  if (saturation > 1)   errorRate = (saturation - 1) * 0.5
  if (saturation > 1.5) errorRate = 0.8
  if (chaos.networkPartition) errorRate = Math.max(errorRate, 0.8)
  if (chaos.regionFailure)    errorRate = 1
  if (chaos.dbCrash && nodeType === 'database') errorRate = 1

  // circuit breaker stops sending to dead nodes
  if (defense.circuitBreaker && errorRate > 0.5) {
    incomingRps = 0
    errorRate = 0
  }

  errorRate = Math.min(errorRate, 1)
  errorRate = Math.round(errorRate * 1000) / 1000

  // ── Cache hit rate ─────────────────────────────────────
  let hitRate: number | undefined
  if (nodeType === 'cache') {
    hitRate = chaos.cacheMiss || chaos.botTraffic ? 0.05 : 0.85
    // reduce latency on cache hit
    latency = hitRate > 0.5
      ? baseLatency * hitRate + (baseLatency * 40) * (1 - hitRate)
      : baseLatency * 40
  }

  // ── CPU formula ────────────────────────────────────────
  const cpu = Math.min(saturation * 60 + Math.random() * 10, 100)

  // ── Memory formula ─────────────────────────────────────
  const memory = Math.min(saturation * 50 + 20 + Math.random() * 5, 100)

  // ── p95 / p99 tail latency ─────────────────────────────
  const p95 = Math.round(latency * 2.5 * 10) / 10
  const p99 = Math.round(latency * 4.0 * 10) / 10

  // ── Queue depth ────────────────────────────────────────
  const queueDepth = nodeType === 'queue'
    ? Math.round(Math.max(0, incomingRps - capacity) * 0.1)
    : 0

  // ── Apdex score ────────────────────────────────────────
  // satisfied < 500ms, tolerating < 2000ms, frustrated >= 2000ms
  const apdex = latency < 500
    ? 1 - errorRate * 0.3
    : latency < 2000
    ? 0.5 - errorRate * 0.3
    : 0.1

  // ── Availability ───────────────────────────────────────
  const availability = errorRate > 0.5 ? 0 : (1 - errorRate) * 100

  // ── Status ────────────────────────────────────────────
  let status: NodeStatus = 'healthy'
  if (errorRate >= 1 || (chaos.regionFailure)) status = 'dead'
  else if (errorRate > 0.1 || saturation > 0.8 || cpu > 80) status = 'degraded'

  const metrics: NodeMetrics = {
    latency,
    rps: Math.round(Math.min(incomingRps, capacity)),
    errorRate,
    cpu: Math.round(cpu),
    memory: Math.round(memory),
    p95,
    p99,
    queueDepth,
    apdex: Math.round(apdex * 100) / 100,
    availability: Math.round(availability * 10) / 10,
    ...(hitRate !== undefined ? { hitRate } : {}),
  }

  return { metrics, status }
}

// ── Step 4: Main tick function ────────────────────────────
export function runTick() {
  const store = useSimStore.getState()
  const { nodes, edges, chaosFlags, defenseFlags } = store

  if (nodes.length === 0) return

  // base RPS — how much traffic enters the system
  let baseRps = 1000
  if (chaosFlags.trafficSpike) baseRps *= 10
  if (chaosFlags.ddos)         baseRps *= 100

  // build graph structure
  const { inDegree, neighbours, upstream } = buildGraph(nodes, edges)

  // get nodes in correct topological order
  const sortedNodes = topologicalSort(nodes, inDegree, neighbours)

  // compute metrics in topological order
  const computedMetrics: Record<string, NodeMetrics> = {}

  for (const node of sortedNodes) {
    const upstreamIds = upstream[node.id] ?? []
    const upstreamNodes = upstreamIds
      .map((id) => nodes.find((n) => n.id === id))
      .filter((n): n is AppNode => n !== undefined)

    const { metrics, status } = computeNodeMetrics(
      node,
      upstreamNodes,
      computedMetrics,
      chaosFlags,
      defenseFlags,
      baseRps
    )

    computedMetrics[node.id] = metrics

    // write to store
    store.updateNodeMetrics(node.id, metrics, status)
  }

  // ── Compute global snapshot for charts ────────────────
  const allMetrics = Object.values(computedMetrics)
  if (allMetrics.length === 0) return

  const avg = (arr: number[]) =>
    arr.reduce((a, b) => a + b, 0) / arr.length

  store.pushMetricSnapshot({
    timestamp: Date.now(),
    avgLatency:      avg(allMetrics.map((m) => m.latency)),
    totalRps:        allMetrics.reduce((s, m) => s + m.rps, 0),
    avgErrorRate:    avg(allMetrics.map((m) => m.errorRate)),
    avgCacheHitRate: avg(allMetrics.filter((m) => m.hitRate !== undefined).map((m) => m.hitRate!)),
    avgCpu:          avg(allMetrics.map((m) => m.cpu ?? 0)),
    avgApdex:        avg(allMetrics.map((m) => m.apdex ?? 1)),
    availability:    avg(allMetrics.map((m) => m.availability ?? 100)),
  })
}