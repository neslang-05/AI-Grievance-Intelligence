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
  Zap,
  MapPin
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface SocialPost {
  id: string
  platform: 'twitter' | 'facebook' | 'instagram'
  author: string
  content: string
  timestamp: string
  location?: string
  sentiment: 'negative' | 'neutral' | 'positive'
  processed: boolean
}

const DUMMY_POSTS: SocialPost[] = [
  {
    id: '1',
    platform: 'twitter',
    author: '@ImphalCitizen',
    content: "Massive pothole at the main intersection of Khoyathong road. Someone is going to get hurt! @ManipurGov @PWD_Manipur #Imphal #Safety",
    timestamp: '2 mins ago',
    location: 'Khoyathong, Imphal',
    sentiment: 'negative',
    processed: false
  },
  {
    id: '2',
    platform: 'facebook',
    author: 'Robert Meitei',
    content: "Water supply has been cut off in our area for the last 3 days. We've called the department but no response. This is getting ridiculous.",
    timestamp: '15 mins ago',
    location: 'Singjamei',
    sentiment: 'negative',
    processed: false
  },
  {
    id: '3',
    platform: 'twitter',
    author: '@GreenManipur',
    content: "Waste pile up near the market is attracting stray dogs. Need urgent clearance. #SwachhManipur #HealthRisk",
    timestamp: '1 hour ago',
    location: 'Ima Keithel',
    sentiment: 'negative',
    processed: false
  }
]

export function SocialMediaSimulator() {
  const [posts, setPosts] = useState<SocialPost[]>(DUMMY_POSTS)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('Found 2 new social media grievances')
    }, 1500)
  }

  const handleProcess = (id: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'AI is analyzing social post and creating grievance ticket...',
        success: () => {
          setPosts(prev => prev.map(p => p.id === id ? { ...p, processed: true } : p))
          return 'Successfully converted to official grievance'
        },
        error: 'Failed to process social post'
      }
    )
  }

  return (
    <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </span>
            Social Intelligence Feed
          </CardTitle>
          <CardDescription>Real-time civic grievance monitoring from social platforms</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="rounded-full px-4"
        >
          {isRefreshing ? 'Scanning...' : 'Scan Now'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-xl border ${
                  post.processed 
                    ? 'bg-slate-50 border-slate-100 opacity-60' 
                    : 'bg-white border-slate-100 shadow-sm hover:border-blue-200'
                } transition-all duration-300 relative overflow-hidden`}
              >
                {post.processed && (
                  <div className="absolute top-0 right-0 p-2">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                      Processed
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    post.platform === 'twitter' ? 'bg-blue-50 text-blue-400' : 
                    post.platform === 'facebook' ? 'bg-indigo-50 text-indigo-500' : 'bg-pink-50 text-pink-500'
                  }`}>
                    {post.platform === 'twitter' ? <Twitter size={18} /> : 
                     post.platform === 'facebook' ? <Facebook size={18} /> : <Instagram size={18} />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{post.author}</span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                        {post.timestamp}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {post.location && (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                            <MapPin size={12} className="text-slate-400" />
                            {post.location}
                          </div>
                        )}
                        <Badge className={`text-[10px] font-bold ${
                          post.sentiment === 'negative' ? 'bg-red-50 text-red-600 hover:bg-red-50' : 'bg-slate-100 text-slate-600'
                        } border-none`}>
                          {post.sentiment.toUpperCase()}
                        </Badge>
                      </div>
                      
                      {!post.processed && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 px-3 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 group"
                          onClick={() => handleProcess(post.id)}
                        >
                          Process with AI
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
        
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
              <BrainCircuit size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none mb-1">AI Auto-Ingestion</p>
              <p className="text-[11px] text-indigo-600/80 font-medium">Listening for civic keywords in Manipur region</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
