"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { formatDuration } from "@/lib/utils/time"
import { Clock, DollarSign, TrendingDown, FileText } from "lucide-react"

interface ActivityOverviewProps {
  data: {
    workHours: number
    sales: number
    expenses: number
    notes: Array<{
      id: string
      text: string
      time: string
      type: 'sale' | 'expense' | 'work'
    }>
  }
}

export function ActivityOverview({ data }: ActivityOverviewProps) {
  const [activeSegment, setActiveSegment] = useState<'hours' | 'sales' | 'expenses' | 'notes'>('hours')
  
  const segments = [
    {
      id: 'hours' as const,
      label: 'Work Hours',
      value: formatDuration(data.workHours),
      icon: Clock,
      color: 'bg-blue-500',
      angle: 0
    },
    {
      id: 'sales' as const,
      label: 'Sales',
      value: formatCurrency(data.sales),
      icon: DollarSign,
      color: 'bg-green-500',
      angle: 90
    },
    {
      id: 'expenses' as const,
      label: 'Expenses',
      value: formatCurrency(data.expenses),
      icon: TrendingDown,
      color: 'bg-red-500',
      angle: 180
    },
    {
      id: 'notes' as const,
      label: 'Notes',
      value: `${data.notes.length} entries`,
      icon: FileText,
      color: 'bg-purple-500',
      angle: 270
    }
  ] as const

  return (
    <Card>
    <CardContent className="pt-6">
      <div className="relative">
        <div className="relative w-[300px] h-[300px] mx-auto">
          {/* Background circle */}
          <div className="absolute inset-0 rounded-full border-4 border-border/30" />
            {/* Segment buttons */}
            {segments.map((segment) => {
              const Icon = segment.icon
              const isActive = activeSegment === segment.id
              
              return (
                <div
                  key={segment.id}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${segment.angle}deg) translate(120px) rotate(-${segment.angle}deg)`,
                    marginLeft: '-32px',
                    marginTop: '-32px',
                  }}
                >
                  <motion.button
                    className={`
                      p-4 rounded-full transition-colors w-16 h-16 z-10  // Added z-10 here
                      ${isActive ? `${segment.color} text-white shadow-lg` : 'bg-background hover:bg-muted border border-border'}
                    `}
                    onClick={() => setActiveSegment(segment.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-6 w-6 mx-auto" />
                  </motion.button>
                </div>
              )
            })}

            {/* Center Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                key={activeSegment}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-medium"
              >
                {segments.find(s => s.id === activeSegment)?.label}
              </motion.div>
            </div>
          </div>
          {/* Content Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSegment}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              {activeSegment === 'notes' ? (
                <div className="space-y-3 max-h-[200px] overflow-y-auto px-4">
                  {data.notes.map((note) => (
                    <div 
                      key={note.id}
                      className="p-3 rounded-lg bg-background/50 border border-border/50"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className={`
                          px-2 py-1 rounded-full text-xs
                          ${note.type === 'sale' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 
                            note.type === 'expense' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'}
                        `}>
                          {note.type}
                        </span>
                        <span className="text-muted-foreground">{note.time}</span>
                      </div>
                      <p className="mt-1">{note.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold"
                  >
                    {segments.find(s => s.id === activeSegment)?.value}
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          </div>
      </CardContent>
    </Card>
  )
}