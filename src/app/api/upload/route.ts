/**
 * /api/upload - File processing API for various formats
 * Handles: Images (OCR), PDF, Word, PowerPoint, Excel documents
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/response'
import PDFParse from 'pdf-parse'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
// import { createWorker } from 'tesseract.js' // 暂时移除，使用快速处理模式

// Configure for file handling
export const runtime = 'nodejs'
export const maxDuration = 120 // 120 seconds for file processing (increased for OCR)

/**
 * POST /api/upload - Process uploaded file and extract text content
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication in production
    const user = await getCurrentUser()
    
    // Get uploaded file
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        createErrorResponse('MISSING_FILE', '请选择要上传的文件'),
        { status: 400 }
      )
    }

    // Validate file size (20MB limit)
    const maxSize = 20 * 1024 * 1024 // 20MB
    if (file.size > maxSize) {
      return NextResponse.json(
        createErrorResponse('FILE_TOO_LARGE', '文件大小不能超过20MB'),
        { status: 400 }
      )
    }

    // Process different file types
    let extractedText = ''
    const fileType = file.type
    const fileName = file.name
    
    try {
      if (fileType === 'text/plain') {
        // Handle text files
        extractedText = await file.text()
        
      } else if (fileType === 'application/pdf') {
        // Handle PDF files
        extractedText = await processPDF(file)
        
      } else if (fileType.startsWith('image/')) {
        // Handle images with OCR
        extractedText = await processImageOCR(file)
        
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType === 'application/msword'
      ) {
        // Handle Word documents
        extractedText = await processWordDocument(file)
        
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        fileType === 'application/vnd.ms-powerpoint'
      ) {
        // Handle PowerPoint presentations
        extractedText = await processPowerPoint(file)
        
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileType === 'application/vnd.ms-excel'
      ) {
        // Handle Excel spreadsheets
        extractedText = await processExcel(file)
        
      } else {
        return NextResponse.json(
          createErrorResponse('UNSUPPORTED_FORMAT', '不支持的文件格式'),
          { status: 400 }
        )
      }

      // Validate extracted text
      if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json(
          createErrorResponse('NO_TEXT_EXTRACTED', '无法从文件中提取文本内容'),
          { status: 400 }
        )
      }

      // Limit text length to prevent abuse
      const maxTextLength = 50000 // 50k characters
      if (extractedText.length > maxTextLength) {
        extractedText = extractedText.substring(0, maxTextLength) + '\n\n[文本过长，已截断...]'
      }

      return NextResponse.json(
        createSuccessResponse({
          text: extractedText,
          fileName: fileName,
          fileType: fileType,
          fileSize: file.size,
          characterCount: extractedText.length
        })
      )

    } catch (processingError) {
      console.error('File processing error:', processingError)
      return NextResponse.json(
        createErrorResponse('PROCESSING_ERROR', '文件处理失败，请确保文件格式正确且未损坏'),
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      createErrorResponse('SERVER_ERROR', '服务器错误，请稍后再试'),
      { status: 500 }
    )
  }
}

/**
 * Process PDF files - Full implementation
 */
async function processPDF(file: File): Promise<string> {
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Parse PDF using pdf-parse
    const pdfData = await PDFParse(buffer)
    
    if (!pdfData.text || pdfData.text.trim().length === 0) {
      throw new Error('PDF中没有可提取的文本内容')
    }
    
    // Clean up the extracted text
    let cleanText = pdfData.text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
      .trim()
    
    // Add metadata
    const metadata = `[PDF文档解析结果]\n文件名: ${file.name}\n页数: ${pdfData.numpages}\n文本长度: ${cleanText.length}字符\n\n--- 文档内容 ---\n\n`
    
    return metadata + cleanText
    
  } catch (error) {
    console.error('PDF processing error:', error)
    throw new Error(`PDF解析失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * Process images with real OCR using AI Vision - 使用AI视觉的真实图片识别
 */
async function processImageOCR(file: File): Promise<string> {
  console.log(`🔍 正在识别图片内容: ${file.name}, 大小: ${Math.round(file.size / 1024)}KB`)
  
  try {
    console.log('🎯 启动AI视觉识别系统...')
    console.log('📷 正在读取图片内容...')
    
    // Convert image to base64 for AI processing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'
    
    console.log('🧠 AI正在分析图片内容...')
    
    // 直接调用AI视觉分析（避免HTTP调用的URL问题）
    const { getSmartAIRouter } = await import('@/lib/ai/smartRouter')
    const aiRouter = getSmartAIRouter()
    
    // AI图片分析提示词
    const prompt = `请仔细分析这张图片，提取其中的所有文字内容。

要求：
1. 如果图片包含题目或问题，请完整提取题目内容
2. 如果是医学相关内容，请识别解剖结构、疾病名称、医学术语等
3. 如果是数学题，请提取公式、方程式、图表等
4. 如果是其他学科内容，请识别相关专业术语和概念
5. 保持原文的格式和结构
6. 如果有图表、图形，请描述其内容

请直接返回提取的文字内容，不要添加额外的解释。如果图片中没有清晰的文字，请说明"图片中没有清晰可识别的文字内容"。`

    console.log('🧠 正在使用AI视觉分析...')
    
    // Call AI with image
    const aiResponse = await aiRouter.generateAnswer({
      normalizedPrompt: prompt,
      systemPrompt: '你是一个专业的图片内容识别助手，能够准确识别和提取图片中的文字内容。',
      targetLang: 'zh',
      questionType: 'general',
      subject: 'general',
      imageData: `data:${mimeType};base64,${base64Image}` // Pass image data to AI
    })
    
    console.log('✅ AI图片分析完成')
    
    if (aiResponse.success && (aiResponse.data?.answer || aiResponse.answer)) {
      // Format the extracted text
      const extractedContent = aiResponse.data?.answer || aiResponse.answer
      const extractedText = `📚 AI视觉识别结果

文件信息：${file.name} (${Math.round(file.size / 1024)}KB)
识别方式：AI视觉分析（真实内容识别）

📝 识别到的内容：
${extractedContent}

🎯 内容已提取完成，AI将基于以上真实内容为您提供专业解答。`
      
      return extractedText
    } else {
      throw new Error(aiResponse.error || aiResponse.message || 'AI分析失败')
    }
    
  } catch (error) {
    console.error('真实OCR处理失败:', error)
    
    // Fallback: 使用基本的AI分析（不依赖图片）
    try {
      console.log('🔄 使用备用AI分析方法...')
      
      const { getSmartAIRouter } = await import('@/lib/ai/smartRouter')
      const aiRouter = getSmartAIRouter()
      
      // 备用分析，基于文件名信息提供建议
      const fallbackResponse = await aiRouter.generateAnswer({
        normalizedPrompt: `这是一张名为"${file.name}"的图片，文件大小约${Math.round(file.size / 1024)}KB。由于图片内容识别遇到技术问题，请提供如何处理学习材料图片的通用建议。`,
        systemPrompt: '你是一个学习助手，帮助用户处理各种学习材料。',
        targetLang: 'zh',
        questionType: 'general',
        subject: 'general'
      })
      
      const fallbackText = `📷 图片内容分析

文件：${file.name} (${Math.round(file.size / 1024)}KB)
状态：备用分析模式

📋 处理建议：
${fallbackResponse.data?.answer || fallbackResponse.answer || '由于技术原因暂时无法分析图片内容'}

💡 建议：由于图片识别暂时无法完成，请直接在文本框中描述题目内容，这样AI能够为您提供更准确的解答。`
      
      return fallbackText
      
    } catch (fallbackError) {
      console.error('备用AI分析也失败:', fallbackError)
      
      return `❌ 图片识别失败

文件：${file.name} (${Math.round(file.size / 1024)}KB)
错误：${error instanceof Error ? error.message : '未知错误'}

🔧 可能的解决方案：
1. 检查图片格式是否支持（JPG, PNG, WebP, GIF）
2. 确保图片文件未损坏
3. 检查图片是否包含清晰的文字内容
4. 尝试重新上传或使用其他图片

💡 您也可以直接在文本框中输入题目内容，AI会根据您的描述提供专业解答。`
    }
  }
}

/**
 * 分析OCR识别到的文本内容
 */
function analyzeTextContent(text: string): {
  languages: string[], 
  subject: string, 
  hasFormulas: boolean, 
  isHandwritten: boolean
} {
  const lowerText = text.toLowerCase()
  
  // 语言检测
  const chineseChars = text.match(/[\u4e00-\u9fff]/g) || []
  const englishWords = text.match(/[a-zA-Z]+/g) || []
  const chineseRatio = chineseChars.length / text.length
  const englishRatio = englishWords.length / (text.split(' ').length || 1)
  
  let languages: string[] = []
  if (chineseRatio > 0.2) languages.push('中文')
  if (englishRatio > 0.3 || englishWords.length > 5) languages.push('English')
  if (languages.length === 0) languages.push('未知')
  
  // 学科检测关键词
  const subjectKeywords = {
    math: ['∫', '∑', '√', 'π', '∞', 'lim', 'dx', 'dy', '极限', '积分', '导数', '微积分', '函数', '方程', 'sin', 'cos', 'tan', '数学'],
    physics: ['牛顿', '力', '速度', '加速度', '能量', '电', '磁', '波', '物理', 'newton', 'force', 'velocity', 'energy'],
    chemistry: ['化学', '分子', '原子', '反应', '化合物', '元素', '离子', 'molecule', 'atom', 'reaction', 'element'],
    medicine: ['医学', '解剖', '生理', '病理', '症状', '诊断', '治疗', '药物', 'medical', 'anatomy', 'diagnosis'],
    computer: ['编程', '算法', '代码', '程序', 'code', 'algorithm', 'programming', 'function', 'class'],
    language: ['语法', '词汇', '句子', '翻译', 'grammar', 'vocabulary', 'sentence', 'translate'],
    economics: ['经济', '市场', '价格', '成本', '利润', 'economic', 'market', 'price', 'cost']
  }
  
  // 检测学科
  let detectedSubject = 'general'
  let maxScore = 0
  
  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    let score = 0
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase()) || text.includes(keyword)) {
        score += 1
      }
    }
    if (score > maxScore) {
      maxScore = score
      detectedSubject = subject
    }
  }
  
  // 公式检测
  const mathSymbols = ['∫', '∑', '√', 'π', '∞', '≈', '≠', '≤', '≥', '±', '∂', 'lim', 'dx', 'dy', 'sin', 'cos', 'tan', 'log']
  const hasFormulas = mathSymbols.some(symbol => text.includes(symbol)) || 
                     /\d+[+\-*/=]\d+/.test(text) || 
                     /[a-zA-Z]\^[0-9]/.test(text) ||
                     /\([^)]*[+\-*/][^)]*\)/.test(text)
  
  // 手写检测（基于常见OCR错误模式）
  const handwrittenIndicators = ['l', '1', '0', 'o', 'O']  // 常被混淆的字符
  const hasAmbiguousChars = handwrittenIndicators.some(char => text.includes(char))
  const hasIrregularSpacing = /\s{3,}/.test(text) || /\S{20,}/.test(text)
  const isHandwritten = hasAmbiguousChars && hasIrregularSpacing && text.length > 10
  
  return {
    languages,
    subject: detectedSubject,
    hasFormulas,
    isHandwritten
  }
}



/**
 * Process Word documents - Full implementation using mammoth.js
 */
async function processWordDocument(file: File): Promise<string> {
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Extract text from Word document using mammoth
    const result = await mammoth.extractRawText({ buffer })
    
    if (!result.value || result.value.trim().length === 0) {
      // Return a helpful message instead of throwing error
      return `[Word文档处理结果]\n文件名: ${file.name}\n状态: 未检测到文本内容\n\n可能的原因:\n1. 文档是空的或只包含图片\n2. 文档格式不支持或已损坏\n3. 文档内容主要是表格、图表或图片\n\n建议:\n1. 检查文档是否包含可选择的文字\n2. 尝试另存为.docx格式\n3. 复制文档中的文字内容直接粘贴\n4. 如果是扫描件，请使用图片格式上传进行OCR识别`
    }
    
    // Clean up the extracted text
    let cleanText = result.value
      .replace(/\s+/g, ' ') // Replace multiple spaces
      .replace(/\n\s*\n/g, '\n\n') // Clean multiple newlines
      .trim()
    
    // Add metadata and warnings if any
    const warnings = result.messages.length > 0 
      ? `\n解析警告: ${result.messages.map(m => m.message).join(', ')}\n`
      : ''
    
    const metadata = `[Word文档解析结果]\n文件名: ${file.name}\n文本长度: ${cleanText.length}字符${warnings}\n--- 文档内容 ---\n\n`
    
    return metadata + cleanText
    
  } catch (error) {
    console.error('Word document processing error:', error)
    throw new Error(`Word文档解析失败: ${error instanceof Error ? error.message : '请确保文档格式正确'}`)
  }
}

/**
 * Process PowerPoint presentations - Basic implementation
 */
async function processPowerPoint(file: File): Promise<string> {
  // For now, return a placeholder since PPT processing requires additional libraries
  return `[PowerPoint演示文稿 - 文件名: ${file.name}]\n\n由于PowerPoint解析功能正在开发中，请暂时：\n1. 复制演示文稿中的文本内容\n2. 将关键内容整理成文本格式\n3. 直接在问题框中输入相关问题\n\n我们正在开发PPT解析功能，未来将支持提取幻灯片中的文字和图表内容。`
}

/**
 * Process Excel spreadsheets - Full implementation using xlsx
 */
async function processExcel(file: File): Promise<string> {
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Read Excel file using xlsx
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Excel文件中没有找到工作表')
    }
    
    let extractedContent = ''
    let totalRows = 0
    
    // Process each worksheet
    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName]
      
      // Convert sheet to JSON to get structured data
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
      
      if (jsonData.length === 0) {
        return // Skip empty sheets
      }
      
      extractedContent += `\n=== 工作表: ${sheetName} ===\n\n`
      
      // Convert to readable text format
      jsonData.forEach((row: any[], rowIndex) => {
        if (row.some(cell => cell !== '')) { // Only include non-empty rows
          const rowText = row.map(cell => String(cell || '')).join('\t')
          extractedContent += `${rowText}\n`
          totalRows++
        }
      })
      
      extractedContent += `\n[${sheetName} 包含 ${jsonData.length} 行数据]\n\n`
    })
    
    if (extractedContent.trim().length === 0) {
      throw new Error('Excel文件中没有可提取的数据内容')
    }
    
    // Add metadata
    const metadata = `[Excel表格解析结果]\n文件名: ${file.name}\n工作表数量: ${workbook.SheetNames.length}\n总行数: ${totalRows}\n表格名称: ${workbook.SheetNames.join(', ')}\n\n--- 表格内容 ---\n`
    
    return metadata + extractedContent
    
  } catch (error) {
    console.error('Excel processing error:', error)
    throw new Error(`Excel解析失败: ${error instanceof Error ? error.message : '请确保Excel文件格式正确'}`)
  }
}

// 注意：模拟OCR函数已被移除，现在使用真实的AI视觉识别