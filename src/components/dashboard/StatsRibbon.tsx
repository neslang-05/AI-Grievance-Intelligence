'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Clock, CheckCircle2, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react'

interface StatsRibbonProps {
  stats: {
    total: number
    pending: number
    inProgress: number
    resolved: number
  }
}

export function StatsRibbon({ stats }: StatsRibbonProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const statCards = [
    {
      label: 'Total Reports',
      value: stats.total,
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100'
    },
    {
      label: 'Awaiting Action',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100'
    },
    {
      label: 'Under Analysis',
      value: stats.inProgress,
      icon: AlertTriangle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    },
    {
      label: 'Resolution Rate',
      value: stats.total > 0 ? `${Math.round((stats.resolved / stats.total) * 100)}%` : '0%',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    }
  ]

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
    >
      {statCards.map((stat, idx) => (
        <motion.div key={idx} variants={item}>
          <Card className="bg-white/70 backdrop-blur-md border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-extrabold text-slate-800">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
                <TrendingUp size={12} className="mr-1" />
                <span>+4% from last week</span>
              </div>
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50" />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
