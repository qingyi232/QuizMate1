# 🎨 QuizMate Logo 和品牌替换完整指南

## 📋 **替换清单**

根据项目分析，需要在以下位置替换logo和品牌信息：

### 🔧 **方案一：使用图片Logo（推荐）**

#### 1. **准备Logo文件**
将以下文件放入 `public/` 目录：
```
public/
├── logo.svg          # 主要logo (推荐使用SVG)
├── logo-32.png       # 32x32 小图标
├── logo-128.png      # 128x128 应用图标
├── favicon.ico       # 网站图标
└── apple-touch-icon.png # 苹果设备图标
```

#### 2. **已修改的文件**
✅ `src/components/navbar.tsx` - 导航栏logo  
✅ `src/components/footer.tsx` - 页脚logo  

#### 3. **还需要修改的文件**

##### 📄 **页面元数据** (`src/app/layout.tsx`)
```typescript
// 第 10-34 行，替换以下内容：
title: '您的品牌名称 - Your AI Study Buddy',
description: '您的产品描述...',
authors: [{ name: '您的公司名称' }],
creator: '您的公司名称',
publisher: '您的公司名称',
// ... 其他元数据
```

##### 🏠 **首页内容** (`src/app/(marketing)/page.tsx`)
需要替换的文本位置：
- 第 110 行：`为什么选择 您的品牌名称？`
- 第 252 行：客户评价中的品牌名称
- 第 395 行：`快速了解 您的品牌名称 的功能特性`

##### 💰 **定价页面** (`src/app/pricing/page.tsx`)
- 第 199 行：`为什么选择 您的品牌名称？`
- 第 241 行：`快速了解 您的品牌名称 的功能特性`

##### 📄 **法律页面**
- `src/app/terms/page.tsx` - 服务条款
- `src/app/privacy/page.tsx` - 隐私政策

##### 📧 **邮件模板和配置**
- `src/config/domesticPayment.ts` - 第 44 行短信签名
- 各种API响应和错误消息

---

### 🔧 **方案二：仅更换文字和符号**

如果您只想更换品牌名称和图标符号，不使用图片：

#### 1. **导航栏符号** (`src/components/navbar.tsx` 第58行)
```tsx
// 将 ⚡ 替换为您想要的符号
<span className="text-xl font-bold text-white">🚀</span>
// 或者其他符号: 🎯, 📚, 🧠, ⭐, 💡, 🔬, 📖
```

#### 2. **页脚图标** (`src/components/footer.tsx` 第13行)
```tsx
// 将 "Q" 替换为您的品牌首字母
<span className="text-lg font-bold text-white">Y</span>
```

---

### 📝 **完整替换步骤**

#### **步骤 1: 批量文本替换**
使用IDE的全局搜索替换功能：
- 搜索: `QuizMate`
- 替换: `您的品牌名称`

**⚠️ 注意：** 以下文件建议手动检查，避免误替换：
- 配置文件 (package.json, tsconfig.json)
- 数据库相关文件
- 测试文件

#### **步骤 2: 替换描述文本**
搜索并替换以下描述：
- `AI学习助手` → `您的产品定位`
- `Your AI Study Buddy` → `Your Product Tagline`
- `AI-powered study companion` → `Your Product Description`

#### **步骤 3: 更新联系信息**
在以下文件中更新联系方式：
- `src/app/terms/page.tsx`
- `src/app/privacy/page.tsx`
- `src/app/success/page.tsx`
- `DEPLOYMENT_GUIDE.md`

#### **步骤 4: 更新元数据**
```tsx
// src/app/layout.tsx
export const metadata: Metadata = {
  title: '您的品牌名称 - 您的标语',
  description: '您的产品描述...',
  keywords: ['您的关键词1', '您的关键词2'],
  authors: [{ name: '您的公司' }],
  // 更新所有相关字段
}
```

---

### 🎨 **视觉样式自定义**

#### **颜色主题**
如果您想更换品牌色彩，修改以下文件：
```css
/* tailwind.config.js */
theme: {
  extend: {
    colors: {
      primary: {
        // 您的主品牌色
        500: '#您的颜色代码',
        600: '#您的颜色代码',
      }
    }
  }
}
```

#### **渐变色调整**
在组件中搜索 `from-blue-600` 和 `to-green-500`，替换为您的品牌色：
```tsx
bg-gradient-to-r from-您的色彩-600 to-您的色彩-500
```

---

### 🔍 **完整检查清单**

- [ ] 准备logo文件并放置在public目录
- [ ] 更新导航栏logo和文字
- [ ] 更新页脚logo和文字  
- [ ] 更新页面title和description
- [ ] 更新首页内容
- [ ] 更新定价页面
- [ ] 更新法律页面
- [ ] 更新联系信息
- [ ] 更新配置文件中的品牌信息
- [ ] 测试所有页面显示效果
- [ ] 检查移动端适配
- [ ] 更新favicon和应用图标

---

### 🚀 **完成后测试**

1. 启动开发服务器：`npm run dev`
2. 检查以下页面：
   - 首页 (`/`)
   - 定价页 (`/pricing`)  
   - 题库页 (`/questions`)
   - 登录页 (`/auth/register`)
3. 检查移动端和桌面端显示效果
4. 确认所有logo和文字都已正确替换

---

### 📞 **需要帮助？**

如果在替换过程中遇到问题：

1. **检查文件路径** - 确保logo文件在正确位置
2. **清除缓存** - 删除`.next`文件夹，重新启动服务
3. **检查语法** - 确保没有引入语法错误
4. **逐步替换** - 建议一个文件一个文件地替换和测试

**完成这些步骤后，您的QuizMate就完全变成您自己的品牌了！** 🎉