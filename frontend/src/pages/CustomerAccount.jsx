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
import { User, Package, LogOut, MapPin, Phone, Mail, Calendar, Hash, CheckCircle, Clock, Truck, Loader2, Eye, Plus, Edit, Trash2, Pencil } from 'lucide-react'
import apiClient from '@/lib/api'
import Swal from 'sweetalert2'

const statusTitleMap = {
  order_completed: 'ทำรายการสั่งซื้อสำเร็จ',
  china_in_transit: 'ระหว่างการขนส่งในประเทศจีน',
  overseas_warehouse: 'สินค้าเข้าโกดังสินค้าในต่างประเทศ เตรียมการส่งออก',
  expected_delivery: 'คาดการณ์ได้รับสินค้า',
  delivery_completed: 'จัดส่งสินค้าสำเร็จ ขอบคุณที่ใช้บริการ',
}

// Helper function to format expected date (same logic as admin tracking page)
const formatExpectedDate = (dateValue) => {
  if (!dateValue) return null
  
  try {
    // Parse date string - handle both YYYY-MM-DD and ISO format
    let dateStr = String(dateValue).trim()
    console.log('[formatExpectedDate] Input:', dateValue, 'String:', dateStr)
    if (!dateStr) return null
    
    // If it's an ISO string (contains 'T'), extract just the date part
    if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0]
      console.log('[formatExpectedDate] Extracted from ISO:', dateStr)
    }
    
    // Parse YYYY-MM-DD format directly without Date object
    const parts = dateStr.split('-')
    if (parts.length !== 3) {
      console.error('Invalid date format:', dateStr)
      return null
    }
    
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    const day = parseInt(parts[2], 10)
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      console.error('Invalid date values:', { year, month, day, dateStr })
      return null
    }
    
    // Calculate day of week using Zeller's congruence algorithm
    // Adjust month for algorithm (March = 3, February = 14)
    const m = month < 3 ? month + 12 : month
    const y = month < 3 ? year - 1 : year
    const k = y % 100
    const j = Math.floor(y / 100)
    // Zeller's formula: day of week (0=Saturday, 1=Sunday, ..., 6=Friday)
    let dayOfWeek = (day + Math.floor((13 * (m + 1)) / 5) + k + Math.floor(k / 4) + Math.floor(j / 4) - 2 * j) % 7
    // Convert to 0=Sunday, 1=Monday, ..., 6=Saturday
    if (dayOfWeek < 0) dayOfWeek += 7
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
    
    const thaiDays = [
      'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'
    ]
    
    const formatted = `${thaiDays[dayIndex]}ที่ ${day} ${thaiMonths[month - 1]} ${year + 543}`
    console.log('[formatExpectedDate] Parsed:', { year, month, day, dayIndex, dayName: thaiDays[dayIndex], formatted })
    return formatted
  } catch (error) {
    console.error('Error formatting date:', error, dateValue)
    return null
  }
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
  const [editingAddressId, setEditingAddressId] = useState(null)
  
  const [locationEditDialogOpen, setLocationEditDialogOpen] = useState(false)
  const [editingTrackingItem, setEditingTrackingItem] = useState(null)
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


  const handleViewDetail = (tracking) => {
    setSelectedTracking(tracking)
    setDialogOpen(true)
  }

  const handleEditLocation = (tracking) => {
    setEditingTrackingItem(tracking)
    setLocationEditDialogOpen(true)
    // Reset form
    setAddressForm({
      receiverName: '',
      receiverAddress: '',
      receiverPhone: '',
      shippingCompany: '',
    })
    setEditingAddressId(null)
    // Check if currentLocation matches any delivery address
    const matchedAddress = deliveryAddresses.find(
      addr => addr.receiverAddress === tracking.currentLocation
    )
    if (matchedAddress) {
      setAddressForm({
        receiverName: matchedAddress.receiverName,
        receiverAddress: matchedAddress.receiverAddress,
        receiverPhone: matchedAddress.receiverPhone,
        shippingCompany: matchedAddress.shippingCompany,
      })
      setEditingAddressId(matchedAddress.id)
    }
  }

  const handleSaveLocationAndAddress = async () => {
    if (!addressForm.receiverName || !addressForm.receiverAddress || !addressForm.receiverPhone || !addressForm.shippingCompany) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
        confirmButtonColor: '#f59e0b',
      })
      return
    }

    try {
      // Save or update delivery address
      let savedAddress
      if (editingAddressId) {
        await apiClient.put(`/api/delivery-addresses/${editingAddressId}`, addressForm)
        savedAddress = { ...addressForm, id: editingAddressId }
      } else {
        const { data } = await apiClient.post('/api/delivery-addresses/my', addressForm)
        savedAddress = data?.data
      }

      // Update tracking item location
      if (editingTrackingItem?.id) {
        try {
          await apiClient.put(
            `/api/customers/tracking/${editingTrackingItem.id}/location`,
            { currentLocation: savedAddress.receiverAddress }
          )
        } catch (locationError) {
          console.error('update location error', locationError)
          // If location update fails, still show success for address save
          Swal.fire({
            icon: 'warning',
            title: 'บันทึกที่อยู่สำเร็จ',
            text: 'แต่ไม่สามารถอัพเดตปลายทางได้: ' + (locationError?.response?.data?.message || 'เกิดข้อผิดพลาด'),
            confirmButtonColor: '#f59e0b',
          })
          loadDeliveryAddresses()
          fetchTrackingItems()
          setLocationEditDialogOpen(false)
          setEditingTrackingItem(null)
          setAddressForm({
            receiverName: '',
            receiverAddress: '',
            receiverPhone: '',
            shippingCompany: '',
          })
          setEditingAddressId(null)
          return
        }
      }

      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ!',
        text: 'บันทึกที่อยู่และอัพเดตปลายทางสำเร็จ',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true,
      })
      loadDeliveryAddresses() // Refresh delivery addresses
      fetchTrackingItems() // Refresh tracking items
      setLocationEditDialogOpen(false)
      setEditingTrackingItem(null)
      setAddressForm({
        receiverName: '',
        receiverAddress: '',
        receiverPhone: '',
        shippingCompany: '',
      })
      setEditingAddressId(null)
    } catch (error) {
      console.error('save location and address error', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'เกิดข้อผิดพลาด'
      console.error('Full error:', error)
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: 'ไม่สามารถบันทึกได้: ' + errorMessage,
        confirmButtonColor: '#ef4444',
      })
    }
  }

  const handleCancelLocationEdit = () => {
    setLocationEditDialogOpen(false)
    setEditingTrackingItem(null)
    setAddressForm({
      receiverName: '',
      receiverAddress: '',
      receiverPhone: '',
      shippingCompany: '',
    })
    setEditingAddressId(null)
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


          {/* Tracking Items Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>รายการสินค้าทั้งหมดของลูกค้าจากบัญชีผู้ใช้นี้</CardTitle>
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
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">ชื่อสินค้า</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">หมายเลขแทรคกิ้ง</th>
                        <th className="text-left p-3 text-sm font-semibold text-gray-700">ปลายทางจัดส่งสินค้า</th>
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
                            <span className="text-sm font-medium text-gray-900">{tracking.trackingNumber}</span>
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
                              <span className="flex-1">{tracking.currentLocation || '-'}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditLocation(tracking)}
                                className="h-6 w-6 hover:bg-blue-50"
                                title="แก้ไขที่อยู่ปลายทาง"
                              >
                                <Pencil className="h-3.5 w-3.5 text-blue-600" />
                              </Button>
                            </div>
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
              ความคืบหน้าการจัดส่ง
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
                    <p className="text-xs text-gray-500 mb-1">สถานะ</p>
                    <p className="font-semibold text-gray-900">
                      {statusTitleMap[selectedTracking.statusTitle] || selectedTracking.statusTitle}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">จำนวนขั้นตอน</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTracking.histories?.length || 0} ขั้น
                    </p>
                  </div>
                </div>
                {selectedTracking.statusTitle === 'expected_delivery' && selectedTracking.expectedDate && (() => {
                  const formattedDate = formatExpectedDate(selectedTracking.expectedDate)
                  if (!formattedDate) return null
                  
                  return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-xs text-yellow-700 font-semibold mb-1">คาดการณ์ได้รับสินค้า</p>
                          <p className="text-sm font-bold text-yellow-900">
                            {formattedDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })()}
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

      {/* Location Edit Dialog */}
      <Dialog open={locationEditDialogOpen} onOpenChange={setLocationEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6 text-green-600" />
              {editingAddressId ? 'แก้ไขที่อยู่ปลายทาง' : 'เพิ่มที่อยู่ปลายทาง'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editingTrackingItem && `หมายเลขแทรคกิ้ง: ${editingTrackingItem.trackingNumber}`}
            </DialogDescription>
          </DialogHeader>
          {editingTrackingItem && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dialogReceiverName">ชื่อ-ที่อยู่ผู้รับ *</Label>
                  <Input
                    id="dialogReceiverName"
                    value={addressForm.receiverName}
                    onChange={(e) => handleAddressFormChange('receiverName', e.target.value)}
                    placeholder="ชื่อ-นามสกุลผู้รับ"
                  />
                </div>
                <div>
                  <Label htmlFor="dialogReceiverAddress">ที่อยู่ *</Label>
                  <textarea
                    id="dialogReceiverAddress"
                    rows={3}
                    value={addressForm.receiverAddress}
                    onChange={(e) => handleAddressFormChange('receiverAddress', e.target.value)}
                    placeholder="ที่อยู่สำหรับจัดส่ง"
                    className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="dialogReceiverPhone">เบอร์โทร *</Label>
                  <Input
                    id="dialogReceiverPhone"
                    value={addressForm.receiverPhone}
                    onChange={(e) => handleAddressFormChange('receiverPhone', e.target.value)}
                    placeholder="เบอร์โทรศัพท์"
                  />
                </div>
                <div>
                  <Label htmlFor="dialogShippingCompany">ระบุชื่อขนส่งที่ต้องการเลือกใช้ *</Label>
                  <Input
                    id="dialogShippingCompany"
                    value={addressForm.shippingCompany}
                    onChange={(e) => handleAddressFormChange('shippingCompany', e.target.value)}
                    placeholder="พิมพ์ชื่อบริษัทขนส่งที่ต้องการ (เช่น Kerry Express, Flash Express)"
                  />
                  <p className="text-xs text-gray-500 mt-1">* พิมพ์ชื่อขนส่งที่คุณต้องการใช้บริการ</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={handleSaveLocationAndAddress}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {editingAddressId ? 'บันทึก' : 'เพิ่มที่อยู่'}
                </Button>
                <Button onClick={handleCancelLocationEdit} variant="outline">
                  ยกเลิก
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
