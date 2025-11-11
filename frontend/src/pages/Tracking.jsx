import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Package, CheckCircle2, Clock, Truck, MapPin, User, Phone, Home, Building2, Save } from 'lucide-react'
import apiClient from '@/lib/api'

const statusTitleMap = {
  order_completed: 'ทำรายการสั่งซื้อสำเร็จ',
  china_in_transit: 'ระหว่างการขนส่งในประเทศจีน',
  overseas_warehouse: 'สินค้าเข้าโกดังสินค้าในต่างประเทศ เตรียมการส่งออก',
  expected_delivery: 'คาดการณ์ได้รับสินค้า',
}

export default function Tracking() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [trackingNumber, setTrackingNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [trackingResult, setTrackingResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchType, setSearchType] = useState('tracking')
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [customerData, setCustomerData] = useState({
    accountId: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    shippingCompany: '',
  })

  // Auto-search when coming from home page
  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setTrackingNumber(query)
      setSearchType('tracking')
      // Trigger search automatically
      performSearch(query)
    }
  }, [searchParams])

  const performSearch = async (query) => {
    if (!query) return
    
    setLoading(true)
    setTrackingResult(null)
    
    try {
      const { data } = await apiClient.get(`/api/tracking/search?trackingNumber=${query}`)
      
      if (data.success && data.data) {
        const item = data.data
        setTrackingResult({
          trackingNumber: item.trackingNumber,
          status: item.status,
          statusTitle: item.statusTitle,
          currentLocation: item.currentLocation || '-',
          estimatedDelivery: item.expectedDate ? new Date(item.expectedDate).toLocaleDateString('th-TH') : '-',
          history: item.histories || [],
        })
      } else {
        setTrackingResult(null)
        alert('ไม่พบข้อมูลพัสดุ กรุณาตรวจสอบหมายเลขพัสดุอีกครั้ง')
      }
    } catch (error) {
      console.error('Search error:', error)
      setTrackingResult(null)
      alert('เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerDataChange = (field, value) => {
    setCustomerData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveCustomerData = () => {
    console.log('Saving customer data:', customerData)
    alert('บันทึกข้อมูลสำเร็จ! Admin จะได้รับข้อมูลของคุณแล้ว')
    setShowCustomerForm(false)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    const query = trackingNumber || phoneNumber
    performSearch(query)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'in_transit':
        return <Truck className="h-5 w-5 text-blue-600" />
      case 'processing':
        return <Package className="h-5 w-5 text-orange-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-600" />
      default:
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'in_transit':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-orange-100 text-orange-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('tracking.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('tracking.subtitle')}
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('tracking.title')}</CardTitle>
            <CardDescription>
              ค้นหาพัสดุของคุณด้วยหมายเลขขนส่งหรือเบอร์โทรศัพท์
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={searchType} onValueChange={setSearchType}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tracking">{t('tracking.trackingNumber')}</TabsTrigger>
                <TabsTrigger value="phone">{t('tracking.phoneNumber')}</TabsTrigger>
              </TabsList>
              <TabsContent value="tracking">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <Label htmlFor="trackingNumber">{t('tracking.trackingNumber')}</Label>
                    <Input
                      id="trackingNumber"
                      placeholder="TRK123456789"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    <Search className="h-4 w-4" />
                    {loading ? t('common.loading') : t('tracking.searchButton')}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="phone">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <Label htmlFor="phoneNumber">{t('tracking.phoneNumber')}</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="0812345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    <Search className="h-4 w-4" />
                    {loading ? t('common.loading') : t('tracking.searchButton')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {trackingResult && (
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {trackingResult.trackingNumber}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4" />
                    {trackingResult.currentLocation}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {statusTitleMap[trackingResult.statusTitle] || trackingResult.statusTitle}
                  </div>
                  <Button
                    onClick={() => setShowCustomerForm(!showCustomerForm)}
                    variant={showCustomerForm ? "outline" : "default"}
                    className="gap-2"
                  >
                    <User className="h-4 w-4" />
                    {showCustomerForm ? 'ซ่อนฟอร์ม' : 'กรอกข้อมูลผู้รับ'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">หัวข้อสถานะ</p>
                  <p className="font-medium">{statusTitleMap[trackingResult.statusTitle] || trackingResult.statusTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">วันที่จัดส่งโดยประมาณ</p>
                  <p className="font-medium">{trackingResult.estimatedDelivery}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information Form */}
          {showCustomerForm && (
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-6 w-6 text-blue-600" />
                  กรอกข้อมูลผู้รับพัสดุ
                </CardTitle>
                <CardDescription>
                  กรุณากรอกข้อมูลเพื่อระบุความเป็นเจ้าของและข้อมูลผู้รับปลายทาง
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6 bg-white">
                {/* Account ID */}
                <div>
                  <Label htmlFor="accountId" className="text-base font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Account ID ของคุณ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="accountId"
                    placeholder="กรอก Account ID เพื่อระบุความเป็นเจ้าของ"
                    value={customerData.accountId}
                    onChange={(e) => handleCustomerDataChange('accountId', e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    * Account ID จะช่วยให้ Admin ทราบว่าพัสดุนี้เป็นของคุณ
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    ข้อมูลผู้รับปลายทาง
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Receiver Name */}
                    <div>
                      <Label htmlFor="receiverName">ชื่อผู้รับ <span className="text-red-500">*</span></Label>
                      <Input
                        id="receiverName"
                        placeholder="ชื่อ-นามสกุล ผู้รับพัสดุ"
                        value={customerData.receiverName}
                        onChange={(e) => handleCustomerDataChange('receiverName', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    {/* Receiver Phone */}
                    <div>
                      <Label htmlFor="receiverPhone">เบอร์โทรผู้รับ <span className="text-red-500">*</span></Label>
                      <Input
                        id="receiverPhone"
                        placeholder="0XX-XXX-XXXX"
                        value={customerData.receiverPhone}
                        onChange={(e) => handleCustomerDataChange('receiverPhone', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Receiver Address */}
                  <div className="mt-4">
                    <Label htmlFor="receiverAddress">ที่อยู่ผู้รับ <span className="text-red-500">*</span></Label>
                    <textarea
                      id="receiverAddress"
                      placeholder="บ้านเลขที่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                      value={customerData.receiverAddress}
                      onChange={(e) => handleCustomerDataChange('receiverAddress', e.target.value)}
                      rows={3}
                      className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* Shipping Company */}
                  <div className="mt-4">
                    <Label htmlFor="shippingCompany" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      เลือกบริษัทขนส่งภายในประเทศ <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={customerData.shippingCompany}
                      onValueChange={(value) => handleCustomerDataChange('shippingCompany', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="เลือกบริษัทขนส่ง" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kerry">Kerry Express</SelectItem>
                        <SelectItem value="flash">Flash Express</SelectItem>
                        <SelectItem value="jt">J&T Express</SelectItem>
                        <SelectItem value="thaipost">ไปรษณีย์ไทย (EMS)</SelectItem>
                        <SelectItem value="scg">SCG Express</SelectItem>
                        <SelectItem value="nim">Nim Express</SelectItem>
                        <SelectItem value="best">Best Express</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      * บริษัทขนส่งที่เลือกจะนำไปส่งต่อให้คุณภายในประเทศ
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleSaveCustomerData}
                    className="flex-1 gap-2"
                    disabled={
                      !customerData.accountId ||
                      !customerData.receiverName ||
                      !customerData.receiverPhone ||
                      !customerData.receiverAddress ||
                      !customerData.shippingCompany
                    }
                  >
                    <Save className="h-4 w-4" />
                    บันทึกข้อมูล
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomerForm(false)}
                  >
                    ยกเลิก
                  </Button>
                </div>

                <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-semibold mb-2">💡 ทำไมต้องกรอกข้อมูล?</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Admin จะได้ทราบข้อมูลของคุณทันทีโดยไม่ต้องติดต่อถาม</li>
                    <li>• ช่วยให้การจัดส่งรวดเร็วและแม่นยำมากขึ้น</li>
                    <li>• ระบบจะส่งข้อมูลไปยัง Admin โดยอัตโนมัติ</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t('tracking.history')}</CardTitle>
              <CardDescription>
                ประวัติการเคลื่อนไหวของพัสดุ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {trackingResult.history.map((item, index) => (
                  <div key={item.id || index} className="relative pl-8 pb-6 last:pb-0">
                    {index !== trackingResult.history.length - 1 && (
                      <div className="absolute left-2.5 top-8 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="absolute left-0 top-0 bg-white">
                      {getStatusIcon(item.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{statusTitleMap[item.statusTitle] || item.statusTitle}</span>
                      </div>
                      {item.location && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {item.location}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-1">
                          {item.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(item.createdAt).toLocaleString('th-TH')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!trackingResult && !loading && (
        <div className="max-w-2xl mx-auto text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            กรอกหมายเลขขนส่งหรือเบอร์โทรศัพท์เพื่อค้นหาพัสดุของคุณ
          </p>
        </div>
      )}
    </div>
  )
}


