import { useSimStore } from '@/store/useSimStore'
import { Switch } from '@/components/ui/switch'
import type { ChaosFlags, DefenseFlags } from '@/store/types'
import {
  Flame,
  Zap,
  DatabaseZap,
  Wifi,
  Shield,
  Bot,
  Globe,
  Timer,
  ShieldCheck,
  GitBranch,
  ScalingIcon,
} from 'lucide-react' // ICON: search each name on lucide.dev to verify

// ── Chaos flag descriptors ───────────────────────────────
interface FlagDescriptor<T extends string> {
  key: T
  label: string
  description: string
  icon: React.ReactNode
  color: string
}

const CHAOS_FLAGS: FlagDescriptor<keyof ChaosFlags>[] = [
  {
    key: 'trafficSpike',
    label: 'Traffic Spike',
    description: '10× normal RPS',
    icon: <Zap className="w-3.5 h-3.5" />,
    color: 'text-yellow-400',
  },
  {
    key: 'ddos',
    label: 'DDoS Attack',
    description: '100× traffic flood',
    icon: <Flame className="w-3.5 h-3.5" />,
    color: 'text-red-400',
  },
  {
    key: 'cacheMiss',
    label: 'Cache Miss Storm',
    description: 'Hit rate → 5%',
    icon: <DatabaseZap className="w-3.5 h-3.5" />,
    color: 'text-orange-400',
  },
  {
    key: 'dbCrash',
    label: 'DB Crash',
    description: 'Database goes dead',
    icon: <DatabaseZap className="w-3.5 h-3.5" />,
    color: 'text-red-500',
  },
  {
    key: 'networkPartition',
    label: 'Network Partition',
    description: '80% traffic drop',
    icon: <Wifi className="w-3.5 h-3.5" />,
    color: 'text-violet-400',
  },
  {
    key: 'botTraffic',
    label: 'Bot Traffic',
    description: '3× fake requests',
    icon: <Bot className="w-3.5 h-3.5" />,
    color: 'text-amber-400',
  },
  {
    key: 'regionFailure',
    label: 'Region Failure',
    description: 'All nodes go dead',
    icon: <Globe className="w-3.5 h-3.5" />,
    color: 'text-red-600',
  },
  {
    key: 'latencyInjection',
    label: 'Latency Injection',
    description: '+200ms on every hop',
    icon: <Timer className="w-3.5 h-3.5" />,
    color: 'text-cyan-400',
  },
]

const DEFENSE_FLAGS: FlagDescriptor<keyof DefenseFlags>[] = [
  {
    key: 'rateLimiter',
    label: 'Rate Limiter',
    description: 'Cap RPS at 10K',
    icon: <Shield className="w-3.5 h-3.5" />,
    color: 'text-emerald-400',
  },
  {
    key: 'circuitBreaker',
    label: 'Circuit Breaker',
    description: 'Stop sending to dead nodes',
    icon: <GitBranch className="w-3.5 h-3.5" />,
    color: 'text-blue-400',
  },
  {
    key: 'autoScaling',
    label: 'Auto Scaling',
    description: 'Scale on high CPU',
    icon: <ScalingIcon className="w-3.5 h-3.5" />,
    color: 'text-green-400',
  },
]

// ── Single toggle row ────────────────────────────────────
function FlagToggle<T extends string>({
  flag,
  checked,
  onToggle,
}: {
  flag: FlagDescriptor<T>
  checked: boolean
  onToggle: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-1 rounded hover:bg-secondary/50 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <span className={flag.color}>{flag.icon}</span>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-medium text-foreground leading-tight">
            {flag.label}
          </span>
          <span className="text-[9px] text-muted-foreground leading-tight truncate">
            {flag.description}
          </span>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onToggle}
        className="ml-2 scale-75"
      />
    </div>
  )
}

// ── Main panel ───────────────────────────────────────────
export function ChaosPanel() {
  const chaosFlags = useSimStore((s) => s.chaosFlags)
  const defenseFlags = useSimStore((s) => s.defenseFlags)
  const setChaos = useSimStore((s) => s.setChaos)
  const setDefense = useSimStore((s) => s.setDefense)
  const resetChaos = useSimStore((s) => s.resetChaos)
  const simRunning = useSimStore((s) => s.simRunning)

  const activeChaosCount = Object.values(chaosFlags).filter(Boolean).length
  const activeDefenseCount = Object.values(defenseFlags).filter(Boolean).length

  return (
    <div className="border-t border-border flex flex-col">
      {/* ── Chaos Engineering ──────────────────────────── */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Chaos
            </span>
            {activeChaosCount > 0 && (
              <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-1.5 py-0 font-medium">
                {activeChaosCount}
              </span>
            )}
          </div>
          {activeChaosCount > 0 && (
            <button
              onClick={resetChaos}
              className="text-[9px] text-muted-foreground hover:text-red-400 transition-colors"
            >
              Reset All
            </button>
          )}
        </div>

        <div className="space-y-0">
          {CHAOS_FLAGS.map((flag) => (
            <FlagToggle
              key={flag.key}
              flag={flag}
              checked={chaosFlags[flag.key]}
              onToggle={(value) => setChaos(flag.key, value)}
            />
          ))}
        </div>
      </div>

      {/* ── Defense Systems ────────────────────────────── */}
      <div className="px-3 pt-2 pb-3">
        <div className="flex items-center gap-1.5 mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Defense
          </span>
          {activeDefenseCount > 0 && (
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-1.5 py-0 font-medium">
              {activeDefenseCount}
            </span>
          )}
        </div>

        <div className="space-y-0">
          {DEFENSE_FLAGS.map((flag) => (
            <FlagToggle
              key={flag.key}
              flag={flag}
              checked={defenseFlags[flag.key]}
              onToggle={(value) => setDefense(flag.key, value)}
            />
          ))}
        </div>
      </div>

      {/* Hint when sim not running */}
      {!simRunning && (
        <div className="px-3 pb-3">
          <p className="text-[9px] text-muted-foreground text-center bg-secondary/50 rounded py-1.5">
            Start simulation to see chaos effects
          </p>
        </div>
      )}
    </div>
  )
}
