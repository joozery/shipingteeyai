import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Truck, Globe, ShoppingCart, FileCheck, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function Services() {
  const { t } = useTranslation()

  const services = [
    {
      icon: Globe,
      title: 'นำเข้า-ส่งออก สินค้าต่างประเทศ',
      description: 'บริการด้านการนำเข้าและส่งออกสินค้าระหว่างประเทศอย่างครบวงจร พร้อมทีมงานมืออาชีพคอยดูแลทุกขั้นตอน',
      color: 'blue',
      features: [
        'จัดการเอกสารการนำเข้า-ส่งออกครบถ้วน',
        'ประสานงานกับหน่วยงานที่เกี่ยวข้อง',
        'ติดตามสถานะสินค้าแบบเรียลไทม์',
        'ให้คำปรึกษาด้านกฎระเบียบการค้าระหว่างประเทศ'
      ],
    },
    {
      icon: ShoppingCart,
      title: 'บริการช่วยจัดซื้อ-จัดหา สินค้าจากต่างประเทศ',
      description: 'ช่วยคุณค้นหาและจัดซื้อสินค้าจากต่างประเทศ พร้อมตรวจสอบคุณภาพและเจรจาราคาที่ดีที่สุด',
      color: 'purple',
      features: [
        'ค้นหาและคัดสรรสินค้าตามความต้องการ',
        'ตรวจสอบคุณภาพสินค้าและโรงงาน',
        'เจรจาต่อรองราคาที่ดีที่สุด',
        'จัดการคำสั่งซื้อและติดตามการผลิต'
      ],
    },
    {
      icon: FileCheck,
      title: 'บริการตัวแทนดำเนินพิธีการศุลกากร',
      description: 'จัดการเอกสารและพิธีการศุลกากรอย่างถูกต้องตามกฎหมาย ลดความยุ่งยากในการนำเข้า-ส่งออก',
      color: 'green',
      features: [
        'จัดทำเอกสารศุลกากรครบถ้วน',
        'ยื่นเอกสารและชำระภาษี',
        'ประสานงานกับกรมศุลกากร',
        'ให้คำปรึกษาด้านภาษีและอากร'
      ],
    },
    {
      icon: Truck,
      title: 'บริการจองรถขนส่งภายในประเทศ',
      description: 'บริการจัดหารถขนส่งภายในประเทศทุกประเภท พร้อมระบบติดตามและประกันสินค้า',
      color: 'orange',
      features: [
        'รถขนส่งหลากหลายขนาดตามความต้องการ',
        'ครอบคลุมทุกพื้นที่ทั่วประเทศ',
        'ระบบติดตามตำแหน่งรถแบบเรียลไทม์',
        'ประกันสินค้าระหว่างการขนส่ง'
      ],
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4YzAgNi42MyAzLjU4IDEyLjQzIDguOTIgMTUuNThWNjBoMThWMzMuNThDMzIuNDIgMzAuNDMgMzYgMjQuNjMgMzYgMTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
        
        <div className="relative container mx-auto px-4 text-center animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
            <span className="text-sm font-semibold text-blue-700">✨ บริการของเรา</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-800 via-blue-600 to-blue-400 bg-clip-text text-transparent">
            บริการของเรา
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            บริการครบวงจรด้านการนำเข้า-ส่งออกและโลจิสติกส์ พร้อมทีมงานมืออาชีพคอยดูแลทุกขั้นตอน
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon
            const gradientColors = {
              blue: 'from-blue-700 to-blue-500',
              purple: 'from-purple-600 to-pink-500',
              green: 'from-green-600 to-emerald-500',
              orange: 'from-orange-600 to-amber-500',
            }
            const bgColors = {
              blue: 'from-blue-50 to-blue-100',
              purple: 'from-purple-50 to-pink-50',
              green: 'from-green-50 to-emerald-50',
              orange: 'from-orange-50 to-amber-50',
            }

            return (
              <Card 
                key={index} 
                className="group hover:shadow-premium-lg transition-all duration-500 hover:-translate-y-2 overflow-hidden border-0 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${bgColors[service.color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <CardHeader className="relative">
                  <div className={`bg-gradient-to-br ${gradientColors[service.color]} rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative space-y-2">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                ทำไมต้องเลือกเรา
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                เราคือพันธมิตรที่เชื่อถือได้ในการนำเข้า-ส่งออกสินค้าของคุณ
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  value: '10+', 
                  label: 'ปีของประสบการณ์',
                  desc: 'ในวงการนำเข้า-ส่งออก'
                },
                { 
                  value: '1000+', 
                  label: 'ลูกค้าที่ไว้วางใจ',
                  desc: 'ทั้งในและต่างประเทศ'
                },
                { 
                  value: '24/7', 
                  label: 'บริการตลอด 24 ชั่วโมง',
                  desc: 'พร้อมให้คำปรึกษา'
                },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-premium-lg transition-all duration-300 animate-fade-in hover:-translate-y-1" 
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <p className="text-gray-900 font-semibold mb-1">{stat.label}</p>
                  <p className="text-sm text-muted-foreground">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
