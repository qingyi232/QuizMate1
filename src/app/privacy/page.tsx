import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                隐私政策
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
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">引言</h2>
                  <p className="text-gray-700 leading-relaxed">
                    QuizMate AI学习助手（以下简称"我们"或"本服务"）尊重并保护用户隐私。
                    本隐私政策详细说明了我们如何收集、使用、存储和保护您的个人信息。
                    使用本服务即表示您同意本隐私政策的内容。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 我们收集的信息</h2>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">1.1 您主动提供的信息</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>注册信息：邮箱地址、用户名、密码</li>
                    <li>个人资料：姓名、年级、学校（可选）</li>
                    <li>学习内容：上传的题目、图片、文档</li>
                    <li>联系信息：客服沟通中提供的信息</li>
                    <li>支付信息：信用卡信息（通过安全的第三方支付处理商处理）</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-6">1.2 自动收集的信息</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>设备信息：设备类型、操作系统、浏览器信息</li>
                    <li>使用数据：登录时间、功能使用情况、页面访问记录</li>
                    <li>技术数据：IP地址、Cookie、设备标识符</li>
                    <li>性能数据：加载时间、错误日志、崩溃报告</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-6">1.3 第三方服务收集的信息</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li>分析服务：Google Analytics、Mixpanel等</li>
                    <li>支付服务：Stripe、PayPal等</li>
                    <li>AI服务：OpenAI、Anthropic等（处理学习内容）</li>
                    <li>云存储：Amazon S3、Google Cloud等</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 信息使用目的</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>我们使用收集的信息用于：</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>提供服务：</strong>处理您的题目，生成AI解析，管理您的账户</li>
                      <li><strong>个性化体验：</strong>根据您的学习历史推荐相关内容</li>
                      <li><strong>服务优化：</strong>分析使用模式，改进产品功能和性能</li>
                      <li><strong>安全保护：</strong>防范欺诈、滥用和安全威胁</li>
                      <li><strong>客户支持：</strong>响应您的咨询和技术支持请求</li>
                      <li><strong>法律合规：</strong>遵守适用的法律法规要求</li>
                      <li><strong>营销推广：</strong>发送产品更新、优惠信息（可选）</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibent text-gray-900 mb-4">3. 信息共享和披露</h2>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">3.1 我们不会出售您的个人信息</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    我们承诺不会向第三方出售、租赁或交易您的个人信息。
                  </p>

                  <h3 className="text-lg font-semibold text-gray-800 mb-3">3.2 有限共享情况</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    在以下情况下，我们可能会共享您的信息：
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
                    <li><strong>服务提供商：</strong>云服务、支付处理、邮件发送等服务商</li>
                    <li><strong>AI处理：</strong>将学习内容发送给AI服务商进行处理</li>
                    <li><strong>法律要求：</strong>根据法律、法规、法院命令的要求</li>
                    <li><strong>安全保护：</strong>防范欺诈、滥用或安全威胁</li>
                    <li><strong>业务转让：</strong>公司合并、收购或资产转让时</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-6">3.3 匿名化数据</h3>
                  <p className="text-gray-700 leading-relaxed">
                    我们可能会使用和共享匿名化、聚合的数据用于研究、分析和改进服务，
                    这些数据不会识别您的个人身份。
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 数据安全</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>我们采取多层次的安全措施保护您的信息：</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>传输安全：</strong>使用SSL/TLS加密所有数据传输</li>
                      <li><strong>存储安全：</strong>数据库加密，访问控制，安全备份</li>
                      <li><strong>访问控制：</strong>员工访问基于最小权限原则</li>
                      <li><strong>定期审计：</strong>安全评估、漏洞扫描、代码审查</li>
                      <li><strong>事件响应：</strong>24/7监控，快速事件响应流程</li>
                      <li><strong>第三方认证：</strong>遵循SOC2、ISO27001等安全标准</li>
                    </ul>
                    <p className="mt-4">
                      <strong>注意：</strong>虽然我们采取了合理的安全措施，但互联网传输和电子存储
                      无法保证100%安全。请妥善保管您的账户信息。
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. 数据保留</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>账户信息：</strong>账户活跃期间及删除后30天内保留</li>
                      <li><strong>学习记录：</strong>账户活跃期间保留，用于个性化服务</li>
                      <li><strong>支付记录：</strong>根据法律要求保留7年</li>
                      <li><strong>日志数据：</strong>通常保留12个月，用于安全和分析</li>
                      <li><strong>客服记录：</strong>保留2年，用于服务质量改进</li>
                    </ul>
                    <p className="mt-4">
                      您可以随时要求删除您的个人信息，我们会在合理时间内处理，
                      但可能需要保留某些信息以满足法律或商业要求。
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. 您的权利</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>根据适用法律，您享有以下权利：</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>访问权：</strong>查看我们持有的您的个人信息</li>
                      <li><strong>更正权：</strong>更正不准确或不完整的信息</li>
                      <li><strong>删除权：</strong>要求删除您的个人信息</li>
                      <li><strong>限制处理权：</strong>限制我们处理您的信息</li>
                      <li><strong>数据可携带权：</strong>获取您的数据副本</li>
                      <li><strong>反对权：</strong>反对我们处理您的信息</li>
                      <li><strong>撤回同意权：</strong>撤回之前给予的同意</li>
                    </ul>
                    <p className="mt-4">
                      要行使这些权利，请通过 privacy@quizmate.com 联系我们。
                      我们将在30天内回复您的请求。
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookie政策</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>我们使用Cookie和类似技术来：</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>必要Cookie：</strong>维持用户会话，保存登录状态</li>
                      <li><strong>性能Cookie：</strong>分析网站使用情况，优化性能</li>
                      <li><strong>功能Cookie：</strong>记住用户偏好和设置</li>
                      <li><strong>营销Cookie：</strong>展示相关广告和内容（可选）</li>
                    </ul>
                    <p className="mt-4">
                      您可以通过浏览器设置管理Cookie，但禁用某些Cookie可能会影响服务功能。
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. 国际数据传输</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>
                      我们的服务可能涉及将您的数据传输到其他国家或地区。
                      我们会确保这些传输符合适用的数据保护法律，并采取适当的保护措施。
                    </p>
                    <p>
                      对于从欧盟传输的数据，我们使用标准合同条款或其他合规机制
                      来确保数据保护水平。
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. 儿童隐私</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>
                      我们的服务面向13岁及以上的用户。我们不会故意收集13岁以下
                      儿童的个人信息。
                    </p>
                    <p>
                      如果您是家长或监护人，发现我们可能收集了您孩子的信息，
                      请立即联系我们，我们会尽快删除相关信息。
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. 政策变更</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>
                      我们可能会定期更新本隐私政策。重大变更会提前30天通过邮件或
                      网站公告的方式通知您。
                    </p>
                    <p>
                      继续使用我们的服务即表示您接受修改后的隐私政策。
                      建议您定期查看本页面以了解最新政策。
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. 联系我们</h2>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p>如果您对本隐私政策有任何疑问或要求，请联系我们：</p>
                    <ul className="list-none space-y-2 ml-4">
                      <li><strong>隐私邮箱：</strong>shenqingyi16@gmail.com</li>
                      <li><strong>客服邮箱：</strong>3123155744@qq.com</li>
                    </ul>
                    <p className="mt-4">
                      我们设有专门的数据保护团队负责处理隐私相关事务，
                      承诺在30天内回复您的询问。
                    </p>
                  </div>
                </section>

                <section className="border-t pt-6">
                  <p className="text-sm text-gray-500 text-center">
                    本隐私政策自2025年1月生效。我们会持续改进我们的隐私保护措施，
                    确保您的个人信息安全。感谢您对QuizMate的信任和支持。
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