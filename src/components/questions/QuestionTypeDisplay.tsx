'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  CheckCircle, 
  Square, 
  FileText, 
  RotateCcw,
  Shuffle,
  ArrowUpDown,
  Calculator,
  Code,
  PenTool,
  HelpCircle
} from 'lucide-react'
import type { QuestionType } from '@/lib/ai/schema'

interface QuestionTypeDisplayProps {
  type: QuestionType
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showDescription?: boolean
}

const questionTypeConfig = {
  mcq: {
    label: '单选题',
    color: 'bg-blue-500',
    icon: CheckCircle,
    description: '从多个选项中选择一个正确答案'
  },
  multi: {
    label: '多选题',
    color: 'bg-green-500',
    icon: Square,
    description: '从多个选项中选择多个正确答案'
  },
  short: {
    label: '简答题',
    color: 'bg-purple-500',
    icon: FileText,
    description: '用简短文字回答问题'
  },
  true_false: {
    label: '判断题',
    color: 'bg-orange-500',
    icon: RotateCcw,
    description: '判断陈述是否正确'
  },
  fill_blank: {
    label: '填空题',
    color: 'bg-cyan-500',
    icon: PenTool,
    description: '在空白处填入正确答案'
  },
  matching: {
    label: '匹配题',
    color: 'bg-pink-500',
    icon: Shuffle,
    description: '将相关的项目进行配对'
  },
  ordering: {
    label: '排序题',
    color: 'bg-indigo-500',
    icon: ArrowUpDown,
    description: '按正确顺序排列选项'
  },
  calculation: {
    label: '计算题',
    color: 'bg-red-500',
    icon: Calculator,
    description: '进行数学计算并给出答案'
  },
  essay: {
    label: '论述题',
    color: 'bg-yellow-600',
    icon: FileText,
    description: '详细论述和分析问题'
  },
  coding: {
    label: '编程题',
    color: 'bg-gray-700',
    icon: Code,
    description: '编写程序代码解决问题'
  },
  unknown: {
    label: '未知类型',
    color: 'bg-gray-400',
    icon: HelpCircle,
    description: '无法确定具体题型'
  }
}

export function QuestionTypeDisplay({ 
  type, 
  size = 'md', 
  showIcon = true, 
  showDescription = false 
}: QuestionTypeDisplayProps) {
  const config = questionTypeConfig[type]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  if (showDescription) {
    return (
      <Card className="border-l-4" style={{ borderLeftColor: config.color.replace('bg-', '') }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {showIcon && <Icon className={`${iconSizes[size]} text-gray-600`} />}
            <Badge 
              className={`${config.color} text-white ${sizeClasses[size]}`}
            >
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{config.description}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Badge 
      className={`${config.color} text-white ${sizeClasses[size]} flex items-center gap-1`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  )
}

interface QuestionTypesOverviewProps {
  showAll?: boolean
  selectedTypes?: QuestionType[]
  onTypeSelect?: (type: QuestionType) => void
}

export function QuestionTypesOverview({ 
  showAll = true, 
  selectedTypes = [], 
  onTypeSelect 
}: QuestionTypesOverviewProps) {
  const displayTypes = showAll 
    ? Object.keys(questionTypeConfig) as QuestionType[]
    : selectedTypes

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayTypes.map((type) => (
        <div
          key={type}
          className={`cursor-pointer transition-transform hover:scale-105 ${
            onTypeSelect ? 'hover:shadow-md' : ''
          }`}
          onClick={() => onTypeSelect?.(type)}
        >
          <QuestionTypeDisplay 
            type={type} 
            size="lg" 
            showIcon={true} 
            showDescription={true} 
          />
        </div>
      ))}
    </div>
  )
}

interface QuestionStatsProps {
  stats: Record<QuestionType, number>
  total: number
}

export function QuestionTypeStats({ stats, total }: QuestionStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Object.entries(stats).map(([type, count]) => {
        if (count === 0) return null
        
        const config = questionTypeConfig[type as QuestionType]
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0
        
        return (
          <Card key={type} className="text-center">
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-full ${config.color} text-white mb-2`}>
                <config.icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">{config.label}</div>
              <div className="text-xs text-gray-500">{percentage}%</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}