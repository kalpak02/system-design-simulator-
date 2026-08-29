import { LoadBalancerNode }   from '@/nodes/LoadBalancerNode'
import { APIGatewayNode }     from '@/nodes/ApiGatewayNode'
import { CacheNode }          from '@/nodes/CacheNode'
import { DatabaseNode }       from '@/nodes/DatabaseNode'
import { QueueNode }          from '@/nodes/QueueNode'
import { AINode }             from '@/nodes/AiNode'
import { AppServerNode }      from '@/nodes/AppServerNode'
import { CDNNode }            from '@/nodes/CDNNode'
import { ExternalAPINode }    from '@/nodes/ExternalAPINode'
import { InternetGatewayNode } from '@/nodes/InternetGatewayNode'
import { NATGatewayNode }     from '@/nodes/NATGateway'
import { RateLimiterNode }    from '@/nodes/RateLimiterNode'
import { FirewallNode }       from '@/nodes/FirewallNode'
import { DDoSNode }           from '@/nodes/DDoSNode'

// React Flow nodeTypes map — pass this to <ReactFlow nodeTypes={nodeTypes} />
export const nodeTypes = {
  loadBalancer:    LoadBalancerNode,
  apiGateway:      APIGatewayNode,
  cache:           CacheNode,
  database:        DatabaseNode,
  queue:           QueueNode,
  aiNode:          AINode,
  appServer:       AppServerNode,
  cdn:             CDNNode,
  externalAPI:     ExternalAPINode,
  internetGateway: InternetGatewayNode,
  natGateway:      NATGatewayNode,
  rateLimiter:     RateLimiterNode,
  firewall:        FirewallNode,
  ddos:            DDoSNode,
}

// Sidebar palette config — grouped by category
export const PALETTE = [
  {
    category: 'Infrastructure',
    nodes: [
      { type: 'loadBalancer',    label: 'Load Balancer',    color: 'text-white-400',    border: 'border-white-500/40' },//was text-blue-400 changed to text-white-400
      { type: 'apiGateway',      label: 'API Gateway',      color: 'text-white-400',    border: 'border-white-500/40' },//was text-purple-400 changed to text-white-400
      { type: 'appServer',       label: 'App Server',       color: 'text-white-400',    border: 'border-white-500/40' },//was text-cyan-400 changed to text-white-400
    ],
  },
  {
    category: 'Storage',
    nodes: [
      { type: 'database',        label: 'Database',         color: 'text-white-400',   border: 'border-white-500/40' },//was text-green-400 changed to text-white-400
      { type: 'cache',           label: 'Cache',            color: 'text-white-400',  border: 'border-white-500/40' },//was text-yellow-400 changed to text-white-400
      { type: 'queue',           label: 'Queue',            color: 'text-white-400',  border: 'border-white-500/40' },//was text-orange-400 changed to text-white-400
    ],
  },
  {
    category: 'Network / VPC',
    nodes: [
      { type: 'internetGateway', label: 'Internet Gateway', color: 'text-white-400',     border: 'border-white-500/40' },//was text-sky-400 changed to text-white-400
      { type: 'natGateway',      label: 'NAT Gateway',      color: 'text-white-400',  border: 'border-white-500/40' },//was text-violet-400 changed to text-white-400
      { type: 'cdn',             label: 'CDN',              color: 'text-white-400',    border: 'border-white-500/40' },//was text-teal-400 changed to text-white-400
      { type: 'externalAPI',     label: 'External API',     color: 'text-white-400',  border: 'border-white-500/40' },//was text-indigo-400 changed to text-white-400
    ],
  },
  {
    category: 'Defense',
    nodes: [
      { type: 'rateLimiter',     label: 'Rate Limiter',     color: 'text-white-400',    border: 'border-white-500/40' },//was text-lime-400 changed to text-white-400
      { type: 'firewall',        label: 'Firewall',         color: 'text-white-400', border: 'border-white-500/40' },//was text-emerald-400 changed to text-white-400   
    ],
  },
  {
    category: 'AI / Misc',
    nodes: [
      { type: 'aiNode',          label: 'AI Service',       color: 'text-white-400',    border: 'border-white-500/40' },//was text-pink-400 changed to text-white-400
      { type: 'ddos',            label: 'DDoS Source',      color: 'text-white-400',     border: 'border-white-500/40' },//was text-red-400 changed to text-white-400
    ],
  },
]