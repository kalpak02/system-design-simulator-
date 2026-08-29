import { useCallback, useRef, useState } from 'react'
import { nodeTypes } from '@/lib/nodeRegistry'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ConnectionLineType,
  MarkerType,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type Edge,
  type DefaultEdgeOptions,
  type ReactFlowInstance,
  type NodeChange,
  type EdgeChange,
  type Node,
} from '@xyflow/react'
import { type ComponentNodeData } from '@/nodes/BaseNode'
import { useSimStore } from '@/store/useSimStore'

type AppNode = Node<ComponentNodeData>

// smoothstep edges with arrow markers on every new connection
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
  style: { stroke: 'oklch(0.50 0.05 265)', strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: 'oklch(0.50 0.05 265)',
  },
}

// dashed line shown while the user is dragging a new connection
const connectionLineStyle: React.CSSProperties = {
  stroke: 'oklch(0.70 0.18 265)',
  strokeWidth: 2,
  strokeDasharray: '6 3',
}

export function Canvas() {
  const nodes = useSimStore((s) => s.nodes)
  const edges = useSimStore((s) => s.edges)
  const setNodes = useSimStore((s) => s.setNodes)
  const setEdges = useSimStore((s) => s.setEdges)
  const setSelectedNodeId = useSimStore((s) => s.setSelectedNodeId)

  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<AppNode> | null>(null)

  const onNodesChange = useCallback(
    (changes: NodeChange<AppNode>[]) => {
      setNodes(applyNodeChanges(changes, useSimStore.getState().nodes))
    },
    [setNodes]
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(applyEdgeChanges(changes, useSimStore.getState().edges))
    },
    [setEdges]
  )

  // reject self-loops and duplicate edges
  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      // no self-loops
      if (connection.source === connection.target) return false
      // no duplicate edges between the same source → target
      const currentEdges = useSimStore.getState().edges
      const duplicate = currentEdges.some(
        (e) => e.source === connection.source && e.target === connection.target
      )
      return !duplicate
    },
    []
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges(addEdge(connection, useSimStore.getState().edges))
    },
    [setEdges]
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: AppNode) => {
      setSelectedNodeId(node.id)
    },
    [setSelectedNodeId]
  )

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [setSelectedNodeId])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const type = e.dataTransfer.getData('application/reactflow')
      if (!type || !reactFlowInstance) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })

      const newNode: AppNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: type },
      }

      setNodes([...useSimStore.getState().nodes, newNode])
      setSelectedNodeId(newNode.id)
    },
    [reactFlowInstance, setNodes, setSelectedNodeId]
  )

  return (
    <div className="flex-1 h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        isValidConnection={isValidConnection}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={connectionLineStyle}
        fitView
        deleteKeyCode={['Delete']}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.08)"
        />
        <Controls />
        <MiniMap
          nodeColor="oklch(0.70 0.18 265)"
          maskColor="oklch(0.13 0.02 265 / 80%)"
        />
      </ReactFlow>
    </div>
  )
}