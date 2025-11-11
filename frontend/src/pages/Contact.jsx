import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

export default function Contact() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // In real app, this would send to API
    alert(t('contact.success'))
    setFormData({ name: '', email: '', phone: '', message: '' })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('contact.title')}</h1>
        <p className="text-lg text-muted-foreground">
          เรายินดีที่จะรับฟังจากคุณ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('contact.title')}</CardTitle>
              <CardDescription>
                กรอกแบบฟอร์มด้านล่างเพื่อติดต่อเรา
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('contact.name')}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">{t('contact.email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t('contact.phone')}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">{t('contact.message')}</Label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  {t('contact.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                {t('contact.phone')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-medium text-gray-900">094-4555697</p>
                <p className="text-sm text-muted-foreground">คุณ ไบรอัน (Sale Director)</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">090-7179607</p>
                <p className="text-sm text-muted-foreground">คุณ ใบเฟิร์น (Customer Service)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                ชื่อบริษัท
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-gray-900 mb-2">บริษัท ตี๋ใหญ่ อิมพอร์ต มาสเตอร์ จำกัด</p>
              <p className="text-sm text-muted-foreground">
                Teeyai Import Master Co., Ltd.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {t('contact.address')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                เลขที่ 40 ซอย 41/5<br />
                อาคารมีมี่อพาร์ทเม้น<br />
                ถนนเพชรเกษม<br />
                ตำบล หาดใหญ่ อำเภอหาดใหญ่<br />
                จังหวัดสงขลา 90110
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                เวลาทำการ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                จันทร์ - เสาร์: 09:00 - 18:00<br />
                อาทิตย์: ปิดทำการ
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12 max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.3!2d100.4747!3d7.0067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMDAnMjQuMSJOIDEwMMKwMjgnMjguOSJF!5e0!3m2!1sth!2sth!4v1234567890"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Company Location Map"
            ></iframe>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


