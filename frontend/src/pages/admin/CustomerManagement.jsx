import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, Edit, Trash2, Key, Loader2, Users, MapPin, Eye, Plus, Phone as PhoneIcon, Truck } from 'lucide-react'
import Swal from 'sweetalert2'
import apiClient from '@/lib/api'

export default function CustomerManagement() {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [savingCustomer, setSavingCustomer] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordCustomer, setPasswordCustomer] = useState(null)
  const [newPassword, setNewPassword] = useState('')

  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [currentAddressCustomer, setCurrentAddressCustomer] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setErrorMessage('')
      const { data } = await apiClient.get('/api/customers/all')
      setCustomers(data?.data || [])
    } catch (error) {
      console.error('fetch customers error', error)
      const message = error?.response?.data?.message || 'ไม่สามารถดึงข้อมูลลูกค้าได้'
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return customers
    return customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(term) ||
        customer.email?.toLowerCase().includes(term) ||
        customer.phone?.includes(term) ||
        customer.user_id?.toLowerCase().includes(term)
      )
    })
  }, [customers, searchTerm])

  const handleEditCustomer = (customer) => {
    setCurrentCustomer(customer)
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
    })
    setDialogOpen(true)
  }

  const handleSaveCustomer = async () => {
    if (!formData.name || !formData.email) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกชื่อและอีเมลให้ครบถ้วน',
        confirmButtonColor: '#f59e0b',
      })
      return
    }

    if (!currentCustomer) return

    try {
      setSavingCustomer(true)
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
      }

      const { data } = await apiClient.put(`/api/customers/${currentCustomer.id}`, payload)
      const updated = data?.data
      if (updated) {
        setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      }

      Swal.fire({
        icon: 'success',
        title: 'อัพเดตข้อมูลสำเร็จ!',
        confirmButtonColor: '#10b981',
        timer: 1800,
        timerProgressBar: true,
      })

      setDialogOpen(false)
      setCurrentCustomer(null)
    } catch (error) {
      console.error('update customer error', error)
      const message = error?.response?.data?.message || 'ไม่สามารถอัพเดตข้อมูลลูกค้าได้'
      Swal.fire({
        icon: 'error',
        title: 'อัพเดตไม่สำเร็จ',
        text: message,
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setSavingCustomer(false)
    }
  }

  const handleResetPassword = (customer) => {
    setPasswordCustomer(customer)
    setNewPassword('')
    setPasswordDialogOpen(true)
  }

  const handleConfirmResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'รหัสผ่านไม่ถูกต้อง',
        text: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร',
        confirmButtonColor: '#f59e0b',
      })
      return
    }

    if (!passwordCustomer) return

    try {
      setChangingPassword(true)
      await apiClient.post(`/api/customers/${passwordCustomer.id}/reset-password`, {
        newPassword,
      })

      Swal.fire({
        icon: 'success',
        title: 'เปลี่ยนรหัสผ่านสำเร็จ!',
        confirmButtonColor: '#10b981',
        timer: 1800,
        timerProgressBar: true,
      })

      setPasswordDialogOpen(false)
      setPasswordCustomer(null)
      setNewPassword('')
    } catch (error) {
      console.error('reset password error', error)
      const message = error?.response?.data?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้'
      Swal.fire({
        icon: 'error',
        title: 'เปลี่ยนรหัสผ่านไม่สำเร็จ',
        text: message,
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleViewAddresses = async (customer) => {
    setCurrentAddressCustomer(customer)
    setAddressDialogOpen(true)
    setLoadingAddresses(true)
    setAddresses([])
    
    try {
      const { data } = await apiClient.get(`/api/delivery-addresses/customer/${customer.id}`)
      setAddresses(data?.data || [])
    } catch (error) {
      console.error('fetch addresses error', error)
      setAddressDialogOpen(false) // Close dialog before showing alert
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถดึงข้อมูลที่อยู่ได้',
        text: error?.response?.data?.message || 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setLoadingAddresses(false)
    }
  }

  const handleDeleteCustomer = (customer) => {
    Swal.fire({
      icon: 'warning',
      title: 'ยืนยันการลบ',
      text: `คุณแน่ใจหรือไม่ที่จะลบลูกค้า "${customer.name}"?`,
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/api/customers/${customer.id}`)
          setCustomers((prev) => prev.filter((c) => c.id !== customer.id))

          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ!',
            confirmButtonColor: '#10b981',
            timer: 1800,
            timerProgressBar: true,
          })
        } catch (error) {
          console.error('delete customer error', error)
          const message = error?.response?.data?.message || 'ไม่สามารถลบลูกค้าได้'
          Swal.fire({
            icon: 'error',
            title: 'ลบไม่สำเร็จ',
            text: message,
            confirmButtonColor: '#ef4444',
          })
        }
      }
    })
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
          <h1 className="text-3xl font-bold mb-2">{t('admin.customers')}</h1>
          <p className="text-muted-foreground">จัดการข้อมูลลูกค้าทั้งหมด</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อลูกค้าทั้งหมด</CardTitle>
          <CardDescription>
            {loading ? 'กำลังโหลดข้อมูล...' : `ทั้งหมด ${customers.length} คน`}
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาลูกค้า..."
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
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>ยังไม่มีข้อมูลลูกค้า</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="bg-primary/10 rounded-full p-2">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="font-semibold text-lg">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          User ID: {customer.user_id} • {customer.email}
                        </p>
                        {customer.phone && (
                          <p className="text-sm text-muted-foreground">โทร: {customer.phone}</p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1 text-right">
                        <p>สมัครเมื่อ: {renderDate(customer.created_at)}</p>
                        <p>อัปเดตล่าสุด: {renderDate(customer.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAddresses(customer)}
                      className="gap-2 border-green-300 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600"
                    >
                      <MapPin className="h-4 w-4" />
                      ที่อยู่จัดส่ง
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCustomer(customer)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      แก้ไข
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetPassword(customer)}
                      className="gap-2"
                    >
                      <Key className="h-4 w-4" />
                      รีเซ็ตรหัสผ่าน
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCustomer(customer)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      ลบ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Customer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลลูกค้า</DialogTitle>
            <DialogDescription>
              {currentCustomer?.user_id} - {currentCustomer?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">
                ชื่อ-นามสกุล <span className="text-red-500">*</span>
              </Label>
              <Input
                id="editName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </div>
            <div>
              <Label htmlFor="editEmail">
                อีเมล <span className="text-red-500">*</span>
              </Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="กรอกอีเมล"
              />
            </div>
            <div>
              <Label htmlFor="editPhone">เบอร์โทร</Label>
              <Input
                id="editPhone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="กรอกเบอร์โทร"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={savingCustomer}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveCustomer} disabled={savingCustomer} className="gap-2">
              {savingCustomer && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>รีเซ็ตรหัสผ่าน</DialogTitle>
            <DialogDescription>
              {passwordCustomer?.name} ({passwordCustomer?.user_id})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">
                รหัสผ่านใหม่ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newPassword"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPasswordDialogOpen(false)}
              disabled={changingPassword}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirmResetPassword} disabled={changingPassword} className="gap-2">
              {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              ยืนยัน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Addresses Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              ที่อยู่จัดส่งของลูกค้า
            </DialogTitle>
            <DialogDescription>
              {currentAddressCustomer?.name} ({currentAddressCustomer?.user_id})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {loadingAddresses ? (
              <div className="py-12 flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" /> กำลังโหลดข้อมูล...
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>ลูกค้ายังไม่มีที่อยู่จัดส่ง</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr, index) => (
                  <Card key={addr.id} className={addr.isDefault ? 'border-green-500 bg-green-50' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-lg">{addr.receiverName}</p>
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                                ค่าเริ่มต้น
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{addr.receiverAddress}</p>
                          <div className="flex flex-col gap-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <PhoneIcon className="h-3 w-3" />
                              {addr.receiverPhone}
                            </p>
                            <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                              <Truck className="h-3 w-3" />
                              {addr.shippingCompany}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                          <p>สร้างเมื่อ: {new Date(addr.createdAt).toLocaleDateString('th-TH')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddressDialogOpen(false)}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
