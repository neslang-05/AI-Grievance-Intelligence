'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Complaint } from '@/types/database.types'

interface AnalyticsChartsProps {
  complaints: Complaint[]
}

export function AnalyticsCharts({ complaints }: AnalyticsChartsProps) {
  // Process data for Department Distribution
  const departmentData = complaints.reduce((acc: any[], current) => {
    const existing = acc.find(item => item.name === current.ai_department)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({ name: current.ai_department, value: 1 })
    }
    return acc
  }, [])

  // Process data for Priority Volume
  const priorityData = [
    { name: 'High', value: complaints.filter(c => c.ai_priority === 'high').length, color: '#ef4444' },
    { name: 'Medium', value: complaints.filter(c => c.ai_priority === 'medium').length, color: '#f59e0b' },
    { name: 'Low', value: complaints.filter(c => c.ai_priority === 'low').length, color: '#3b82f6' }
  ]

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316']

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card className="bg-white/70 backdrop-blur-md border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Department Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={departmentData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {departmentData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  borderRadius: '8px', 
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-md border-none shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Priority Volume</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  borderRadius: '8px', 
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
