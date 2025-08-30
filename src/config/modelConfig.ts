/**
 * QuizMate AI 多模型配置
 * 根据不同任务类型自动选择最适合的模型
 */

export interface ModelConfig {
  model: string
  provider: string
  description: string
  costLevel: 'low' | 'medium' | 'high'
  strengths: string[]
}

export interface TaskTypeConfig {
  [key: string]: ModelConfig
}

export const modelConfig: TaskTypeConfig = {
  // 🧮 数学和逻辑题 - DeepSeek数学专业模型（数学题非常强）
  math: {
    model: "deepseek-ai/DeepSeek-V3",
    provider: "siliconflow",
    description: "DeepSeek专业数学模型，数学推理能力极强",
    costLevel: "medium",
    strengths: ["数学推理", "逻辑分析", "几何证明", "微积分", "统计概率"]
  },

  // 🧮 复杂计算题 - DeepSeek Math专用
  calculation: {
    model: "deepseek-ai/deepseek-math-7b-rl",
    provider: "siliconflow", 
    description: "DeepSeek数学计算专家，处理复杂运算",
    costLevel: "low",
    strengths: ["复杂计算", "数学证明", "微积分", "线性代数", "数值分析"]
  },

  // 🇺🇸 英语语言任务 - GPT-4o-mini（语言处理顶级）
  language: {
    model: "gpt-4o-mini",
    provider: "openai",
    description: "OpenAI GPT-4o-mini英语专家，语言处理顶级",
    costLevel: "medium",
    strengths: ["英语写作", "语法检查", "翻译", "语言学习", "文学分析"]
  },

  // 🇨🇳 中文语文 - 智谱GLM-4（中文理解最强）
  chinese: {
    model: "THUDM/glm-4-9b-chat",
    provider: "siliconflow",
    description: "智谱GLM-4中文专家，古诗词文言文理解极强",
    costLevel: "low", 
    strengths: ["中文写作", "古诗词", "文言文", "阅读理解", "文学创作"]
  },

  // 📚 长文档分析 - Moonshot Kimi（超长上下文200K-1M）
  document: {
    model: "moonshot-v1-128k",
    provider: "moonshot",
    description: "Moonshot Kimi超长上下文文档专家",
    costLevel: "high",
    strengths: ["长文本分析", "PDF解析", "教材总结", "知识提取", "超长上下文"]
  },

  // 💻 编程代码 - Claude 3.5 Sonnet（代码能力极强）
  coding: {
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    description: "Claude 3.5 Sonnet编程专家，代码能力顶级",
    costLevel: "high",
    strengths: ["代码生成", "代码优化", "算法设计", "系统架构", "调试分析"]
  },

  // 🧪 科学实验 - GPT-4o（多模态科学分析）
  science: {
    model: "gpt-4o",
    provider: "openai", 
    description: "GPT-4o多模态科学专家，支持图片分析",
    costLevel: "high",
    strengths: ["物理化学", "生物医学", "实验设计", "科学推理", "图表分析"]
  },

  // 📖 医学生物 - Claude 3.5 Haiku（专业知识强）
  medical: {
    model: "claude-3-5-haiku-20241022",
    provider: "anthropic",
    description: "Claude医学生物专家，医学知识专业",
    costLevel: "medium",
    strengths: ["医学诊断", "生理病理", "解剖学", "药理学", "临床分析"]
  },

  // 🎨 图片识别 - Qwen2.5-VL（视觉理解最强）
  vision: {
    model: "Qwen/Qwen2.5-VL-32B-Instruct",
    provider: "siliconflow",
    description: "Qwen2.5-VL视觉专家，图片识别最强",
    costLevel: "high",
    strengths: ["图片识别", "OCR文字提取", "视觉理解", "多模态分析", "图表解读"]
  },

  // 📜 历史文化 - GPT-3.5-turbo（知识面广）
  history: {
    model: "gpt-3.5-turbo",
    provider: "openai",
    description: "GPT-3.5历史文化专家，知识面广泛",
    costLevel: "low", 
    strengths: ["历史分析", "文化背景", "社会学", "人文知识", "时事政治"]
  },

  // 🌐 通用任务 - GPT-4o-mini（平衡性价比）
  general: {
    model: "gpt-4o-mini",
    provider: "openai",
    description: "GPT-4o-mini通用专家，平衡性价比",
    costLevel: "medium",
    strengths: ["通用对话", "综合分析", "多领域知识", "逻辑推理"]
  },

  // ⚡ 快速任务 - GLM-4-Air（超快响应）
  quick: {
    model: "THUDM/glm-4-air", 
    provider: "siliconflow",
    description: "GLM-4-Air快速响应专家",
    costLevel: "low",
    strengths: ["快速推理", "简单问答", "基础计算", "信息提取"]
  },

  // 🔬 物理化学 - DeepSeek专业版
  physics: {
    model: "deepseek-ai/DeepSeek-V3",
    provider: "siliconflow",
    description: "DeepSeek物理化学专家，公式推导强",
    costLevel: "medium",
    strengths: ["物理公式", "化学反应", "热力学", "量子力学", "电磁学"]
  },

  // 🎯 应试技巧 - 智谱GLM-4-Long（长思维链）
  exam: {
    model: "THUDM/glm-4-long",
    provider: "siliconflow",
    description: "GLM-4-Long应试专家，长思维链推理",
    costLevel: "medium",
    strengths: ["应试技巧", "答题方法", "考点分析", "题型识别", "策略规划"]
  }
}

/**
 * 根据问题类型智能选择模型
 */
export function getModelForTaskType(questionType: string, subject?: string, difficulty?: string): ModelConfig {
  // 🎯 优先根据题型精确匹配
  if (modelConfig[questionType]) {
    return modelConfig[questionType]
  }

  // 🧠 智能学科匹配 - 使用各专业顶级模型
  if (subject) {
    const subjectLower = subject.toLowerCase()
    const difficultyLower = difficulty?.toLowerCase() || ''
    
    // 🧮 数学类 - DeepSeek数学专家（数学题非常强）
    if (subjectLower.includes('math') || subjectLower.includes('数学') || 
        subjectLower.includes('algebra') || subjectLower.includes('geometry') ||
        subjectLower.includes('calculus') || subjectLower.includes('statistics')) {
      // 复杂计算使用专用数学模型
      if (difficultyLower.includes('complex') || difficultyLower.includes('advanced') ||
          subjectLower.includes('calculus') || subjectLower.includes('微积分')) {
        return modelConfig.calculation
      }
      return modelConfig.math
    }
    
    // 🇺🇸 英语类 - GPT-4o-mini（语言处理顶级）
    if (subjectLower.includes('english') || subjectLower.includes('英语') ||
        subjectLower.includes('language') || subjectLower.includes('grammar') ||
        subjectLower.includes('writing') || subjectLower.includes('literature')) {
      return modelConfig.language
    }
    
    // 🇨🇳 中文类 - 智谱GLM-4（中文理解最强）
    if (subjectLower.includes('chinese') || subjectLower.includes('中文') ||
        subjectLower.includes('语文') || subjectLower.includes('文学') ||
        subjectLower.includes('古诗词') || subjectLower.includes('文言文')) {
      return modelConfig.chinese
    }
    
    // 💻 编程类 - Claude 3.5 Sonnet（代码能力极强）
    if (subjectLower.includes('programming') || subjectLower.includes('code') ||
        subjectLower.includes('编程') || subjectLower.includes('计算机') ||
        subjectLower.includes('algorithm') || subjectLower.includes('software')) {
      return modelConfig.coding
    }

    // 📖 医学生物 - Claude 3.5 Haiku（医学专业）
    if (subjectLower.includes('medical') || subjectLower.includes('medicine') ||
        subjectLower.includes('医学') || subjectLower.includes('解剖') ||
        subjectLower.includes('生理') || subjectLower.includes('病理') ||
        subjectLower.includes('药理') || subjectLower.includes('诊断') ||
        subjectLower.includes('anatomy') || subjectLower.includes('physiology')) {
      return modelConfig.medical
    }
    
    // 🔬 物理化学 - 细分专业模型选择
    if (subjectLower.includes('physics') || subjectLower.includes('物理') ||
        subjectLower.includes('mechanics') || subjectLower.includes('thermodynamics')) {
      return modelConfig.physics
    }

    // 🧪 化学实验 - GPT-4o多模态科学专家
    if (subjectLower.includes('chemistry') || subjectLower.includes('chemical') ||
        subjectLower.includes('化学') || subjectLower.includes('实验') ||
        subjectLower.includes('电化学') || subjectLower.includes('electrochemistry') ||
        subjectLower.includes('电池') || subjectLower.includes('battery') ||
        subjectLower.includes('电动势') || subjectLower.includes('electrode') ||
        subjectLower.includes('反应') || subjectLower.includes('reaction')) {
      return modelConfig.science
    }

    // 🌿 生物类 - GPT-4o科学专家
    if (subjectLower.includes('biology') || subjectLower.includes('生物') ||
        subjectLower.includes('genetics') || subjectLower.includes('ecology') ||
        subjectLower.includes('biochemistry') || subjectLower.includes('molecular')) {
      return modelConfig.science
    }
    
    // 📜 历史文化 - GPT-3.5（知识面广，成本低）
    if (subjectLower.includes('history') || subjectLower.includes('历史') ||
        subjectLower.includes('culture') || subjectLower.includes('文化') ||
        subjectLower.includes('geography') || subjectLower.includes('地理') ||
        subjectLower.includes('politics') || subjectLower.includes('政治')) {
      return modelConfig.history
    }

    // 📚 长文档 - Moonshot Kimi（超长上下文）
    if (subjectLower.includes('document') || subjectLower.includes('reading') ||
        subjectLower.includes('comprehension') || subjectLower.includes('essay') ||
        difficultyLower.includes('long') || difficultyLower.includes('lengthy')) {
      return modelConfig.document
    }

    // 🎯 应试相关 - GLM-4-Long（长思维链推理）
    if (subjectLower.includes('exam') || subjectLower.includes('test') ||
        subjectLower.includes('考试') || subjectLower.includes('应试') ||
        difficultyLower.includes('exam') || difficultyLower.includes('quiz')) {
      return modelConfig.exam
    }
  }

  // ⚡ 根据难度选择模型
  if (difficulty) {
    const difficultyLower = difficulty.toLowerCase()
    
    // 简单问题使用快速模型
    if (difficultyLower.includes('easy') || difficultyLower.includes('simple') ||
        difficultyLower.includes('basic') || difficultyLower.includes('简单')) {
      return modelConfig.quick
    }
    
    // 复杂问题使用高级模型
    if (difficultyLower.includes('hard') || difficultyLower.includes('complex') ||
        difficultyLower.includes('advanced') || difficultyLower.includes('困难')) {
      return modelConfig.general // GPT-4o-mini 综合能力强
    }
  }

  // 🌐 默认返回通用模型 - GPT-4o-mini（平衡性价比）
  return modelConfig.general
}

/**
 * 获取所有可用模型列表
 */
export function getAvailableModels(): ModelConfig[] {
  return Object.values(modelConfig)
}

/**
 * 根据成本等级筛选模型
 */
export function getModelsByCostLevel(costLevel: 'low' | 'medium' | 'high'): ModelConfig[] {
  return Object.values(modelConfig).filter(config => config.costLevel === costLevel)
}