import { useSimStore } from '@/store/useSimStore'
import { BASE_LATENCY, BASE_CAPACITY } from '@/store/simulationEngine'
import {
  BarChart2,
  Info,
  Activity,
  Shield,
  Settings,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { ChaosPanel } from './ChaosPanel'

// ── Trade-off database for component types ──────────────
const COMPONENT_TRADEOFFS: Record<
  string,
  {
    title: string
    pros: string[]
    cons: string[]
    law: string
  }
> = {
  cache: {
    title: 'In-Memory Caching',
    pros: ['Sub-millisecond read latency (<1ms)', 'Shields database from read overload', 'High throughput capability'],
    cons: ['Cache invalidation complexity', 'Stale data risk during high writes', 'Volatile in-memory cost'],
    law: 'Cache-Aside / Write-Through Pattern',
  },
  loadBalancer: {
    title: 'Load Balancing',
    pros: ['Even traffic distribution', 'Health checking & failover', 'Horizontal scaling enabler'],
    cons: ['Additional network hop (~1.5ms)', 'Requires sticky sessions for stateful backends', 'Potential single ingress point'],
    law: 'Layer 7 vs Layer 4 Routing',
  },
  database: {
    title: 'Primary Database',
    pros: ['ACID transaction guarantees', 'Persistent reliable storage', 'Complex relational queries'],
    cons: ['I/O bound under peak write load', 'Replication lag on read replicas', 'Harder to scale horizontally'],
    law: 'CAP Theorem (CP vs AP)',
  },
  queue: {
    title: 'Message Queue / PubSub',
    pros: ['Decouples producer & consumer rates', 'Absorbs massive traffic spikes', 'Guaranteed at-least-once delivery'],
    cons: ['Eventual consistency lag', 'Message ordering & replay complexity', 'Queue depth monitoring needed'],
    law: "Little's Law (L = λW)",
  },
  rateLimiter: {
    title: 'Rate Limiter',
    pros: ['Prevents cascading saturation', 'Protects from DDoS & bot traffic', 'Enforces multi-tenant SLA fairness'],
    cons: ['Drops or delays legitimate bursts', 'Requires distributed counter state', 'Additional latency check (~1ms)'],
    law: 'Token Bucket / Leaky Bucket Algorithm',
  },
  aiNode: {
    title: 'AI / LLM Inference Engine',
    pros: ['Advanced reasoning & unstructured parsing', 'Context-aware dynamic outputs', 'Autonomous decision making'],
    cons: ['High compute latency (~800ms+)', 'High GPU cost & token rate limits', 'Non-deterministic error bounds'],
    law: 'Amdahl’s Law in Neural Computation',
  },
  apiGateway: {
    title: 'API Gateway',
    pros: ['Centralized auth & SSL termination', 'Request routing & rate limiting', 'Protocol translation'],
    cons: ['Central point of latency addition (~10ms)', 'Configuration complexity', 'SPOF if not clustered'],
    law: 'BFF (Backend for Frontend) Pattern',
  },
  appServer: {
    title: 'Application Server Cluster',
    pros: ['Stateless business logic execution', 'Horizontal elasticity via auto-scaling', 'Rapid deployment cycles'],
    cons: ['Memory footprint per concurrent thread', 'CPU bottlenecks on complex compute', 'Cold start overhead'],
    law: 'Universal Scalability Law',
  },
}

export function MetricsPanel() {
  const simRunning = useSimStore((s) => s.simRunning)
  const history = useSimStore((s) => s.metricsHistory)
  const nodes = useSimStore((s) => s.nodes)
  const edges = useSimStore((s) => s.edges)
  const selectedNodeId = useSimStore((s) => s.selectedNodeId)
  const updateNodeConfig = useSimStore((s) => s.updateNodeConfig)

  const currentSnapshot = history[history.length - 1]
  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  // Chart data format
  const chartData = history.map((h, i) => ({
    name: `${i * 0.5}s`,
    latency: Math.round(h.avgLatency * 10) / 10,
    rps: Math.round(h.totalRps),
    errorRate: Math.round(h.avgErrorRate * 1000) / 10,
    cpu: Math.round(h.avgCpu),
  }))

  // ── Capacity Bottleneck Analysis ────────────────────────
  const nodeCapacities = nodes.map((node) => {
    const nodeType = node.type ?? 'appServer'
    const capacity = node.data?.config?.capacity ?? BASE_CAPACITY[nodeType] ?? 5000
    const currentRps = node.data?.metrics?.rps ?? 0
    const saturation = capacity > 0 ? (currentRps / capacity) * 100 : 0
    return {
      id: node.id,
      label: (node.data?.label as string) || nodeType,
      type: nodeType,
      capacity,
      currentRps,
      saturation: Math.min(saturation, 200),
      status: node.data?.status ?? 'idle',
      cpu: node.data?.metrics?.cpu ?? 0,
      latency: node.data?.metrics?.latency ?? BASE_LATENCY[nodeType] ?? 20,
    }
  })

  const bottleneckNode = [...nodeCapacities].sort((a, b) => b.saturation - a.saturation)[0]

  // ── Architecture Scoring (100-Point Rubric) ──────────────
  const hasNodes = nodes.length > 0
  const avgLatency = currentSnapshot?.avgLatency ?? 0
  const avgErrorRate = currentSnapshot?.avgErrorRate ?? 0
  const avgCpu = currentSnapshot?.avgCpu ?? 0
  const nodeTypesSet = new Set(nodes.map((n) => n.type))

  // 1. Availability Score (0-25)
  const availabilityScore = hasNodes
    ? Math.max(0, Math.round(25 - avgErrorRate * 25))
    : 0

  // 2. Latency SLA Score (0-25)
  let latencyScore = 0
  if (hasNodes) {
    if (avgLatency <= 25) latencyScore = 25
    else if (avgLatency <= 60) latencyScore = 22
    else if (avgLatency <= 150) latencyScore = 18
    else if (avgLatency <= 350) latencyScore = 12
    else latencyScore = 5
  }

  // 3. Fault Tolerance & Redundancy Score (0-25)
  let faultToleranceScore = 0
  if (hasNodes) {
    let pts = 10
    if (nodeTypesSet.has('rateLimiter')) pts += 5
    if (nodeTypesSet.has('cache')) pts += 5
    if (nodeTypesSet.has('loadBalancer')) pts += 5
    faultToleranceScore = Math.min(pts, 25)
  }

  // 4. Scalability & Headroom Score (0-25)
  let scalabilityScore = 0
  if (hasNodes) {
    let pts = 15
    if (nodeTypesSet.has('queue')) pts += 5
    if (avgCpu < 70) pts += 5
    else if (avgCpu > 90) pts -= 5
    scalabilityScore = Math.max(0, Math.min(pts, 25))
  }

  const totalScore = availabilityScore + latencyScore + faultToleranceScore + scalabilityScore

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-emerald-400', label: 'Production Ready' }
    if (score >= 75) return { grade: 'A', color: 'text-green-400', label: 'Solid Architecture' }
    if (score >= 60) return { grade: 'B', color: 'text-yellow-400', label: 'Good / Needs Optimization' }
    if (score >= 40) return { grade: 'C', color: 'text-orange-400', label: 'High Saturation Risk' }
    return { grade: 'D', color: 'text-red-400', label: 'Critical Bottlenecks' }
  }

  const scoreGrade = getScoreGrade(totalScore)

  return (
    <aside className="w-[340px] h-full border-l border-border bg-card flex flex-col overflow-hidden select-none">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold tracking-wide text-foreground">System Monitor</p>
        </div>
        <div className="flex items-center gap-2">
          {simRunning ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-[10px] py-0 h-5 animate-pulse">
              LIVE
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px] py-0 h-5">
              IDLE
            </Badge>
          )}
          {hasNodes && (
            <span className="text-[10px] font-mono text-muted-foreground">
              {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'}
            </span>
          )}
        </div>
      </div>

      {/* ── 5-Tab Navigation ──────────────────────────────── */}
      <Tabs defaultValue="metrics" className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="px-2 pt-2 shrink-0">
          <TabsList className="w-full grid grid-cols-5 h-9 bg-muted/40 p-1">
            <TabsTrigger value="props" className="text-[10px] data-[state=active]:bg-background flex items-center justify-center gap-1" title="Inspector / Props">
              <Settings className="w-3.5 h-3.5" />
            </TabsTrigger>
            <TabsTrigger value="metrics" className="text-[10px] data-[state=active]:bg-background flex items-center justify-center gap-1" title="Live Metrics">
              <Activity className="w-3.5 h-3.5" />
            </TabsTrigger>
            <TabsTrigger value="capacity" className="text-[10px] data-[state=active]:bg-background flex items-center justify-center gap-1" title="Capacity Planning">
              <Scale className="w-3.5 h-3.5" />
            </TabsTrigger>
            <TabsTrigger value="score" className="text-[10px] data-[state=active]:bg-background flex items-center justify-center gap-1" title="Architecture Score">
              <Shield className="w-3.5 h-3.5" />
            </TabsTrigger>
            <TabsTrigger value="tradeoffs" className="text-[10px] data-[state=active]:bg-background flex items-center justify-center gap-1" title="Trade-offs & Theory">
              <Info className="w-3.5 h-3.5" />
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── TAB 1: PROPS (Node Inspector) ───────────────── */}
        <TabsContent value="props" className="flex-1 overflow-y-auto m-0 p-3 flex flex-col gap-3">
          {selectedNode ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-secondary/40">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">
                    {(selectedNode.data?.label as string) || selectedNode.type}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{selectedNode.id}</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] capitalize ${
                    selectedNode.data?.status === 'healthy'
                      ? 'text-green-400 border-green-500/30 bg-green-500/10'
                      : selectedNode.data?.status === 'degraded'
                      ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
                      : selectedNode.data?.status === 'dead'
                      ? 'text-red-400 border-red-500/30 bg-red-500/10'
                      : 'text-muted-foreground'
                  }`}
                >
                  {selectedNode.data?.status ?? 'idle'}
                </Badge>
              </div>

              {/* Node Properties */}
              <div className="rounded-lg border border-border bg-secondary/20 p-2.5 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Component Baseline
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Base Latency</span>
                    <span className="font-mono font-medium">{BASE_LATENCY[selectedNode.type ?? 'appServer'] ?? 20} ms</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Base Capacity</span>
                    <span className="font-mono font-medium">
                      {(BASE_CAPACITY[selectedNode.type ?? 'appServer'] ?? 5000).toLocaleString()} RPS
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Node Metrics */}
              {selectedNode.data?.metrics && (
                <div className="rounded-lg border border-border bg-secondary/20 p-2.5 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Runtime Metrics
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <div className="bg-background/50 p-1.5 rounded border border-border/50">
                      <span className="text-[9px] text-muted-foreground block font-sans">Latency</span>
                      <span className="font-semibold text-foreground">{selectedNode.data.metrics.latency}ms</span>
                    </div>
                    <div className="bg-background/50 p-1.5 rounded border border-border/50">
                      <span className="text-[9px] text-muted-foreground block font-sans">RPS</span>
                      <span className="font-semibold text-foreground">{selectedNode.data.metrics.rps}</span>
                    </div>
                    <div className="bg-background/50 p-1.5 rounded border border-border/50">
                      <span className="text-[9px] text-muted-foreground block font-sans">Errors</span>
                      <span className={`font-semibold ${selectedNode.data.metrics.errorRate > 0.05 ? 'text-red-400' : 'text-foreground'}`}>
                        {(selectedNode.data.metrics.errorRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-background/50 p-1.5 rounded border border-border/50">
                      <span className="text-[9px] text-muted-foreground block font-sans">CPU</span>
                      <span className="font-semibold text-foreground">{selectedNode.data.metrics.cpu}%</span>
                    </div>
                    <div className="bg-background/50 p-1.5 rounded border border-border/50">
                      <span className="text-[9px] text-muted-foreground block font-sans">Memory</span>
                      <span className="font-semibold text-foreground">{selectedNode.data.metrics.memory}%</span>
                    </div>
                    <div className="bg-background/50 p-1.5 rounded border border-border/50">
                      <span className="text-[9px] text-muted-foreground block font-sans">Apdex</span>
                      <span className={`font-semibold ${selectedNode.data.metrics.apdex && selectedNode.data.metrics.apdex < 0.7 ? 'text-red-400' : 'text-green-400'}`}>
                        {selectedNode.data.metrics.apdex?.toFixed(2) ?? '1.00'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Capacity Slider Control */}
              <div className="rounded-lg border border-border bg-secondary/20 p-2.5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Capacity Limit</label>
                  <span className="text-xs font-mono font-semibold text-primary">
                    {(
                      selectedNode.data?.config?.capacity ??
                      BASE_CAPACITY[selectedNode.type ?? 'appServer'] ??
                      5000
                    ).toLocaleString()}{' '}
                    RPS
                  </span>
                </div>
                <Slider
                  min={100}
                  max={200000}
                  step={500}
                  value={[
                    selectedNode.data?.config?.capacity ??
                      BASE_CAPACITY[selectedNode.type ?? 'appServer'] ??
                      5000,
                  ]}
                  onValueChange={(val) => {
                    updateNodeConfig(selectedNode.id, { capacity: val[0] })
                  }}
                  className="w-full"
                />
                <span className="text-[9px] text-muted-foreground block">
                  Tune max throughput before queue saturation and degradation occur.
                </span>
              </div>

              {/* Topology Connections */}
              <div className="rounded-lg border border-border bg-secondary/20 p-2.5 text-xs space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Connections</p>
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>Upstream Sources:</span>
                  <span className="font-mono text-foreground">{edges.filter((e) => e.target === selectedNode.id).length}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>Downstream Targets:</span>
                  <span className="font-mono text-foreground">{edges.filter((e) => e.source === selectedNode.id).length}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground gap-2">
              <Settings className="w-8 h-8 opacity-40 text-primary" />
              <p className="text-xs font-medium text-foreground">No Node Selected</p>
              <p className="text-[11px] leading-relaxed">
                Click any component card on the canvas to inspect its runtime metrics, baseline latency, and tune capacity parameters.
              </p>
            </div>
          )}
        </TabsContent>

        {/* ── TAB 2: METRICS (Live KPIs & Recharts) ────────── */}
        <TabsContent value="metrics" className="flex-1 overflow-y-auto m-0 p-3 flex flex-col gap-3">
          {/* Live KPI Tiles */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-secondary/40 p-2.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Avg Latency</span>
              <p className="text-lg font-mono font-semibold text-foreground">
                {currentSnapshot?.avgLatency !== undefined ? `${Math.round(currentSnapshot.avgLatency * 10) / 10}ms` : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 p-2.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Throughput</span>
              <p className="text-lg font-mono font-semibold text-foreground">
                {currentSnapshot?.totalRps !== undefined ? `${Math.round(currentSnapshot.totalRps).toLocaleString()}/s` : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 p-2.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Error Rate</span>
              <p
                className={`text-lg font-mono font-semibold ${
                  currentSnapshot && currentSnapshot.avgErrorRate > 0.05 ? 'text-red-400' : 'text-foreground'
                }`}
              >
                {currentSnapshot?.avgErrorRate !== undefined
                  ? `${(currentSnapshot.avgErrorRate * 100).toFixed(1)}%`
                  : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 p-2.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Avg CPU</span>
              <p
                className={`text-lg font-mono font-semibold ${
                  currentSnapshot && currentSnapshot.avgCpu > 80 ? 'text-red-400' : 'text-foreground'
                }`}
              >
                {currentSnapshot?.avgCpu !== undefined ? `${Math.round(currentSnapshot.avgCpu)}%` : '—'}
              </p>
            </div>
          </div>

          {/* Secondary Stats Strip */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded border border-border/60 bg-secondary/20 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Apdex:</span>
              <span className={currentSnapshot && currentSnapshot.avgApdex < 0.7 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                {currentSnapshot?.avgApdex?.toFixed(2) ?? '1.00'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Availability:</span>
              <span className="text-foreground font-bold">
                {currentSnapshot?.availability !== undefined ? `${currentSnapshot.availability.toFixed(1)}%` : '100%'}
              </span>
            </div>
          </div>

          {/* Live Dual-Axis Line Chart */}
          <div className="flex-1 min-h-[190px] border border-border rounded-lg bg-secondary/20 p-2 flex flex-col">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Telemetry History
              </span>
              <div className="flex items-center gap-3 text-[9px] font-mono">
                <span className="flex items-center gap-1 text-[oklch(0.70_0.18_265)]">
                  <span className="w-2 h-2 rounded-full bg-[oklch(0.70_0.18_265)]" /> Latency
                </span>
                <span className="flex items-center gap-1 text-[oklch(0.7_0.1_180)]">
                  <span className="w-2 h-2 rounded-full bg-[oklch(0.7_0.1_180)]" /> RPS
                </span>
              </div>
            </div>

            <div className="flex-1 w-full min-h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis
                    yAxisId="left"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={9}
                    tickFormatter={(v) => `${v}ms`}
                    domain={[0, 'auto']}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={9}
                    tickFormatter={(v) => `${v}`}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.14 0.02 265)',
                      border: '1px solid oklch(0.25 0.05 265)',
                      borderRadius: '6px',
                      fontSize: '11px',
                      padding: '6px 10px',
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="latency"
                    name="Latency (ms)"
                    stroke="oklch(0.70 0.18 265)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rps"
                    name="Throughput (RPS)"
                    stroke="oklch(0.7 0.1 180)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 3: CAPACITY (Bottleneck Detection) ───────── */}
        <TabsContent value="capacity" className="flex-1 overflow-y-auto m-0 p-3 flex flex-col gap-3">
          {/* Bottleneck Callout */}
          {bottleneckNode && hasNodes ? (
            <div
              className={`p-3 rounded-lg border flex flex-col gap-1.5 ${
                bottleneckNode.saturation > 85
                  ? 'border-red-500/40 bg-red-500/10'
                  : bottleneckNode.saturation > 60
                  ? 'border-yellow-500/40 bg-yellow-500/10'
                  : 'border-green-500/40 bg-green-500/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 ${
                    bottleneckNode.saturation > 85
                      ? 'text-red-400'
                      : bottleneckNode.saturation > 60
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  }`}
                />
                <span className="text-xs font-semibold text-foreground">
                  {bottleneckNode.saturation > 85
                    ? 'Critical System Bottleneck'
                    : bottleneckNode.saturation > 60
                    ? 'Capacity Warning'
                    : 'System Operating Normally'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                <strong className="text-foreground font-mono">{bottleneckNode.label}</strong> is at{' '}
                <span className="font-semibold text-foreground">{bottleneckNode.saturation.toFixed(0)}%</span> capacity (
                {bottleneckNode.currentRps.toLocaleString()} / {bottleneckNode.capacity.toLocaleString()} RPS).
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-border bg-secondary/30 text-center text-muted-foreground text-xs">
              Add components to analyze topology capacity.
            </div>
          )}

          {/* Node Capacity List */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Node Saturation Breakdown
            </span>
            {nodeCapacities.map((item) => (
              <div key={item.id} className="p-2.5 rounded-lg border border-border bg-secondary/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {item.currentRps.toLocaleString()} / {item.capacity.toLocaleString()} RPS
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.saturation > 85
                        ? 'bg-red-500'
                        : item.saturation > 60
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(item.saturation, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Load: {item.saturation.toFixed(0)}%</span>
                  <span>Latency: {item.latency}ms</span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── TAB 4: SCORE (100-Point Rubric) ──────────────── */}
        <TabsContent value="score" className="flex-1 overflow-y-auto m-0 p-3 flex flex-col gap-3">
          {/* Big Score Card */}
          <div className="p-4 rounded-lg border border-border bg-secondary/30 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Architecture Health
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-foreground">{totalScore}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
              <span className={`text-xs font-medium mt-0.5 ${scoreGrade.color}`}>{scoreGrade.label}</span>
            </div>
            <div className={`text-3xl font-black font-mono px-3 py-1 rounded border bg-background/50 ${scoreGrade.color}`}>
              {scoreGrade.grade}
            </div>
          </div>

          {/* 4 Pillars */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Pillar Evaluation
            </span>

            <div className="p-2 rounded border border-border bg-secondary/20 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Availability & Reliability</span>
                <span className="font-mono font-semibold">{availabilityScore} / 25</span>
              </div>
              <div className="w-full h-1 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(availabilityScore / 25) * 100}%` }} />
              </div>
            </div>

            <div className="p-2 rounded border border-border bg-secondary/20 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Latency & Performance SLA</span>
                <span className="font-mono font-semibold">{latencyScore} / 25</span>
              </div>
              <div className="w-full h-1 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(latencyScore / 25) * 100}%` }} />
              </div>
            </div>

            <div className="p-2 rounded border border-border bg-secondary/20 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Fault Tolerance & Redundancy</span>
                <span className="font-mono font-semibold">{faultToleranceScore} / 25</span>
              </div>
              <div className="w-full h-1 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(faultToleranceScore / 25) * 100}%` }} />
              </div>
            </div>

            <div className="p-2 rounded border border-border bg-secondary/20 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Scalability & Headroom</span>
                <span className="font-mono font-semibold">{scalabilityScore} / 25</span>
              </div>
              <div className="w-full h-1 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(scalabilityScore / 25) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Recommendations
            </span>
            {!nodeTypesSet.has('rateLimiter') && (
              <div className="flex items-start gap-2 p-2 rounded border border-border bg-secondary/10 text-[11px] text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>Add a <strong>Rate Limiter</strong> to protect services against sudden traffic spikes.</span>
              </div>
            )}
            {!nodeTypesSet.has('cache') && (
              <div className="flex items-start gap-2 p-2 rounded border border-border bg-secondary/10 text-[11px] text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>Introduce an in-memory <strong>Cache</strong> before your database to slash read latency.</span>
              </div>
            )}
            {!nodeTypesSet.has('loadBalancer') && (
              <div className="flex items-start gap-2 p-2 rounded border border-border bg-secondary/10 text-[11px] text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>Add a <strong>Load Balancer</strong> at ingress to distribute load across backend replicas.</span>
              </div>
            )}
            {nodeTypesSet.has('rateLimiter') && nodeTypesSet.has('cache') && nodeTypesSet.has('loadBalancer') && (
              <div className="flex items-center gap-2 p-2 rounded border border-green-500/30 bg-green-500/10 text-[11px] text-green-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Resilient topology with caching, rate limiting, and balancing in place.</span>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── TAB 5: TRADEOFFS (Contextual Distributed Systems Cards) */}
        <TabsContent value="tradeoffs" className="flex-1 overflow-y-auto m-0 p-3 flex flex-col gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Architectural Trade-offs
          </span>

          {hasNodes ? (
            Array.from(nodeTypesSet).map((type) => {
              const info = COMPONENT_TRADEOFFS[type]
              if (!info) return null
              return (
                <div key={type} className="p-3 rounded-lg border border-border bg-secondary/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{info.title}</span>
                    <Badge variant="outline" className="text-[9px] py-0 font-mono">
                      {info.law}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="text-emerald-400 font-medium flex items-center gap-1">
                      <span>✓ Advantages:</span>
                    </div>
                    <ul className="list-disc list-inside text-muted-foreground space-y-0.5 pl-1">
                      {info.pros.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>

                    <div className="text-orange-400 font-medium flex items-center gap-1 pt-1">
                      <span>✗ Trade-offs:</span>
                    </div>
                    <ul className="list-disc list-inside text-muted-foreground space-y-0.5 pl-1">
                      {info.cons.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center p-6 text-xs text-muted-foreground">
              Add components to the whiteboard to view architectural trade-off comparisons.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Chaos & Defense (Always visible & independently scrollable) ─ */}
      <div className="overflow-y-auto shrink-0 max-h-[42%] border-t border-border">
        <ChaosPanel />
      </div>
    </aside>
  )
}