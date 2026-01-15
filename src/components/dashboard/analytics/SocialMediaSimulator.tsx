'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  RefreshCw, 
  ArrowRight,
  BrainCircuit,
  MapPin,
  Globe
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { getSocialPosts, triggerSocialIngest } from '@/app/actions/intelligence.actions'

export function SocialMediaSimulator() {
  const [posts, setPosts] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    const res = await getSocialPosts()
    if (res.success && res.posts) {
      setPosts(res.posts)
    }
    setLoading(false)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const res = await triggerSocialIngest()
    if (res.success) {
      // Prepend new posts
      setPosts(prev => [...(res.posts || []), ...prev])
      toast.success(`AI discovered ${res.posts?.length} new civic signals`)
    } else {
      toast.error('AI scanning failed')
    }
    setIsRefreshing(false)
  }

  const handleProcess = (id: string) => {
    toast.info('Feature coming soon: Direct conversion to ticket')
  }

  return (
    <Card className="border-slate-200/60 bg-white/70 backdrop-blur-md shadow-lg overflow-hidden flex flex-col h-[600px] rounded-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-none">
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </span>
            Social Intelligence Feed
          </CardTitle>
          <CardDescription>Direct signal ingestion from X (Twitter) and Community Groups</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="rounded-none px-4 bg-white/50 hover:bg-white"
        >
          {isRefreshing ? 'AI Scanning...' : 'Ingest New Signals'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 h-[410px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {posts.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <Globe size={48} className="opacity-20 animate-pulse" />
                <p className="text-sm font-medium">No signals ingested yet. Run AI Scan.</p>
              </div>
            )}
            
            {posts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-none border ${
                  post.is_processed 
                    ? 'bg-emerald-50/50 border-emerald-100 opacity-60' 
                    : 'bg-white border-slate-100 shadow-sm hover:border-emerald-200'
                } transition-all duration-300 relative overflow-hidden`}
              >
                {post.is_processed && (
                  <div className="absolute top-0 right-0 p-2">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                      Processed
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-none ${
                    post.platform === 'twitter' ? 'bg-sky-50 text-sky-500' : 
                    post.platform === 'facebook' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {post.platform === 'twitter' ? <Twitter size={18} /> : 
                     post.platform === 'facebook' ? <Facebook size={18} /> : <Instagram size={18} />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{post.author_handle}</span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                        {mounted ? new Date(post.created_at).toLocaleTimeString() : '--:--:--'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`text-[10px] font-bold ${
                          post.sentiment === 'negative' ? 'bg-rose-50 text-rose-600 hover:bg-rose-50' : 
                          post.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-50' :
                          'bg-slate-100 text-slate-600'
                        } border-none`}>
                          {post.sentiment?.toUpperCase() || 'NEUTRAL'}
                        </Badge>
                        <span className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">
                          Signal ID: {post.id.slice(0, 5)}
                        </span>
                      </div>
                      
                      {!post.is_processed && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 px-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 group"
                          onClick={() => handleProcess(post.id)}
                        >
                          Verify Signal
                          <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="mt-6 p-4 rounded-none bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-none shadow-sm text-emerald-600">
              <BrainCircuit size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none mb-1">Active Intelligence Engine</p>
              <p className="text-[11px] text-emerald-600/80 font-medium">Scanning multi-channel civic keywords in real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Surveillance</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
