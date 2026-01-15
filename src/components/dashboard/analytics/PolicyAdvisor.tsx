'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Lightbulb, 
  Sparkles, 
  ArrowRight, 
  FileCheck,
  TrendingDown,
  AlertTriangle
} from 'lucide-react'
import { motion } from 'framer-motion'

interface Recommendation {
  id: string
  title: string
  insight: string
  recommendation: string
  impact: 'high' | 'medium'
  department: string
}

const DUMMY_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    title: 'Water Infrastructure Strain',
    insight: 'Detected 42% increase in water leak reports in Ward 7 over the last 14 days, primarily concentrated near the Tiddim Road junction.',
    recommendation: 'Strategic recommendation: Initiate a structural integrity audit of the 30-year-old main pipeline in Ward 7. Consider preemptive replacement of the North-East feeder valves.',
    impact: 'high',
    department: 'Water Resources'
  },
  {
    id: '2',
    title: 'Peak-Hour Power Anomaly',
    insight: 'AI analysis of electrical grievances shows a Recurring pattern of "Partial Outage" between 18:00 - 20:30 in residential sectors.',
    recommendation: 'Operational recommendation: Adjust load distribution schedules and deploy mobile backup transformers to Sector B-4 to prevent total phase collapse during peak hours.',
    impact: 'high',
    department: 'Electricity'
  }
]

export function PolicyAdvisor() {
  return (
    <Card className="border-none shadow-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Sparkles size={120} />
      </div>
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-none px-3 py-1 backdrop-blur-md">
            AI Policy Engine
          </Badge>
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-[10px] font-bold">
              +12
            </div>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold mt-4 flex items-center gap-2">
          Intelligence Insights
          <Lightbulb className="text-amber-400 fill-amber-400/20" size={24} />
        </CardTitle>
        <CardDescription className="text-indigo-200/60 font-medium">
          Automated policy recommendations derived from cross-department grievance patterns
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 relative z-10">
        {DUMMY_RECOMMENDATIONS.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + (index * 0.2) }}
            className="p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{rec.department}</span>
              <Badge variant="outline" className={`text-[10px] border-none ${
                rec.impact === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {rec.impact.toUpperCase()} IMPACT
              </Badge>
            </div>
            
            <h4 className="text-lg font-bold mb-2 group-hover:text-indigo-300 transition-colors">{rec.title}</h4>
            
            <div className="flex gap-3 mb-4">
              <div className="w-1 bg-indigo-500/30 rounded-full" />
              <p className="text-sm text-slate-400 leading-relaxed italic">
                "{rec.insight}"
              </p>
            </div>
            
            <p className="text-sm text-indigo-100/90 font-medium bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
              {rec.recommendation}
            </p>
            
            <div className="mt-4 flex justify-end">
              <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-white hover:bg-white/10 gap-2">
                Convert to Policy Proposal
                <ArrowRight size={14} />
              </Button>
            </div>
          </motion.div>
        ))}
        
        <div className="flex items-center justify-center pt-2">
          <Button className="w-full bg-white text-slate-900 hover:bg-indigo-50 font-bold py-6 rounded-2xl shadow-lg group">
            <Sparkles className="mr-2 text-indigo-600 group-hover:animate-pulse" size={20} />
            Scan for New Patterns
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
