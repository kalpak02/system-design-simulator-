import { Play, Square, Share2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopBarProps {
  isRunning: boolean
  onStart: () => void
  onStop: () => void
  onShare: () => void
}

export function TopBar({
  isRunning,
  onStart,
  onStop,
  onShare,
}: TopBarProps) {
  return (
    <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          System Design Simulator
        </span>
      </div>

      <div className="flex items-center gap-2">
        {!isRunning ? (
          <Button
            size="sm"
            onClick={onStart}
            className="h-7 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Play className="w-3 h-3 mr-1" />
            Start Simulation
          </Button>
        ) : (
          <Button
            size="sm"
            variant="destructive"
            onClick={onStop}
            className="h-7 px-3 text-xs"
          >
            <Square className="w-3 h-3 mr-1" />
            Stop
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={onShare}
          className="h-7 px-3 text-xs"
        >
          <Share2 className="w-3 h-3 mr-1" />
          Share
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isRunning
              ? 'bg-green-400 animate-pulse'
              : 'bg-muted-foreground'
          }`}
        />
        <span className="text-xs text-muted-foreground">
          {isRunning ? 'Simulating' : 'Idle'}
        </span>
      </div>
    </header>
  )
}