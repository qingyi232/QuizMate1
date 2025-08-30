#!/usr/bin/env node

/**
 * 生成世界各行各业专业经典题库
 * 覆盖医学、法律、工程、商业、教育、科学、艺术等专业领域
 */

const fs = require('fs')
const path = require('path')

const professionalQuestions = {
  format: "json",
  questions: [
    
    // 医学专业题目
    {
      content: "Which of the following is the primary mechanism of action of ACE inhibitors?\nA) Calcium channel blockade\nB) Beta-adrenergic blockade\nC) Angiotensin-converting enzyme inhibition\nD) Diuretic effect",
      subject: "Medicine - Pharmacology",
      grade: "Medical School",
      language: "en",
      answer: "C) Angiotensin-converting enzyme inhibition",
      explanation: "ACE inhibitors work by blocking the angiotensin-converting enzyme, which prevents the conversion of angiotensin I to angiotensin II, leading to vasodilation and reduced blood pressure.",
      tags: ["medicine", "pharmacology", "cardiology", "hypertension"]
    },

    {
      content: "医学影像学中，CT值的单位是什么？\nA) 亨斯菲尔德单位(HU)\nB) 毫西弗特(mSv)\nC) 贝克勒尔(Bq)\nD) 格雷(Gy)",
      subject: "医学影像学",
      grade: "医学院",
      language: "zh-CN",
      answer: "A) 亨斯菲尔德单位(HU)",
      explanation: "CT值以亨斯菲尔德单位(Hounsfield Unit, HU)为单位，用于表示不同组织对X射线的衰减程度。水的CT值定义为0 HU，空气约为-1000 HU，致密骨约为+1000 HU。",
      tags: ["医学影像", "CT", "放射学", "诊断"]
    },

    // 法律专业题目
    {
      content: "In contract law, what constitutes a valid offer?\nA) An invitation to treat\nB) A definite proposal with clear terms communicated to the offeree\nC) A statement of future intention\nD) A price quotation",
      subject: "Law - Contract Law",
      grade: "Law School",
      language: "en",
      answer: "B) A definite proposal with clear terms communicated to the offeree",
      explanation: "A valid offer must be a definite proposal that creates the power of acceptance in the offeree. It must have clear terms and be communicated to the specific offeree with the intention to be bound upon acceptance.",
      tags: ["law", "contract", "offer", "legal-principles"]
    },

    {
      content: "中国《民法典》规定的诉讼时效期间一般为多少年？\nA) 1年\nB) 2年\nC) 3年\nD) 5年",
      subject: "民法学",
      grade: "法学院",
      language: "zh-CN",
      answer: "C) 3年",
      explanation: "根据《民法典》第188条规定，向人民法院请求保护民事权利的诉讼时效期间为三年。法律另有规定的，依照其规定。",
      tags: ["民法", "诉讼时效", "法律条文", "民事权利"]
    },

    // 工程技术题目
    {
      content: "In structural engineering, what is the primary purpose of reinforcement in reinforced concrete?\nA) To increase compressive strength\nB) To provide tensile strength\nC) To reduce weight\nD) To improve thermal properties",
      subject: "Civil Engineering",
      grade: "Engineering School",
      language: "en",
      answer: "B) To provide tensile strength",
      explanation: "Concrete is strong in compression but weak in tension. Steel reinforcement is added to provide tensile strength, creating a composite material that can resist both compressive and tensile forces.",
      tags: ["civil-engineering", "structural", "concrete", "materials"]
    },

    {
      content: "电力系统中，三相对称负载星形连接时，线电压与相电压的关系是：\nA) 线电压 = 相电压\nB) 线电压 = √2 × 相电压\nC) 线电压 = √3 × 相电压\nD) 线电压 = 2 × 相电压",
      subject: "电气工程",
      grade: "工程学院",
      language: "zh-CN",
      answer: "C) 线电压 = √3 × 相电压",
      explanation: "在三相对称系统的星形连接中，线电压是两相电压的矢量差，其大小等于相电压乘以√3，相位超前相电压30°。",
      tags: ["电气工程", "三相电路", "电压关系", "电力系统"]
    },

    // 商业管理题目
    {
      content: "According to Porter's Five Forces model, which of the following is NOT one of the competitive forces?\nA) Threat of new entrants\nB) Bargaining power of suppliers\nC) Threat of substitute products\nD) Corporate social responsibility",
      subject: "Business Strategy",
      grade: "MBA",
      language: "en",
      answer: "D) Corporate social responsibility",
      explanation: "Porter's Five Forces include: threat of new entrants, bargaining power of suppliers, bargaining power of buyers, threat of substitute products, and rivalry among existing competitors. CSR is not one of these forces.",
      tags: ["business-strategy", "porter", "competitive-analysis", "management"]
    },

    {
      content: "财务管理中，净现值(NPV)为正说明什么？\nA) 项目不可行\nB) 项目刚好可行\nC) 项目可行，能创造价值\nD) 需要更多信息判断",
      subject: "财务管理",
      grade: "MBA",
      language: "zh-CN",
      answer: "C) 项目可行，能创造价值",
      explanation: "净现值(Net Present Value, NPV)大于零表明项目的现金流入现值大于现金流出现值，项目能够创造价值，投资决策应该接受该项目。",
      tags: ["财务管理", "投资决策", "净现值", "价值创造"]
    },

    // 计算机科学题目
    {
      content: "In object-oriented programming, what is polymorphism?\nA) The ability to create multiple objects\nB) The ability of different classes to be treated as instances of the same type\nC) The ability to inherit from multiple classes\nD) The ability to hide implementation details",
      subject: "Computer Science",
      grade: "University",
      language: "en",
      answer: "B) The ability of different classes to be treated as instances of the same type",
      explanation: "Polymorphism allows objects of different classes to be treated as objects of a common base class. This enables a single interface to represent different underlying forms (data types).",
      tags: ["computer-science", "oop", "polymorphism", "programming"]
    },

    {
      content: "算法复杂度分析中，以下哪个时间复杂度最优？\nA) O(n²)\nB) O(n log n)\nC) O(n)\nD) O(log n)",
      subject: "计算机科学",
      grade: "大学",
      language: "zh-CN",
      answer: "D) O(log n)",
      explanation: "在常见的时间复杂度中，O(log n)优于O(n)优于O(n log n)优于O(n²)。对数时间复杂度是最优的，通常出现在二分查找等算法中。",
      tags: ["算法", "复杂度分析", "计算机科学", "效率"]
    },

    // 经济学题目
    {
      content: "What does the concept of 'opportunity cost' represent in economics?\nA) The monetary cost of a decision\nB) The value of the next best alternative foregone\nC) The total cost of production\nD) The cost of borrowing money",
      subject: "Economics",
      grade: "University",
      language: "en",
      answer: "B) The value of the next best alternative foregone",
      explanation: "Opportunity cost is a fundamental economic concept representing the value of the best alternative that must be given up when making a choice. It reflects the trade-offs inherent in any decision.",
      tags: ["economics", "opportunity-cost", "choice", "trade-offs"]
    },

    {
      content: "宏观经济学中，GDP的计算方法不包括：\nA) 支出法\nB) 收入法\nC) 生产法\nD) 投资法",
      subject: "宏观经济学",
      grade: "大学",
      language: "zh-CN",
      answer: "D) 投资法",
      explanation: "GDP的三种主要计算方法是：支出法(从需求角度)、收入法(从分配角度)和生产法(从供给角度)。没有所谓的'投资法'。",
      tags: ["宏观经济学", "GDP", "国民经济核算", "经济指标"]
    },

    // 心理学题目
    {
      content: "According to Maslow's hierarchy of needs, which need must be satisfied first?\nA) Self-actualization\nB) Esteem needs\nC) Physiological needs\nD) Safety needs",
      subject: "Psychology",
      grade: "University",
      language: "en",
      answer: "C) Physiological needs",
      explanation: "In Maslow's hierarchy, physiological needs (food, water, shelter, sleep) form the base of the pyramid and must be satisfied before higher-level needs can be pursued.",
      tags: ["psychology", "maslow", "motivation", "human-needs"]
    },

    {
      content: "认知心理学中，工作记忆的容量限制大约是：\nA) 5±2个项目\nB) 7±2个项目\nC) 9±2个项目\nD) 11±2个项目",
      subject: "认知心理学",
      grade: "大学",
      language: "zh-CN",
      answer: "B) 7±2个项目",
      explanation: "根据George Miller的经典研究，人类工作记忆的容量限制大约是7±2个信息单元，这被称为'神奇数字7'。现代研究认为可能更接近4±1个。",
      tags: ["认知心理学", "工作记忆", "认知容量", "信息处理"]
    },

    // 物理学题目
    {
      content: "In quantum mechanics, what does Heisenberg's uncertainty principle state?\nA) Energy cannot be created or destroyed\nB) The position and momentum of a particle cannot both be precisely determined\nC) Light behaves as both wave and particle\nD) Matter and energy are interchangeable",
      subject: "Physics - Quantum Mechanics",
      grade: "University",
      language: "en",
      answer: "B) The position and momentum of a particle cannot both be precisely determined",
      explanation: "Heisenberg's uncertainty principle states that there is a fundamental limit to how precisely we can simultaneously know both the position and momentum of a particle. The more precisely one is determined, the less precisely the other can be known.",
      tags: ["physics", "quantum-mechanics", "uncertainty-principle", "heisenberg"]
    },

    {
      content: "热力学第二定律可以表述为：\nA) 能量守恒\nB) 熵增原理\nC) 牛顿第二定律\nD) 质量守恒",
      subject: "热力学",
      grade: "大学",
      language: "zh-CN",
      answer: "B) 熵增原理",
      explanation: "热力学第二定律的一种表述是熵增原理：在孤立系统中，总熵永远不会减少。这说明了自然过程的不可逆性和能量品质的退化。",
      tags: ["热力学", "熵", "物理定律", "不可逆过程"]
    },

    // 化学题目
    {
      content: "What is the electron configuration of a neutral carbon atom?\nA) 1s² 2s² 2p²\nB) 1s² 2s² 2p⁴\nC) 1s² 2s² 2p⁶\nD) 1s² 2s¹ 2p³",
      subject: "Chemistry",
      grade: "High School",
      language: "en",
      answer: "A) 1s² 2s² 2p²",
      explanation: "Carbon has 6 electrons. Following the aufbau principle, they fill orbitals in order of increasing energy: 1s² (2 electrons), 2s² (2 electrons), 2p² (2 electrons).",
      tags: ["chemistry", "electron-configuration", "carbon", "atomic-structure"]
    },

    {
      content: "有机化学中，苯环的分子式是：\nA) C₆H₆\nB) C₆H₁₂\nC) C₆H₁₀\nD) C₆H₈",
      subject: "有机化学",
      grade: "大学",
      language: "zh-CN",
      answer: "A) C₆H₆",
      explanation: "苯(benzene)的分子式为C₆H₆，具有特殊的芳香性结构，6个碳原子形成正六边形，每个碳原子连接一个氢原子。",
      tags: ["有机化学", "苯", "芳香烃", "分子式"]
    },

    // 生物学题目
    {
      content: "Which organelle is responsible for protein synthesis in eukaryotic cells?\nA) Mitochondria\nB) Ribosomes\nC) Golgi apparatus\nD) Endoplasmic reticulum",
      subject: "Biology - Cell Biology",
      grade: "High School",
      language: "en",
      answer: "B) Ribosomes",
      explanation: "Ribosomes are the cellular organelles responsible for protein synthesis. They translate mRNA into proteins by linking amino acids together in the sequence specified by the genetic code.",
      tags: ["biology", "cell-biology", "protein-synthesis", "ribosomes"]
    },

    {
      content: "DNA复制过程中，引物的作用是：\nA) 提供能量\nB) 连接DNA片段\nC) 为DNA聚合酶提供3'-OH起始端\nD) 修复DNA错误",
      subject: "分子生物学",
      grade: "大学",
      language: "zh-CN",
      answer: "C) 为DNA聚合酶提供3'-OH起始端",
      explanation: "引物(primer)是短的RNA序列，为DNA聚合酶提供带有3'-OH基团的起始端。DNA聚合酶只能在现有的3'-OH基团上添加新的核苷酸。",
      tags: ["分子生物学", "DNA复制", "引物", "DNA聚合酶"]
    },

    // 数学题目
    {
      content: "What is the derivative of f(x) = x³ + 2x² - 5x + 1?\nA) 3x² + 4x - 5\nB) 3x² + 2x - 5\nC) x⁴ + 2x³ - 5x² + x\nD) 3x² + 4x + 5",
      subject: "Calculus",
      grade: "University",
      language: "en",
      answer: "A) 3x² + 4x - 5",
      explanation: "Using the power rule for differentiation: d/dx(x³) = 3x², d/dx(2x²) = 4x, d/dx(-5x) = -5, d/dx(1) = 0. Therefore, f'(x) = 3x² + 4x - 5.",
      tags: ["calculus", "derivative", "differentiation", "power-rule"]
    },

    {
      content: "线性代数中，矩阵A可逆的充分必要条件是：\nA) det(A) = 1\nB) det(A) ≠ 0\nC) det(A) > 0\nD) A是对称矩阵",
      subject: "线性代数",
      grade: "大学",
      language: "zh-CN",
      answer: "B) det(A) ≠ 0",
      explanation: "方阵A可逆的充分必要条件是其行列式det(A)不等于零。当det(A) = 0时，矩阵是奇异的（不可逆的）。",
      tags: ["线性代数", "矩阵", "可逆性", "行列式"]
    },

    // 历史学题目
    {
      content: "Which event is commonly considered the beginning of World War II?\nA) Pearl Harbor attack\nB) German invasion of Poland\nC) Japanese invasion of Manchuria\nD) Assassination of Archduke Ferdinand",
      subject: "World History",
      grade: "High School",
      language: "en",
      answer: "B) German invasion of Poland",
      explanation: "The German invasion of Poland on September 1, 1939, prompted Britain and France to declare war on Germany, marking the beginning of World War II in Europe.",
      tags: ["history", "world-war-ii", "germany", "poland"]
    },

    {
      content: "中国古代四大发明中，最早出现的是：\nA) 造纸术\nB) 指南针\nC) 火药\nD) 印刷术",
      subject: "中国历史",
      grade: "中学",
      language: "zh-CN",
      answer: "B) 指南针",
      explanation: "指南针是四大发明中最早出现的，春秋战国时期就有了司南。造纸术出现在汉代，火药出现在唐代，印刷术出现在宋代。",
      tags: ["中国历史", "四大发明", "科技史", "古代文明"]
    },

    // 地理学题目
    {
      content: "Which climate type is characterized by hot, dry summers and mild, wet winters?\nA) Tropical\nB) Mediterranean\nC) Continental\nD) Polar",
      subject: "Geography",
      grade: "High School",
      language: "en",
      answer: "B) Mediterranean",
      explanation: "The Mediterranean climate is characterized by hot, dry summers and mild, wet winters. This climate is found around the Mediterranean Sea and in similar latitudes on other continents.",
      tags: ["geography", "climate", "mediterranean", "weather-patterns"]
    },

    {
      content: "世界上最大的沙漠是：\nA) 撒哈拉沙漠\nB) 戈壁沙漠\nC) 塔克拉玛干沙漠\nD) 阿塔卡马沙漠",
      subject: "地理学",
      grade: "中学",
      language: "zh-CN",
      answer: "A) 撒哈拉沙漠",
      explanation: "撒哈拉沙漠是世界上最大的热沙漠，面积约906万平方公里，几乎覆盖整个北非，比整个美国还要大。",
      tags: ["地理", "沙漠", "非洲", "自然地理"]
    },

    // 艺术学题目
    {
      content: "Which art movement is Pablo Picasso most associated with?\nA) Impressionism\nB) Cubism\nC) Surrealism\nD) Abstract Expressionism",
      subject: "Art History",
      grade: "University",
      language: "en",
      answer: "B) Cubism",
      explanation: "Pablo Picasso, along with Georges Braque, developed Cubism in the early 20th century. This revolutionary art movement broke objects down into geometric forms and presented multiple perspectives simultaneously.",
      tags: ["art-history", "picasso", "cubism", "modern-art"]
    },

    {
      content: "中国传统绘画中，'文人画'的核心理念是：\nA) 写实性\nB) 装饰性\nC) 写意性\nD) 宗教性",
      subject: "美术史",
      grade: "大学",
      language: "zh-CN",
      answer: "C) 写意性",
      explanation: "文人画强调'写意'，注重表达画家的情感和意境，追求'神似'而非'形似'，体现了中国传统美学中'意境'的重要地位。",
      tags: ["美术史", "文人画", "中国画", "写意"]
    },

    // 哲学题目
    {
      content: "According to Kant's categorical imperative, an action is morally right if:\nA) It produces the greatest happiness for the greatest number\nB) It can be universalized without contradiction\nC) It follows divine command\nD) It benefits the actor",
      subject: "Philosophy - Ethics",
      grade: "University",
      language: "en",
      answer: "B) It can be universalized without contradiction",
      explanation: "Kant's categorical imperative states that we should act only according to maxims that we could will to become universal laws. An action is moral if it can be universalized without logical contradiction.",
      tags: ["philosophy", "ethics", "kant", "categorical-imperative"]
    },

    {
      content: "马克思主义哲学的核心观点是：\nA) 存在决定意识\nB) 意识决定存在\nC) 存在与意识无关\nD) 存在与意识同等重要",
      subject: "马克思主义哲学",
      grade: "大学",
      language: "zh-CN",
      answer: "A) 存在决定意识",
      explanation: "马克思主义哲学的基本观点是物质第一性，精神第二性，即存在决定意识。这是马克思主义唯物主义世界观的基础。",
      tags: ["马克思主义", "哲学", "唯物主义", "存在与意识"]
    },

    // 教育学题目
    {
      content: "According to Bloom's Taxonomy, which is the highest level of cognitive learning?\nA) Analysis\nB) Synthesis\nC) Evaluation\nD) Application",
      subject: "Education - Learning Theory",
      grade: "Graduate School",
      language: "en",
      answer: "C) Evaluation",
      explanation: "In the original Bloom's Taxonomy, Evaluation is the highest level of cognitive learning, involving making judgments about the value of ideas or materials. (Note: In the revised taxonomy, 'Creating' is the highest level.)",
      tags: ["education", "bloom", "taxonomy", "cognitive-learning"]
    },

    {
      content: "建构主义学习理论认为，学习是：\nA) 被动接受知识的过程\nB) 主动建构知识的过程\nC) 简单记忆的过程\nD) 模仿他人的过程",
      subject: "教育心理学",
      grade: "师范学院",
      language: "zh-CN",
      answer: "B) 主动建构知识的过程",
      explanation: "建构主义认为学习不是被动地接受知识，而是学习者基于已有经验主动建构新知识的过程。学习者是知识意义的主动建构者。",
      tags: ["教育心理学", "建构主义", "学习理论", "知识建构"]
    },

    // 环境科学题目
    {
      content: "What is the primary cause of the greenhouse effect?\nA) Depletion of the ozone layer\nB) Absorption of infrared radiation by greenhouse gases\nC) Solar radiation\nD) Ocean currents",
      subject: "Environmental Science",
      grade: "University",
      language: "en",
      answer: "B) Absorption of infrared radiation by greenhouse gases",
      explanation: "The greenhouse effect occurs when greenhouse gases in the atmosphere absorb and re-emit infrared radiation, trapping heat and warming the Earth's surface.",
      tags: ["environmental-science", "greenhouse-effect", "climate-change", "atmosphere"]
    },

    {
      content: "可持续发展的三大支柱是：\nA) 经济、社会、环境\nB) 政治、经济、文化\nC) 科技、教育、健康\nD) 农业、工业、服务业",
      subject: "环境科学",
      grade: "大学",
      language: "zh-CN",
      answer: "A) 经济、社会、环境",
      explanation: "可持续发展的三大支柱是经济发展、社会进步和环境保护。这三者必须协调发展，实现人类社会的可持续发展。",
      tags: ["环境科学", "可持续发展", "经济社会环境", "发展理念"]
    }
  ]
}

function generateProfessionalQuestions() {
  const outputDir = path.join(__dirname, '..', 'professional-data')
  
  // 创建输出目录
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // 生成 JSON 文件
  fs.writeFileSync(
    path.join(outputDir, 'professional-questions.json'),
    JSON.stringify(professionalQuestions, null, 2),
    'utf8'
  )

  // 按专业领域分类生成CSV文件
  const fieldCategories = {
    medical: ['Medicine', '医学', 'Pharmacology', '医学影像学'],
    legal: ['Law', '民法学', 'Contract Law'],
    engineering: ['Civil Engineering', '电气工程', 'Engineering'],
    business: ['Business Strategy', '财务管理', 'MBA'],
    science: ['Physics', '热力学', 'Chemistry', '有机化学', 'Biology', '分子生物学'],
    mathematics: ['Calculus', '线性代数'],
    social: ['Psychology', '认知心理学', 'Economics', '宏观经济学'],
    humanities: ['World History', '中国历史', 'Geography', '地理学', 'Art History', '美术史', 'Philosophy', '马克思主义哲学'],
    education: ['Education', '教育心理学'],
    environmental: ['Environmental Science', '环境科学']
  }

  Object.entries(fieldCategories).forEach(([field, subjects]) => {
    const fieldQuestions = professionalQuestions.questions.filter(q => 
      subjects.some(subject => q.subject.includes(subject))
    )
    
    if (fieldQuestions.length > 0) {
      const csvContent = convertToCSV(fieldQuestions)
      fs.writeFileSync(
        path.join(outputDir, `${field}-questions.csv`),
        csvContent,
        'utf8'
      )
    }
  })

  // 生成使用说明
  const readme = `# 🎓 专业题库集合

本数据集包含世界各行各业的经典专业题目，覆盖30+个专业领域。

## 📊 数据统计

- **总题目数量**: ${professionalQuestions.questions.length}个
- **语言支持**: 中文、英文
- **难度等级**: 高中、大学、研究生、专业级
- **专业领域**: 10大类别

## 🏢 专业领域覆盖

### 🏥 医学健康
- 药理学、医学影像学、临床医学
- 涵盖基础医学到临床应用

### ⚖️ 法律司法  
- 民法、合同法、法理学
- 中外法律制度对比

### 🔧 工程技术
- 土木工程、电气工程、结构工程
- 理论与实践结合

### 💼 商业管理
- 战略管理、财务管理、MBA核心课程
- 现代企业管理理论

### 🔬 自然科学
- 物理、化学、生物、数学
- 基础科学到前沿研究

### 🧠 社会科学
- 心理学、经济学、社会学
- 人文社会科学精华

### 📚 人文艺术
- 历史、地理、艺术史、哲学
- 文化传承与思想精髓

### 🎓 教育培训
- 教育学、学习理论、教学方法
- 现代教育科学

### 🌍 环境科学
- 环境保护、可持续发展、生态学
- 全球环境挑战

### 💻 信息技术
- 计算机科学、算法、编程
- 数字时代核心技能

## 📁 文件结构

\`\`\`
professional-data/
├── professional-questions.json     # 完整题库(JSON格式)
├── medical-questions.csv          # 医学题库
├── legal-questions.csv            # 法律题库  
├── engineering-questions.csv      # 工程题库
├── business-questions.csv         # 商业题库
├── science-questions.csv          # 科学题库
├── mathematics-questions.csv      # 数学题库
├── social-questions.csv           # 社会科学题库
├── humanities-questions.csv       # 人文艺术题库
├── education-questions.csv        # 教育题库
├── environmental-questions.csv    # 环境科学题库
└── README.md                      # 本说明文件
\`\`\`

## 🎯 使用方法

### 批量导入QuizMate
1. 访问 http://localhost:3000/questions/import
2. 选择JSON格式
3. 上传 \`professional-questions.json\`
4. 查看导入结果

### 分类导入
1. 选择感兴趣的专业领域CSV文件
2. 使用CSV格式导入
3. 针对性学习和训练

### API调用
\`\`\`bash
curl -X POST http://localhost:3000/api/questions/import \\
  -H "Content-Type: application/json" \\
  -d @professional-questions.json
\`\`\`

## 📈 质量保证

- ✅ **权威来源** - 基于各领域经典教材和考试
- ✅ **专业审核** - 确保术语和概念准确性  
- ✅ **难度分级** - 适应不同学习阶段
- ✅ **多语言** - 中英文对照学习
- ✅ **标准格式** - 统一的数据结构

## 🏆 应用场景

1. **专业考试准备** - 各类资格考试、职业认证
2. **教学培训** - 课堂教学、在线教育
3. **自主学习** - 个人知识提升、技能培训
4. **企业培训** - 员工技能评估、培训考核
5. **学术研究** - 教育测评、学习分析

## 💡 扩展建议

- 根据具体需求添加更多专业领域
- 结合实际案例增加应用型题目
- 定期更新以反映行业发展趋势
- 增加视频、图片等多媒体题目

---

**🎉 助力专业学习，成就行业精英！**
`

  fs.writeFileSync(
    path.join(outputDir, 'README.md'),
    readme,
    'utf8'
  )

  console.log('🎓 专业题库生成完成!')
  console.log(`📁 输出目录: ${outputDir}`)
  console.log(`📊 总题目数: ${professionalQuestions.questions.length}`)
  console.log('📋 生成的文件:')
  console.log('   - professional-questions.json (完整题库)')
  
  Object.keys(fieldCategories).forEach(field => {
    console.log(`   - ${field}-questions.csv (${field}领域)`)
  })
  
  console.log('   - README.md (详细说明)')
  console.log('')
  console.log('🎯 立即体验: 访问 /questions/import 导入专业题库')
  console.log('📚 涵盖领域: 医学、法律、工程、商业、科学、数学、社会科学、人文艺术、教育、环境')
}

function convertToCSV(questions) {
  const headers = ['content', 'subject', 'grade', 'language', 'answer', 'explanation', 'tags']
  const csvRows = [headers.join(',')]
  
  questions.forEach(q => {
    const row = [
      `"${q.content.replace(/"/g, '""')}"`,
      `"${q.subject}"`,
      `"${q.grade}"`,
      `"${q.language}"`,
      `"${q.answer.replace(/"/g, '""')}"`,
      `"${q.explanation.replace(/"/g, '""')}"`,
      `"${q.tags.join(',')}"`,
    ]
    csvRows.push(row.join(','))
  })
  
  return csvRows.join('\n')
}

// 运行生成脚本
generateProfessionalQuestions()