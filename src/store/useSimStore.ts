import { runTick } from './simulationEngine'
import { create } from 'zustand'
import type { Edge } from '@xyflow/react'
import type { NodeMetrics, NodeStatus } from '@/nodes/BaseNode'
import type {
  AppNode,
  MetricSnapshot,
  ChaosFlags,
  DefenseFlags,
  Hint,
  NodeConfig,
} from './types'

// ── Store shape ──────────────────────────────────────────
interface SimStore {
  // Canvas state
  nodes: AppNode[]
  edges: Edge[]
  setNodes: (nodes: AppNode[]) => void
  setEdges: (edges: Edge[]) => void

  // Selection state
  selectedNodeId: string | null
  setSelectedNodeId: (id: string | null) => void
  updateNodeConfig: (id: string, config: Partial<NodeConfig>) => void

  // Simulation state
  simRunning: boolean
  tickCount: number
  tickInterval: ReturnType<typeof setInterval> | null

  // Metrics history — Recharts reads this array
  metricsHistory: MetricSnapshot[]

  // Chaos flags
  chaosFlags: ChaosFlags
  setChaos: (flag: keyof ChaosFlags, value: boolean) => void
  resetChaos: () => void

  // Defense flags
  defenseFlags: DefenseFlags
  setDefense: (flag: keyof DefenseFlags, value: boolean) => void

  // Topology hints
  hints: Hint[]
  setHints: (hints: Hint[]) => void

  // Simulation actions
  startSim: () => void
  stopSim: () => void
  resetSim: () => void

  // Node metric updater — called by engine each tick
  updateNodeMetrics: (
    id: string,
    metrics: NodeMetrics,
    status: NodeStatus
  ) => void

  // Append one snapshot to history
  pushMetricSnapshot: (snapshot: MetricSnapshot) => void
}

// ── Default chaos flags ──────────────────────────────────
const defaultChaos: ChaosFlags = {
  trafficSpike:     false,
  cacheMiss:        false,
  dbCrash:          false,
  networkPartition: false,
  ddos:             false,
  botTraffic:       false,
  regionFailure:    false,
  latencyInjection: false,
}

// ── Default defense flags ────────────────────────────────
const defaultDefense: DefenseFlags = {
  rateLimiter:    false,
  circuitBreaker: false,
  autoScaling:    false,
}

// ── Store ────────────────────────────────────────────────
export const useSimStore = create<SimStore>((set, get) => ({

  // Canvas
  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  // Selection
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  updateNodeConfig: (id, config) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...node.data.config,
                  ...config,
                },
              },
            }
          : node
      ),
    })),

  // Simulation
  simRunning: false,
  tickCount: 0,
  tickInterval: null,

  // History — keep last 60 snapshots (30 seconds at 500ms ticks)
  metricsHistory: [],

  // Chaos
  chaosFlags: { ...defaultChaos },
  setChaos: (flag, value) =>
    set((state) => ({
      chaosFlags: { ...state.chaosFlags, [flag]: value },
    })),
  resetChaos: () => set({ chaosFlags: { ...defaultChaos } }),

  // Defense
  defenseFlags: { ...defaultDefense },
  setDefense: (flag, value) =>
    set((state) => ({
      defenseFlags: { ...state.defenseFlags, [flag]: value },
    })),

  // Hints
  hints: [],
  setHints: (hints) => set({ hints }),

  // Start simulation
  startSim: () => {
  const existing = get().tickInterval
  if (existing) clearInterval(existing)

  const interval = setInterval(() => {
    runTick()
  }, 500)

  set({ simRunning: true, tickInterval: interval })
},

  // Stop simulation
  stopSim: () => {
    const interval = get().tickInterval
    if (interval) clearInterval(interval)
    set({ simRunning: false, tickInterval: null })
  },

  // Reset everything back to blank slate
  resetSim: () => {
    const interval = get().tickInterval
    if (interval) clearInterval(interval)
    set({
      simRunning: false,
      tickInterval: null,
      tickCount: 0,
      metricsHistory: [],
      chaosFlags: { ...defaultChaos },
      defenseFlags: { ...defaultDefense },
      hints: [],
      // nodes and edges kept — user keeps their diagram
    })
  },

  // Called by engine each tick to update one node
  updateNodeMetrics: (id, metrics, status) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, metrics, status } }
          : node
      ),
    })),

  // Append snapshot, keep max 60
  pushMetricSnapshot: (snapshot) =>
    set((state) => ({
      metricsHistory: [
        ...state.metricsHistory.slice(-59),
        snapshot,
      ],
      tickCount: state.tickCount + 1,
    })),
}))