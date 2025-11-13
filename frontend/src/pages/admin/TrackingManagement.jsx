import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, Package, Plus, Edit2, Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'
import apiClient from '@/lib/api'

const statusTitleOptions = [
  { value: 'order_completed', label: 'ทำรายการสั่งซื้อสำเร็จ' },
  { value: 'china_in_transit', label: 'ระหว่างการขนส่งในประเทศจีน' },
  { value: 'overseas_warehouse', label: 'สินค้าเข้าโกดังสินค้าในต่างประเทศ เตรียมการส่งออก' },
  { value: 'expected_delivery', label: 'คาดการณ์ได้รับสินค้า' },
  { value: 'delivery_completed', label: 'จัดส่งสินค้าสำเร็จ ขอบคุณที่ใช้บริการ' },
]

export default function TrackingManagement() {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [trackingItems, setTrackingItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  
  const [customers, setCustomers] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addSaving, setAddSaving] = useState(false)
  const [addForm, setAddForm] = useState({
    trackingNumber: '',
    customerId: '',
    productName: '',
    productQuantity: 1,
    status: 'pending',
    statusTitle: 'order_completed',
    expectedDate: '',
    currentLocation: '',
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [savingUpdate, setSavingUpdate] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [updateForm, setUpdateForm] = useState({
    status: '',
    statusTitle: 'order_completed',
    expectedDate: '',
    location: '',
    description: '',
  })

  useEffect(() => {
    const fetchTrackingItems = async () => {
      try {
        setLoading(true)
        setErrorMessage('')
        const { data } = await apiClient.get('/api/tracking')
        setTrackingItems(data?.data || [])
      } catch (error) {
        console.error('fetch tracking error', error)
        const message = error?.response?.data?.message || 'ไม่สามารถดึงข้อมูลรายการพัสดุได้'
        setErrorMessage(message)
      } finally {
        setLoading(false)
      }
    }

    fetchTrackingItems()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true)
      const { data } = await apiClient.get('/api/customers/all')
      setCustomers(data?.data || [])
    } catch (error) {
      console.error('fetch customers error', error)
    } finally {
      setLoadingCustomers(false)
    }
  }

  useEffect(() => {
    if (addDialogOpen) {
      fetchCustomers()
    }
  }, [addDialogOpen])

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return trackingItems
    return trackingItems.filter((item) => {
      return (
        item.trackingNumber?.toLowerCase().includes(term) ||
        item.customerName?.toLowerCase().includes(term) ||
        item.customerEmail?.toLowerCase().includes(term) ||
        item.status?.toLowerCase().includes(term) ||
        item.currentLocation?.toLowerCase().includes(term)
      )
    })
  }, [trackingItems, searchTerm])

  const resetAddForm = () => {
    setAddForm({
      trackingNumber: '',
      customerId: '',
      productName: '',
      productQuantity: 1,
      status: 'pending',
      statusTitle: 'order_completed',
      expectedDate: '',
      currentLocation: '',
    })
  }

  const handleAddFormChange = (field, value) => {
    setAddForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddItem = async () => {
    if (!addForm.trackingNumber || !addForm.customerId) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกหมายเลข TRACKING และเลือกลูกค้า',
        confirmButtonColor: '#f59e0b',
      })
      return
    }

    try {
      setAddSaving(true)
      const payload = {
        trackingNumber: addForm.trackingNumber.trim(),
        customerId: parseInt(addForm.customerId),
        productName: addForm.productName.trim() || null,
        productQuantity: parseInt(addForm.productQuantity) || 1,
        status: addForm.status,
        statusTitle: addForm.statusTitle,
        expectedDate: addForm.expectedDate || null,
        currentLocation: addForm.currentLocation || null,
      }
      
      console.log('[handleAddItem] Sending expectedDate:', payload.expectedDate, 'Type:', typeof payload.expectedDate)

      const { data } = await apiClient.post('/api/tracking', payload)
      const newItem = data?.data
      if (newItem) {
        setTrackingItems((prev) => [newItem, ...prev])
      }

      Swal.fire({
        icon: 'success',
        title: 'เพิ่มรายการสำเร็จ!',
        confirmButtonColor: '#10b981',
        timer: 1800,
        timerProgressBar: true,
      })

      setAddDialogOpen(false)
      resetAddForm()
    } catch (error) {
      console.error('add tracking error', error)
      const message = error?.response?.data?.message || 'ไม่สามารถเพิ่มรายการพัสดุได้'
      Swal.fire({
        icon: 'error',
        title: 'เพิ่มไม่สำเร็จ',
        text: message,
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setAddSaving(false)
    }
  }

  const handleUpdateStatus = (item) => {
    setCurrentItem(item)
    setUpdateForm({
      status: item.status || 'pending',
      statusTitle: item.statusTitle || 'order_completed',
      expectedDate: item.expectedDate || '',
      location: item.currentLocation || '',
      description: '',
    })
    setDialogOpen(true)
  }

  const handleSaveUpdate = async () => {
    if (!currentItem) return

    try {
      setSavingUpdate(true)
      const payload = {
        status: updateForm.status,
        statusTitle: updateForm.statusTitle,
        currentLocation: updateForm.location,
        expectedDate: updateForm.expectedDate || null,
        description: updateForm.description,
      }
      
      console.log('[handleSaveUpdate] Sending expectedDate:', payload.expectedDate, 'Type:', typeof payload.expectedDate)
      console.log('[handleSaveUpdate] updateForm.expectedDate:', updateForm.expectedDate)

      const { data } = await apiClient.put(`/api/tracking/${currentItem.id}`, payload)
      const updatedItem = data?.data
      if (updatedItem) {
        setTrackingItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
      }

      Swal.fire({
        icon: 'success',
        title: 'อัพเดตสถานะสำเร็จ!',
        confirmButtonColor: '#3b82f6',
        timer: 1800,
        timerProgressBar: true,
      })

      setDialogOpen(false)
      setCurrentItem(null)
    } catch (error) {
      console.error('update tracking error', error)
      const message = error?.response?.data?.message || 'ไม่สามารถอัพเดตสถานะพัสดุได้'
      Swal.fire({
        icon: 'error',
        title: 'อัพเดตไม่สำเร็จ',
        text: message,
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setSavingUpdate(false)
    }
  }

  const handleUpdateFormChange = (field, value) => {
    setUpdateForm((prev) => ({ ...prev, [field]: value }))
  }

  const renderDate = (value) => {
    if (!value) return '-'
    try {
      return new Date(value).toLocaleDateString('th-TH')
    } catch (err) {
      return value
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('admin.tracking')}</h1>
          <p className="text-muted-foreground">จัดการสถานะการขนส่งทั้งหมด</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มรายการใหม่
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการพัสดุทั้งหมด</CardTitle>
          <CardDescription>
            {loading ? 'กำลังโหลดข้อมูล...' : `ทั้งหมด ${trackingItems.length} รายการ`}
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาพัสดุ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 p-4 rounded-md border border-red-200 bg-red-50 text-sm text-red-600">
              {errorMessage}
            </div>
          )}
          {loading ? (
            <div className="py-10 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" /> กำลังโหลดข้อมูล...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>ยังไม่มีข้อมูลรายการพัสดุ</p>
              <Button onClick={() => setAddDialogOpen(true)} variant="outline" className="mt-4">
                เพิ่มรายการแรก
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="bg-primary/10 rounded-full p-2">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="font-semibold text-lg">{item.trackingNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.customerName} • {item.customerEmail}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1 text-right">
                        <p>สร้างเมื่อ: {renderDate(item.createdAt)}</p>
                        <p>อัปเดตล่าสุด: {renderDate(item.updatedAt)}</p>
                        {item.expectedDate && <p>คาดการณ์ได้รับ: {renderDate(item.expectedDate)}</p>}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-medium">
                        {statusTitleOptions.find((opt) => opt.value === item.statusTitle)?.label || '-'}
                      </span>
                      {item.currentLocation && (
                        <span className="text-muted-foreground">สถานที่ปัจจุบัน: {item.currentLocation}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(item)}
                      className="gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      แก้ไข
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Tracking Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>เพิ่มรายการพัสดุใหม่</DialogTitle>
            <DialogDescription>กรอกข้อมูลพัสดุและเลือกลูกค้าเพื่อติดตามสถานะ</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trackingNumber">หมายเลข TRACKING <span className="text-red-500">*</span></Label>
                <Input
                  id="trackingNumber"
                  value={addForm.trackingNumber}
                  onChange={(e) => handleAddFormChange('trackingNumber', e.target.value)}
                  placeholder="เช่น TRK123456789"
                />
              </div>
              <div>
                <Label htmlFor="customerId">USER ID ลูกค้า <span className="text-red-500">*</span></Label>
                <Select
                  value={addForm.customerId}
                  onValueChange={(value) => handleAddFormChange('customerId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCustomers ? "กำลังโหลด..." : "เลือกลูกค้า"} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.userId} - {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">ชื่อสินค้า</Label>
                <Input
                  id="productName"
                  value={addForm.productName}
                  onChange={(e) => handleAddFormChange('productName', e.target.value)}
                  placeholder="ระบุชื่อสินค้า"
                />
              </div>
              <div>
                <Label htmlFor="productQuantity">จำนวนของสินค้า</Label>
                <Input
                  id="productQuantity"
                  type="number"
                  min="1"
                  value={addForm.productQuantity}
                  onChange={(e) => handleAddFormChange('productQuantity', e.target.value)}
                  placeholder="1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="currentLocation">สถานที่จัดส่งสินค้า</Label>
              <Input
                id="currentLocation"
                value={addForm.currentLocation}
                onChange={(e) => handleAddFormChange('currentLocation', e.target.value)}
                placeholder="กรอกสถานที่จัดส่ง"
              />
            </div>
            <div>
              <Label htmlFor="statusTitle">หัวข้อสถานะ</Label>
              <Select
                value={addForm.statusTitle}
                onValueChange={(value) => handleAddFormChange('statusTitle', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหัวข้อสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  {statusTitleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expectedDate">คาดการณ์ได้รับสินค้า (วัน/เดือน/ปี)</Label>
              <Input
                id="expectedDate"
                type="date"
                value={addForm.expectedDate}
                onChange={(e) => handleAddFormChange('expectedDate', e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={addSaving}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAddItem} disabled={addSaving} className="gap-2">
              {addSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              เพิ่มรายการ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Tracking Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('admin.updateStatus')}</DialogTitle>
            <DialogDescription>
              {currentItem?.trackingNumber} - {currentItem?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="updateStatusTitle">หัวข้อสถานะ</Label>
              <Select
                value={updateForm.statusTitle}
                onValueChange={(value) => handleUpdateFormChange('statusTitle', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหัวข้อสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  {statusTitleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="updateLocation">สถานที่ปัจจุบัน</Label>
              <Input
                id="updateLocation"
                value={updateForm.location}
                onChange={(e) => handleUpdateFormChange('location', e.target.value)}
                placeholder="กรอกตำแหน่งล่าสุด"
              />
            </div>
            {updateForm.statusTitle === 'expected_delivery' && (
              <div>
                <Label htmlFor="updateExpectedDate">คาดการณ์ได้รับสินค้า (วัน/เดือน/ปี)</Label>
                <Input
                  id="updateExpectedDate"
                  type="date"
                  value={updateForm.expectedDate}
                  onChange={(e) => handleUpdateFormChange('expectedDate', e.target.value)}
                />
              </div>
            )}
            <div>
              <Label htmlFor="updateDescription">รายละเอียดเพิ่มเติม</Label>
              <textarea
                id="updateDescription"
                rows={3}
                value={updateForm.description}
                onChange={(e) => handleUpdateFormChange('description', e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="บันทึกรายละเอียดหรือหมายเหตุเพิ่มเติม"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={savingUpdate}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveUpdate} className="gap-2" disabled={savingUpdate}>
              {savingUpdate && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
