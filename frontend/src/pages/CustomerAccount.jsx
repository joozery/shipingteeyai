import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { User, Package, LogOut, MapPin, Phone, Mail, Calendar, Hash, CheckCircle, Clock, Truck, Loader2, Eye, Plus, Edit, Trash2 } from 'lucide-react'
import apiClient from '@/lib/api'

const statusTitleMap = {
  order_completed: 'ทำรายการสั่งซื้อสำเร็จ',
  china_in_transit: 'ระหว่างการขนส่งในประเทศจีน',
  overseas_warehouse: 'สินค้าเข้าโกดังสินค้าในต่างประเทศ เตรียมการส่งออก',
  expected_delivery: 'คาดการณ์ได้รับสินค้า',
}

export default function CustomerAccount() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, token, loading, logout } = useAuth()

  const [profile, setProfile] = useState(null)
  const [trackingData, setTrackingData] = useState([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingTracking, setLoadingTracking] = useState(true)

  const [selectedTracking, setSelectedTracking] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const [deliveryAddresses, setDeliveryAddresses] = useState([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressForm, setAddressForm] = useState({
    receiverName: '',
    receiverAddress: '',
    receiverPhone: '',
    shippingCompany: '',
  })

  useEffect(() => {
    if (loading) return
    if (!user || !token || user.role !== 'customer') {
      logout()
      navigate('/login')
      return
    }

    fetchProfile()
    fetchTrackingItems()
    loadDeliveryAddresses()
  }, [user, token, loading])

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true)
      const { data } = await apiClient.get('/api/customers/profile')
      setProfile(data?.data || null)
    } catch (error) {
      console.error('fetch profile error', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const fetchTrackingItems = async () => {
    try {
      setLoadingTracking(true)
      const { data } = await apiClient.get('/api/customers/tracking')
      setTrackingData(data?.data || [])
    } catch (error) {
      console.error('fetch tracking error', error)
    } finally {
      setLoadingTracking(false)
    }
  }

  const loadDeliveryAddresses = async () => {
    try {
      const { data } = await apiClient.get('/api/delivery-addresses/my')
      setDeliveryAddresses(data?.data || [])
    } catch (error) {
      console.error('load delivery addresses error', error)
      setDeliveryAddresses([])
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleAddressFormChange = (field, value) => {
    setAddressForm(prev => ({ ...prev, [field]: value }))
  }

  const handleAddAddress = async () => {
    if (!addressForm.receiverName || !addressForm.receiverAddress || !addressForm.receiverPhone || !addressForm.shippingCompany) {
      alert('กรุณากรอกข้อมูลให้ครบทุกช่อง')
      return
    }

    try {
      await apiClient.post('/api/delivery-addresses/my', addressForm)
      alert('เพิ่มที่อยู่ปลายทางสำเร็จ')
      loadDeliveryAddresses()
      setAddressForm({
        receiverName: '',
        receiverAddress: '',
        receiverPhone: '',
        shippingCompany: '',
      })
      setShowAddressForm(false)
    } catch (error) {
      console.error('add address error', error)
      alert('ไม่สามารถเพิ่มที่อยู่ได้: ' + (error?.response?.data?.message || 'เกิดข้อผิดพลาด'))
    }
  }

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id)
    setAddressForm({
      receiverName: address.receiverName,
      receiverAddress: address.receiverAddress,
      receiverPhone: address.receiverPhone,
      shippingCompany: address.shippingCompany,
    })
    setShowAddressForm(true)
  }

  const handleUpdateAddress = async () => {
    if (!addressForm.receiverName || !addressForm.receiverAddress || !addressForm.receiverPhone || !addressForm.shippingCompany) {
      alert('กรุณากรอกข้อมูลให้ครบทุกช่อง')
      return
    }

    try {
      await apiClient.put(`/api/delivery-addresses/${editingAddressId}`, addressForm)
      alert('อัปเดตที่อยู่สำเร็จ')
      loadDeliveryAddresses()
      setAddressForm({
        receiverName: '',
        receiverAddress: '',
        receiverPhone: '',
        shippingCompany: '',
      })
      setShowAddressForm(false)
      setEditingAddressId(null)
    } catch (error) {
      console.error('update address error', error)
      alert('ไม่สามารถอัปเดตที่อยู่ได้: ' + (error?.response?.data?.message || 'เกิดข้อผิดพลาด'))
    }
  }

  const handleDeleteAddress = async (addressId) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบที่อยู่นี้?')) {
      try {
        await apiClient.delete(`/api/delivery-addresses/${addressId}`)
        alert('ลบที่อยู่สำเร็จ')
        loadDeliveryAddresses()
      } catch (error) {
        console.error('delete address error', error)
        alert('ไม่สามารถลบที่อยู่ได้: ' + (error?.response?.data?.message || 'เกิดข้อผิดพลาด'))
      }
    }
  }

  const handleCancelAddressForm = () => {
    setAddressForm({
      receiverName: '',
      receiverAddress: '',
      receiverPhone: '',
      shippingCompany: '',
    })
    setShowAddressForm(false)
    setEditingAddressId(null)
  }

  const handleViewDetail = (tracking) => {
    setSelectedTracking(tracking)
    setDialogOpen(true)
  }

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ดลูกค้า</h1>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>

          {/* Profile Card */}
          <Card className="mb-6 border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-lg">
                  {profile?.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">ยินดีต้อนรับกลับมา, ยาย สมชาย ไทย</p>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {profile?.name || user?.name || 'ผู้ใช้'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">หมายเลขบัญชี</p>
                        <p className="font-semibold text-gray-900">{profile?.user_id || user?.userId || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">เบอร์โทรศัพท์</p>
                        <p className="font-semibold text-gray-900">{profile?.phone || user?.phone || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Mail className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">อีเมล</p>
                        <p className="font-semibold text-gray-900 truncate">{profile?.email || user?.email || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <MapPin className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ที่อยู่</p>
                        <p className="font-semibold text-gray-900 text-sm line-clamp-2">เลขที่ 40 ซอย 41/5 อาคารมีมี่อพาร์ทเม้น ถนนเพชรเกษม ตำบล หาดใหญ่ อำเภอหาดใหญ่ จังหวัดสงขลา 90110</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Addresses Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>ที่อยู่สำหรับจัดส่งสินค้าปลายทาง</CardTitle>
                    <CardDescription>จัดการที่อยู่สำหรับรับสินค้า</CardDescription>
                  </div>
                </div>
                {!showAddressForm && (
                  <Button onClick={() => setShowAddressForm(true)} className="gap-2 bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4" />
                    เพิ่มที่อยู่ใหม่
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showAddressForm && (
                <Card className="mb-4 border-2 border-dashed border-green-300 bg-green-50">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-4 text-green-800">
                      {editingAddressId ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="receiverName">ชื่อ-ที่อยู่ผู้รับ *</Label>
                        <Input
                          id="receiverName"
                          value={addressForm.receiverName}
                          onChange={(e) => handleAddressFormChange('receiverName', e.target.value)}
                          placeholder="ชื่อ-นามสกุลผู้รับ"
                        />
                      </div>
                      <div>
                        <Label htmlFor="receiverAddress">ที่อยู่ *</Label>
                        <textarea
                          id="receiverAddress"
                          rows={3}
                          value={addressForm.receiverAddress}
                          onChange={(e) => handleAddressFormChange('receiverAddress', e.target.value)}
                          placeholder="ที่อยู่สำหรับจัดส่ง"
                          className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="receiverPhone">เบอร์โทร *</Label>
                        <Input
                          id="receiverPhone"
                          value={addressForm.receiverPhone}
                          onChange={(e) => handleAddressFormChange('receiverPhone', e.target.value)}
                          placeholder="เบอร์โทรศัพท์"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shippingCompany">ระบุชื่อขนส่งที่ต้องการเลือกใช้ *</Label>
                        <Input
                          id="shippingCompany"
                          value={addressForm.shippingCompany}
                          onChange={(e) => handleAddressFormChange('shippingCompany', e.target.value)}
                          placeholder="พิมพ์ชื่อบริษัทขนส่งที่ต้องการ (เช่น Kerry Express, Flash Express)"
                        />
                        <p className="text-xs text-gray-500 mt-1">* พิมพ์ชื่อขนส่งที่คุณต้องการใช้บริการ</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={editingAddressId ? handleUpdateAddress : handleAddAddress} className="flex-1 bg-green-600 hover:bg-green-700">
                        {editingAddressId ? 'บันทึก' : 'เพิ่มที่อยู่'}
                      </Button>
                      <Button onClick={handleCancelAddressForm} variant="outline">
                        ยกเลิก
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {deliveryAddresses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">ยังไม่มีที่อยู่ที่บันทึกไว้</p>
                  <p className="text-xs mt-1">กรุณา "เพิ่มที่อยู่ใหม่" เพื่อบันทึกที่อยู่สำหรับรับสินค้า</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliveryAddresses.map((addr) => (
                    <div key={addr.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-lg mb-2">{addr.receiverName}</p>
                          <p className="text-sm text-muted-foreground mb-1">{addr.receiverAddress}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            <Phone className="h-3 w-3 inline mr-1" />
                            {addr.receiverPhone}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            <Truck className="h-3 w-3 inline mr-1" />
                            {addr.shippingCompany}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditAddress(addr)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAddress(addr.id)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking Items Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>รายการพัสดุของลูกค้าจากหมายเลขบัญชีนี้</CardTitle>
                  <CardDescription>แสดงรายการที่สร้างทั้งหมดจากหมายเลขบัญชีนี้ ({trackingData.length} รายการ)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTracking ? (
                <div className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">กำลังโหลดรายการพัสดุ...</p>
                </div>
              ) : trackingData.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground mb-2">ยังไม่มีรายการพัสดุ</p>
                  <p className="text-sm text-muted-foreground">
                    กรุณา "เพิ่มรายการใหม่" เพื่อเริ่มติดตามสถานะสินค้าของท่าน
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">วันที่</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">TRACKING</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">สินค้าอยู่</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">ความคืบหน้า</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">สถานะ</th>
                        <th className="text-center p-3 text-sm font-semibold text-gray-700">ดูรายละเอียด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trackingData.map((tracking) => (
                        <tr key={tracking.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{new Date(tracking.createdAt).toLocaleDateString('th-TH')}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold text-blue-600">{tracking.trackingNumber}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{tracking.currentLocation || '-'}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-sm">{tracking.histories?.length || 0} ขั้น</span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-gray-700">
                              {statusTitleMap[tracking.statusTitle] || tracking.statusTitle}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewDetail(tracking)}
                              className="hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tracking Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              รายละเอียดพัสดุ
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              ข้อมูลและสถานะความเคลื่อนไหวของพัสดุ
            </DialogDescription>
          </DialogHeader>
          {selectedTracking && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">เลข Tracking</p>
                    <p className="font-bold text-blue-600 text-lg">
                      {selectedTracking.trackingNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">วันที่ทำรายการ</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedTracking.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ชื่อสินค้า</p>
                    <p className="font-semibold text-gray-900">
                      {statusTitleMap[selectedTracking.statusTitle] || selectedTracking.statusTitle}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">จำนวน</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTracking.histories?.length || 0} ขั้น
                    </p>
                  </div>
                </div>
              </div>

              {/* History Timeline */}
              <div>
                <h3 className="font-semibold text-base mb-4 flex items-center gap-2 text-gray-700">
                  <Clock className="h-5 w-5 text-blue-600" />
                  ความคืบหน้าการติดต่อสถานะ
                </h3>
                {selectedTracking.histories && selectedTracking.histories.length > 0 ? (
                  <div className="space-y-3">
                    {selectedTracking.histories.map((history, index) => {
                      const iconBgColor = index === 0 ? 'bg-green-500' : 
                                         index === 1 ? 'bg-blue-500' : 
                                         index === 2 ? 'bg-blue-400' : 
                                         'bg-orange-500'
                      
                      return (
                        <div 
                          key={history.id} 
                          className="bg-blue-50 rounded-lg p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`rounded-full p-2 ${iconBgColor}`}>
                                {index === 0 ? (
                                  <CheckCircle className="h-5 w-5 text-white" />
                                ) : index === 1 ? (
                                  <Truck className="h-5 w-5 text-white" />
                                ) : index === 2 ? (
                                  <Package className="h-5 w-5 text-white" />
                                ) : (
                                  <Clock className="h-5 w-5 text-white" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="font-semibold text-gray-900">
                                  {statusTitleMap[history.statusTitle] || history.statusTitle}
                                </p>
                                <p className="text-xs text-gray-500 whitespace-nowrap">
                                  {new Date(history.createdAt).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                  }) + ' ' + 
                                  new Date(history.createdAt).toLocaleTimeString('th-TH', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              {history.location && (
                                <p className="text-sm text-gray-600">
                                  {history.location}
                                </p>
                              )}
                              {history.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {history.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">ยังไม่มีประวัติการติดตาม</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
