"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { 
  ArrowRight, 
  Zap, 
  Globe, 
  Trophy, 
  BookOpen, 
  Users, 
  Star,
  Check,
  Play,
  Brain,
  Target,
  Clock
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24">
        {/* 渐变背景动效 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-500/5 to-green-500/10 animate-pulse"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
        
        <div className="container relative z-10 max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-500 bg-clip-text text-transparent">
              你的 AI 学习伙伴
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            智能解析题目，快速掌握知识点。让学习变得更轻松、更高效。
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/quiz">
                <Button size="lg" className="px-12 py-4 text-lg bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  免费开始 <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" size="lg" className="px-12 py-4 text-lg border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300">
                <Play className="mr-3 h-5 w-5" />
                观看演示
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-16 flex justify-center items-center space-x-2"
          >
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-gray-600 font-semibold ml-3">4.9/5 来自 10,000+ 学生</span>
          </motion.div>
        </div>
      </section>

      {/* 功能亮点 */}
      <section className="px-6 py-24 bg-white">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                为什么选择 QuizMate？
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              我们的 AI 技术让学习变得更聪明、更高效
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="h-12 w-12" />,
                title: "AI 驱动的解析",
                description: "每道题目都有详细讲解，帮助你真正理解，而不是死记硬背。",
                gradient: "from-blue-500 to-purple-600"
              },
              {
                icon: <Globe className="h-12 w-12" />,
                title: "多语言支持",
                description: "支持英语、印尼语、菲律宾语、斯瓦西里语，未来更多。",
                gradient: "from-green-500 to-blue-500"
              },
              {
                icon: <Target className="h-12 w-12" />,
                title: "智能测验模式",
                description: "自动生成 Quiz，边学边练，提升记忆效率。",
                gradient: "from-purple-500 to-orange-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, boxShadow: "0px 20px 40px rgba(0,0,0,0.1)" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="text-center pb-4">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-4 mx-auto`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="px-6 py-24 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                从问题到答案，只需几秒钟
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              让 AI 帮你节省 70% 的学习时间。
            </p>
            
            <Card className="max-w-4xl mx-auto rounded-2xl shadow-2xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-green-500 p-6">
                <h3 className="text-white text-xl font-bold mb-4">🧮 AI 解析：</h3>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-white">
                  <p className="text-lg"><strong>示例题目：</strong>在一个直角三角形中，两条直角边分别为 3 和 4，斜边是多少？</p>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">使用勾股定理：</p>
                      <p className="text-gray-600">c² = a² + b²</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">所以 c = √(3² + 4²)</p>
                      <p className="text-gray-600">= √(9 + 16) = √25 = 5</p>
                    </div>
                  </div>
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl">
                    <p className="text-green-800 font-semibold">✅ 答案：斜边长度是 5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 学生评价 */}
      <section className="px-6 py-24 bg-white">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                深受全球学生信赖
              </span>
            </h2>
            <div className="flex justify-center items-center space-x-2 mb-8">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-2xl font-bold text-gray-800 ml-4">4.9/5</span>
            </div>
            <p className="text-lg text-gray-600">
              <Users className="inline-block mr-2 h-6 w-6" />
              已帮助 10,000+ 学生提高成绩
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quote: "「QuizMate 让我通过了期末考试！解析非常详细，比老师讲得还清楚。」",
                author: "⭐⭐⭐⭐⭐ 来自 Maria，菲律宾大学",
                gradient: "from-blue-500 to-purple-600"
              },
              {
                quote: "「现在我每天都用 QuizMate 复习，成绩提高了一大截！」",
                author: "⭐⭐⭐⭐⭐ 来自 Ahmad，印尼大学",
                gradient: "from-green-500 to-blue-500"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 h-full">
                  <CardContent className="p-8">
                    <div className={`h-1 w-20 bg-gradient-to-r ${testimonial.gradient} rounded-full mb-6`}></div>
                    <blockquote className="text-lg text-gray-700 leading-relaxed mb-6">
                      {testimonial.quote}
                    </blockquote>
                    <p className="text-gray-600 font-semibold">{testimonial.author}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 定价方案 */}
      <section className="px-6 py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                选择适合你的方案
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              从免费开始，随时升级到 Pro 版本
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 免费版 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 h-full">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-800">免费版</CardTitle>
                  <div className="text-4xl font-bold text-gray-600 mt-4">$0<span className="text-lg font-normal">/月</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "每日 3 次 AI 解析",
                    "基础题库访问（50题/日）",
                    "基础OCR图片识别",
                    "错题本功能",
                    "社区支持"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  <Button 
                    className="w-full mt-8 bg-gray-600 hover:bg-gray-700 text-white rounded-xl py-3"
                    onClick={() => window.location.href = '/auth/register'}
                  >
                    立即免费使用
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro版 - 高亮 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="rounded-2xl shadow-2xl transition-all duration-300 border-2 border-blue-500 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-4 py-2 rounded-bl-2xl">
                  <span className="font-bold">最受欢迎</span>
                </div>
                <CardHeader className="text-center pb-8 bg-gradient-to-br from-blue-50 to-purple-50">
                  <CardTitle className="text-2xl font-bold text-gray-800">Pro 高级版</CardTitle>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-4">
                    $4.99<span className="text-lg font-normal text-gray-600">/月</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "无限次 AI 解析",
                    "完整题库访问（1300+题）",
                    "SmartRouter AI 多模型",
                    "高级OCR + 图片解析",
                    "专业练习模式",
                    "学习统计报告",
                    "优先客服支持",
                    "离线练习模式"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  <Button 
                    className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => window.location.href = '/pricing'}
                  >
                    升级到 Pro
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24 bg-white">
        <div className="container max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                常见问题
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              快速了解 QuizMate 的功能特性
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  question: "QuizMate 如何工作？",
                  answer: "只需粘贴或上传你的题目，我们的 AI 会在几秒钟内提供详细的分步解析，并自动生成学习卡片帮助你记忆。"
                },
                {
                  question: "是否支持上传 PDF 试卷？",
                  answer: "是的！Pro 用户可以直接上传 PDF 文件，我们的系统会自动识别并解析其中的题目。"
                },
                {
                  question: "支持哪些语言？",
                  answer: "目前支持英语、印尼语、菲律宾语、斯瓦西里语，我们正在持续添加更多语言支持。"
                },
                {
                  question: "如何取消订阅？",
                  answer: "你可以随时在账户设置中取消订阅，取消后仍可使用到当前付费周期结束。"
                }
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-2xl px-6">
                  <AccordionTrigger className="text-left text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 bg-gradient-to-r from-blue-600 to-green-500 text-white">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              准备好提升你的学习效率了吗？
            </h2>
            <p className="text-xl mb-8 opacity-90">
              加入数万名学生，开始你的 AI 学习之旅
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/auth/register">
                <Button size="lg" className="px-12 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  立即免费开始 <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-6 py-16">
        <div className="container max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  测验伴侣
                </span>
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                您的人工智能学习伙伴。通过即时解释和闪卡将问题转化为知识。
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white">📘</span>
                </div>
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white">🐦</span>
                </div>
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white">📷</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-blue-400">产品</h4>
              <ul className="space-y-2">
                <li><Link href="/quiz" className="text-gray-400 hover:text-white transition-colors">AI 解析</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">学习空间</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">定价方案</Link></li>
                <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">特征</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-green-400">支持</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">帮助中心</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">联系我们</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">隐私政策</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">服务条款</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 年测验伴侣。版权所有。让学习变得更简单
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}