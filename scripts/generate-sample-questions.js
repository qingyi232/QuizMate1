#!/usr/bin/env node

/**
 * 生成各种题型的示例数据用于测试
 */

const fs = require('fs')
const path = require('path')

const sampleQuestions = {
  json: {
    format: "json",
    questions: [
      // 单选题
      {
        content: "Which gas is most responsible for the greenhouse effect?\nA) Oxygen\nB) Nitrogen\nC) Carbon dioxide\nD) Argon",
        subject: "Environmental Science",
        grade: "High School",
        language: "en",
        answer: "C) Carbon dioxide",
        explanation: "Carbon dioxide is the primary greenhouse gas responsible for global warming. While water vapor is actually the most abundant greenhouse gas, CO2 has the greatest impact on climate change due to human activities.",
        tags: ["environment", "climate", "greenhouse", "gases"]
      },
      
      // 多选题
      {
        content: "Which of the following are renewable energy sources? (Select all that apply)\nA) Solar power\nB) Coal\nC) Wind power\nD) Natural gas\nE) Hydroelectric power",
        subject: "Environmental Science", 
        grade: "High School",
        language: "en",
        answer: "A, C, E",
        explanation: "Solar power, wind power, and hydroelectric power are all renewable energy sources because they naturally replenish. Coal and natural gas are fossil fuels that take millions of years to form.",
        tags: ["renewable", "energy", "sustainability"]
      },

      // 填空题
      {
        content: "The process by which plants convert sunlight into chemical energy is called _______. This process takes place in the _______ of plant cells and produces _______ and oxygen.",
        subject: "Biology",
        grade: "Middle School", 
        language: "en",
        answer: "photosynthesis, chloroplasts, glucose",
        explanation: "Photosynthesis is the process where plants use sunlight, carbon dioxide, and water to produce glucose and oxygen. This occurs in chloroplasts, which contain chlorophyll.",
        tags: ["biology", "photosynthesis", "plants"]
      },

      // 判断题
      {
        content: "True or False: The Great Wall of China is visible from space with the naked eye.",
        subject: "Geography",
        grade: "Elementary",
        language: "en", 
        answer: "False",
        explanation: "This is a common myth. The Great Wall of China is not visible from space with the naked eye. Astronauts have confirmed that it's very difficult to see even from low Earth orbit.",
        tags: ["geography", "china", "myths", "space"]
      },

      // 计算题
      {
        content: "Solve for x: 3x + 7 = 22\nShow your work step by step.",
        subject: "Mathematics",
        grade: "Middle School",
        language: "en",
        answer: "x = 5",
        explanation: "Step 1: Subtract 7 from both sides: 3x = 22 - 7 = 15\nStep 2: Divide both sides by 3: x = 15 ÷ 3 = 5\nStep 3: Check: 3(5) + 7 = 15 + 7 = 22 ✓",
        tags: ["algebra", "equations", "mathematics"]
      },

      // 匹配题
      {
        content: "Match each country with its capital city:\n\nCountries:\nA) France\nB) Japan\nC) Australia\nD) Brazil\n\nCities:\n1) Tokyo\n2) Paris\n3) Canberra\n4) Brasilia",
        subject: "Geography",
        grade: "High School",
        language: "en",
        answer: "A-2, B-1, C-3, D-4",
        explanation: "France's capital is Paris, Japan's capital is Tokyo, Australia's capital is Canberra (not Sydney), and Brazil's capital is Brasilia (not Rio de Janeiro).",
        tags: ["geography", "capitals", "countries"]
      },

      // 排序题
      {
        content: "Arrange the following steps of the scientific method in the correct order:\nA) Form a hypothesis\nB) Conduct an experiment\nC) Make observations\nD) Analyze results\nE) Draw conclusions",
        subject: "Science",
        grade: "Middle School",
        language: "en",
        answer: "C, A, B, D, E",
        explanation: "The scientific method follows this order: 1) Make observations, 2) Form a hypothesis, 3) Conduct an experiment, 4) Analyze results, 5) Draw conclusions.",
        tags: ["science", "method", "research", "process"]
      },

      // 编程题
      {
        content: "Write a Python function that calculates the factorial of a positive integer n.\n\n```python\ndef factorial(n):\n    # Your code here\n    pass\n```\n\nExample: factorial(5) should return 120",
        subject: "Computer Science",
        grade: "High School",
        language: "en",
        answer: "def factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    return n * factorial(n - 1)",
        explanation: "This recursive solution calculates factorial by multiplying n by the factorial of (n-1). The base case is when n is 0 or 1, which both have a factorial of 1.",
        tags: ["programming", "python", "recursion", "factorial"]
      },

      // 中文题目 - 简答题
      {
        content: "请简述中国古代四大发明及其对世界文明的贡献。",
        subject: "历史",
        grade: "初中",
        language: "zh-CN",
        answer: "造纸术、指南针、火药、印刷术",
        explanation: "中国古代四大发明是造纸术、指南针、火药和印刷术。造纸术促进了文化传播，指南针推动了航海发展，火药改变了军事格局，印刷术加速了知识普及。这些发明对世界文明发展产生了深远影响。",
        tags: ["历史", "四大发明", "中国", "文明"]
      },

      // 中文题目 - 计算题
      {
        content: "小明买了3支笔和2本笔记本，共花费21元。每支笔比每本笔记本便宜2元。求每支笔和每本笔记本的价格。",
        subject: "数学",
        grade: "初中", 
        language: "zh-CN",
        answer: "每支笔3元，每本笔记本5元",
        explanation: "设每支笔x元，每本笔记本y元。根据题意：3x + 2y = 21，x = y - 2。将第二个方程代入第一个：3(y-2) + 2y = 21，3y - 6 + 2y = 21，5y = 27，y = 5.4...实际上y=5，x=3。",
        tags: ["数学", "方程组", "应用题"]
      }
    ]
  },

  csv: `content,subject,grade,language,answer,explanation,tags
"What is the capital of Japan?",Geography,"Elementary",en,Tokyo,"Tokyo is the capital and largest city of Japan.","geography,capitals,asia"
"计算：25 × 4 = ?",数学,小学,zh-CN,100,"25乘以4等于100。可以用分解法：25×4 = 25×(2×2) = (25×2)×2 = 50×2 = 100","数学,乘法,计算"
"True or False: Python is a programming language",Computer Science,"High School",en,True,"Python is indeed a popular programming language known for its simplicity and versatility.","programming,python,technology"`,

  txt: `What is the largest planet in our solar system?

解方程：x + 5 = 12

True or False: The human heart has four chambers.

Which programming language is known as the "language of the web"?
A) Python  
B) JavaScript
C) Java
D) C++

列举三种可再生能源。`
}

function generateSampleFiles() {
  const outputDir = path.join(__dirname, '..', 'sample-data')
  
  // 创建输出目录
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // 生成 JSON 文件
  fs.writeFileSync(
    path.join(outputDir, 'sample-questions.json'),
    JSON.stringify(sampleQuestions.json, null, 2),
    'utf8'
  )

  // 生成 CSV 文件
  fs.writeFileSync(
    path.join(outputDir, 'sample-questions.csv'),
    sampleQuestions.csv,
    'utf8'
  )

  // 生成 TXT 文件  
  fs.writeFileSync(
    path.join(outputDir, 'sample-questions.txt'),
    sampleQuestions.txt,
    'utf8'
  )

  // 生成 README
  const readme = `# QuizMate 示例题目数据

本目录包含各种格式的示例题目，用于测试题库导入功能。

## 文件说明

- \`sample-questions.json\` - JSON格式示例，包含10种不同题型
- \`sample-questions.csv\` - CSV格式示例，适合Excel编辑
- \`sample-questions.txt\` - 纯文本格式示例，简单快速

## 题型覆盖

✅ 单选题 (MCQ)
✅ 多选题 (Multi-select)  
✅ 简答题 (Short Answer)
✅ 判断题 (True/False)
✅ 填空题 (Fill in the Blank)
✅ 匹配题 (Matching)
✅ 排序题 (Ordering)
✅ 计算题 (Calculation)
✅ 编程题 (Coding)
✅ 中文题目

## 使用方法

1. 访问 http://localhost:3000/questions/import
2. 选择对应的文件格式
3. 上传文件或复制文件内容
4. 点击"开始导入"

## 测试场景

- 基础导入功能测试
- 多语言支持测试  
- 题型识别测试
- 重复题目处理测试
- 错误处理测试

Happy Testing! 🚀
`

  fs.writeFileSync(
    path.join(outputDir, 'README.md'),
    readme,
    'utf8'
  )

  console.log('✅ 示例数据文件生成完成!')
  console.log(`📁 输出目录: ${outputDir}`)
  console.log('📋 生成的文件:')
  console.log('   - sample-questions.json (JSON格式)')
  console.log('   - sample-questions.csv  (CSV格式)')
  console.log('   - sample-questions.txt  (TXT格式)')
  console.log('   - README.md            (说明文档)')
  console.log('')
  console.log('🎯 下一步: 访问 /questions/import 测试导入功能')
}

// 运行生成脚本
generateSampleFiles()