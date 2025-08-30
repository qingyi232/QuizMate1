import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                服务条款
              </span>
            </h1>
            <p className="text-gray-600 text-lg">
              最后更新时间：2025年1月
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="prose prose-gray max-w-none p-8">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 服务协议的确认和接纳</h2>
                  <p className="text-gray-700 leading-relaxed">
                    欢迎使用QuizMate AI学习助手（以下简称"本服务"）。本服务由QuizMate团队（以下简称"我们"）提供。
                    您在使用本服务前，请仔细阅读本服务条款。您使用本服务即表示您同意遵守本服务条款的全部内容。
                    如果您不同意本服务条款的任何内容，请不要使用本服务。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 服务说明</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>QuizMate提供以下核心服务：</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>AI智能解题：利用先进的人工智能技术解析各学科题目</li>
                      <li>SmartRouter系统：智能选择最适合的AI模型进行分析</li>
                      <li>国际化题库：提供包含数学、科学、语言等7大学科的1300+题目</li>
                      <li>专业练习模式：完整的学习流程支持</li>
                      <li>错题本功能：自动保存和管理错误题目</li>
                      <li>学习统计：详细的学习进度分析</li>
                      <li>多语言支持：支持多种国际语言</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 用户注册和账户</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>3.1 您必须提供准确、完整、最新的注册信息。</p>
                    <p>3.2 您有责任保护您的账户密码安全，对于因密码泄露造成的损失，我们不承担责任。</p>
                    <p>3.3 一个邮箱地址只能注册一个账户。</p>
                    <p>3.4 您不得将账户转让、出售给他人使用。</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 付费服务和退款政策</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>4.1 <strong>订阅服务：</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>免费版：每日3次AI解析，50道题目访问，基础功能</li>
                      <li>Pro版：无限AI解析，完整题库，SmartRouter等高级功能</li>
                      <li>企业版：包含Pro版全部功能，额外提供批量管理、API接入等</li>
                    </ul>
                    <p>4.2 <strong>付款方式：</strong>我们接受信用卡、支付宝、微信支付等多种支付方式。</p>
                    <p>4.3 <strong>退款政策：</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>新用户可在购买后30天内申请无条件退款</li>
                      <li>退款将原路返回到您的支付方式</li>
                      <li>退款处理时间为5-10个工作日</li>
                      <li>滥用退款政策的用户可能会被限制服务</li>
                    </ul>
                    <p>4.4 <strong>自动续费：</strong>订阅服务会自动续费，您可以随时在设置中取消。</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. 用户行为规范</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>使用本服务时，您不得：</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>上传恶意代码、病毒或其他有害内容</li>
                      <li>侵犯他人的知识产权、隐私权或其他权利</li>
                      <li>发布违法、欺诈、诽谤、骚扰或其他不当内容</li>
                      <li>尝试破解、攻击或干扰我们的服务</li>
                      <li>使用自动化工具恶意访问服务</li>
                      <li>用于学术考试作弊或其他违规行为</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. 知识产权</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>6.1 本服务的所有内容，包括但不限于软件、题目、解析、设计、商标等，均受知识产权法保护。</p>
                    <p>6.2 您上传的内容，您保留所有权，但授权我们为提供服务的目的使用。</p>
                    <p>6.3 AI生成的解析内容仅供参考，不保证完全准确，请结合实际情况使用。</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. 免责声明</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>7.1 本服务按"现状"提供，我们不对服务的准确性、完整性、可靠性做出保证。</p>
                    <p>7.2 AI解析结果仅供学习参考，不得用于正式考试或学术评估。</p>
                    <p>7.3 我们不对因使用本服务造成的任何直接或间接损失承担责任。</p>
                    <p>7.4 服务可能因维护、升级或其他原因暂时中断，我们将尽力提前通知。</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. 隐私保护</h2>
                  <p className="text-gray-700 leading-relaxed">
                    我们重视您的隐私保护。关于我们如何收集、使用和保护您的个人信息，
                    请查看我们的<a href="/privacy" className="text-blue-600 hover:underline">隐私政策</a>。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. 服务变更和终止</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>9.1 我们保留随时修改或终止服务的权利。</p>
                    <p>9.2 重要变更会提前30天通知用户。</p>
                    <p>9.3 您可以随时删除账户终止使用服务。</p>
                    <p>9.4 我们可能因违规行为暂停或终止您的账户。</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. 争议解决</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>10.1 本协议适用中华人民共和国法律。</p>
                    <p>10.2 因本协议引起的争议，双方应友好协商解决。</p>
                    <p>10.3 协商不成的，提交有管辖权的人民法院审理。</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. 联系方式</h2>
                  <div className="text-gray-700 leading-relaxed space-y-2">
                    <p>如果您对本服务条款有任何疑问，请通过以下方式联系我们：</p>
                    <ul className="list-none space-y-1 ml-4">
                      <li>📧 技术支持：shenqingyi16@gmail.com</li>
                      <li>📧 客服邮箱：3123155744@qq.com</li>
                    </ul>
                  </div>
                </section>

                <section className="border-t pt-6">
                  <p className="text-sm text-gray-500 text-center">
                    本服务条款自2025年1月生效。我们保留在法律允许的范围内修改本条款的权利。
                    修改后的条款将在网站上公布，继续使用服务即表示接受修改后的条款。
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}