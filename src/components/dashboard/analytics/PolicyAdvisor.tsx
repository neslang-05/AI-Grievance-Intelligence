'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Lightbulb, 
  Sparkles, 
  ArrowRight, 
  BrainCircuit,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getIntelligencePolicy } from '@/app/actions/intelligence.actions'
import { toast } from 'sonner'

interface Recommendation {
  id: string
  title: string
  insight: string
  recommendation: string
  impact: 'high' | 'medium'
  department: string
}

export function PolicyAdvisor() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRecommendations()
  }, [])

  async function loadRecommendations() {
    setLoading(true)
    const res = await getIntelligencePolicy()
    if (res.success && res.recommendations) {
      setRecommendations(res.recommendations)
    }
    setLoading(false)
  }

  const handleScan = async () => {
    setLoading(true)
    toast.info('AI is cross-referencing recent grievances for structural patterns...')
    const res = await getIntelligencePolicy()
    if (res.success && res.recommendations) {
      setRecommendations(res.recommendations)
      toast.success('Strategy Engine updated with fresh insights')
    }
    setLoading(false)
  }

  return (
    <Card className="border-none shadow-xl bg-gradient-to-br from-[#064E3B] to-emerald-950 text-white overflow-hidden relative rounded-none min-h-[600px]">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Sparkles size={120} />
      </div>
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-none px-3 py-1 backdrop-blur-md">
            AI Strategy Engine
          </Badge>
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-none border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <div className="w-8 h-8 rounded-none border-2 border-emerald-900 bg-emerald-600 flex items-center justify-center text-[10px] font-bold">
              +AI
            </div>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold mt-4 flex items-center gap-2">
          Strategic Insights
          <Lightbulb className="text-yellow-400 fill-yellow-400/20" size={24} />
        </CardTitle>
        <CardDescription className="text-emerald-200/60 font-medium">
          Evidence-based policy shifts derived from real-time grievance trends
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 relative z-10">
        <AnimatePresence mode="wait">
          {loading && recommendations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="animate-spin text-indigo-400" size={40} />
              <p className="text-sm font-medium text-indigo-200/60 tracking-widest uppercase">Synthesizing Data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id || index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 rounded-none bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{rec.department}</span>
                    <Badge variant="outline" className={`text-[10px] border-none ${
                      rec.impact === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {rec.impact?.toUpperCase() || 'MEDIUM'} IMPACT
                    </Badge>
                  </div>
                  
                  <h4 className="text-lg font-bold mb-2 group-hover:text-indigo-300 transition-colors">{rec.title}</h4>
                  
                  <div className="flex gap-3 mb-4">
                    <div className="w-1 bg-indigo-500/30 rounded-none" />
                    <p className="text-sm text-slate-400 leading-relaxed italic">
                      "{rec.insight}"
                    </p>
                  </div>
                  
                    <p className="text-sm text-emerald-100/90 font-medium bg-emerald-500/10 p-4 rounded-none border border-emerald-500/20">
                    {rec.recommendation}
                  </p>
                  
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-white hover:bg-white/10 gap-2">
                      Convert to Policy Proposal
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
        
        <div className="flex items-center justify-center pt-2">
          <Button 
            className="w-full bg-white text-emerald-900 hover:bg-emerald-50 font-bold py-6 rounded-none shadow-lg group"
            onClick={handleScan}
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2 text-emerald-600 group-hover:animate-pulse" size={20} />}
            Scan for New Patterns
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
