import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Lightbulb } from 'lucide-react'

export default function About() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('about.title')}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {t('about.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <div className="bg-blue-600 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">{t('about.vision')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              เราตั้งเป้าหมายที่จะเป็นผู้นำในอุตสาหกรรมโลจิสติกส์ โดยมุ่งมั่นพัฒนาบริการที่มีคุณภาพและเชื่อถือได้สูงสุด
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader>
            <div className="bg-purple-600 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">{t('about.mission')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ให้บริการขนส่งที่รวดเร็ว ปลอดภัย และคุ้มค่า พร้อมสร้างความพึงพอใจสูงสุดให้แก่ลูกค้าทุกท่าน
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-50 rounded-lg p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">
            ทำไมต้องเลือกเรา
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
              <p className="text-muted-foreground">ปีของประสบการณ์</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">5000+</div>
              <p className="text-muted-foreground">ลูกค้าที่ไว้วางใจ</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">99%</div>
              <p className="text-muted-foreground">ความพึงพอใจของลูกค้า</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}




