
// import { useState } from 'react'
// import { ReactFlowProvider } from '@xyflow/react'
// import { TopBar } from './components/TopBar'
// import { Sidebar } from './components/Sidebar'
// import { Canvas } from './components/Canvas'
// import { MetricsPanel } from './components/MetricsPanel'

// function App() {
//   const [isRunning, setIsRunning] = useState(false)

//   const handleShare = () => {
//     navigator.clipboard.writeText(window.location.href)
//     alert('Link copied!')
//   }

//   return (
//     <ReactFlowProvider>
//       <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
//         <TopBar
//           isRunning={isRunning}
//           onStart={() => setIsRunning(true)}
//           onStop={() => setIsRunning(false)}
//           onShare={handleShare}
//         />
//         <div className="flex flex-1 overflow-hidden">
//           <Sidebar />
//           <Canvas />
//           <MetricsPanel />
//         </div>
//       </div>
//     </ReactFlowProvider>
//   )
// }

// export default App


import { ReactFlowProvider } from '@xyflow/react'
import { TopBar } from './components/TopBar'
import { Sidebar } from './components/Sidebar'
import { Canvas } from './components/Canvas'
import { MetricsPanel } from './components/MetricsPanel'
import { useSimStore } from './store/useSimStore'

function App() {
  const { simRunning, startSim, stopSim } = useSimStore()

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied!')
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
        <TopBar
          isRunning={simRunning}
          onStart={startSim}
          onStop={stopSim}
          onShare={handleShare}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <Canvas />
          <MetricsPanel />
        </div>
      </div>
    </ReactFlowProvider>
  )
}

export default App