'use client'

import { motion } from 'framer-motion'
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp,
  BrainCircuit
} from 'lucide-react'
import { Card } from '@/components/ui/card'

interface StatsRibbonProps {
  stats: {
    total: number
    pending: number
    inProgress: number
    resolved: number
    aiProcessed: number
    avgResolutionTime: string
  }
}

export function StatsRibbon({ stats }: StatsRibbonProps) {
  const items = [
    {
      label: 'Total Reports',
      value: stats.total,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    },
    {
      label: 'Pending AI',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100'
    },
    {
      label: 'In Action',
      value: stats.inProgress,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100'
    },
    {
      label: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    {
      label: 'AI Insights',
      value: stats.aiProcessed,
      icon: BrainCircuit,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`p-4 border ${item.border} bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  {item.label}
                </p>
                <h3 className="text-2xl font-bold text-slate-900 tabular-nums">
                  {item.value}
                </h3>
              </div>
              <div className={`p-2.5 rounded-none ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <item.icon size={20} strokeWidth={2.5} />
              </div>
            </div>
            {/* Minimal trend indicator */}
            <div className="mt-3 flex items-center gap-1.5">
              <div className="h-1 flex-1 bg-slate-100 rounded-none overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((item.value / (stats.total || 1)) * 100, 100)}%` }}
                  className={`h-full ${item.color.replace('text', 'bg')}`}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
