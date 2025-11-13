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
import { Search, Edit, Trash2, Key, Loader2, Users, MapPin, Eye, Plus, Phone as PhoneIcon, Truck, Copy, Check } from 'lucide-react'
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

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creatingCustomer, setCreatingCustomer] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    name: '',
    taxId: '',
    phone: '',
    email: '',
    address: '',
    username: '',
    password: '',
  })
  const [copiedField, setCopiedField] = useState(null)

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

  const handleCreateCustomer = async () => {
    if (!createFormData.name || !createFormData.email || !createFormData.username || !createFormData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกชื่อ, อีเมล, username และ password ให้ครบถ้วน',
        confirmButtonColor: '#f59e0b',
      })
      return
    }

    // ตรวจสอบ password length
    if (createFormData.password.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Password สั้นเกินไป',
        text: 'Password ต้องมีอย่างน้อย 6 ตัวอักษร',
        confirmButtonColor: '#f59e0b',
      })
      return
    }

    try {
      setCreatingCustomer(true)
      const { data } = await apiClient.post('/api/customers', createFormData)

      if (data?.success) {
        await fetchCustomers()
        
        Swal.fire({
          icon: 'success',
          title: 'สร้างลูกค้าใหม่สำเร็จ!',
          text: `สร้างบัญชี ${createFormData.username} เรียบร้อยแล้ว`,
          confirmButtonColor: '#10b981',
        })

        // Reset form
        setCreateFormData({
          name: '',
          taxId: '',
          phone: '',
          email: '',
          address: '',
          username: '',
          password: '',
        })
        setCreateDialogOpen(false)
      }
    } catch (error) {
      console.error('create customer error', error)
      
      // Check if it's a 404 error (route not found on production)
      if (error?.response?.status === 404) {
        Swal.fire({
          icon: 'error',
          title: 'ไม่พบ API Endpoint',
          html: `
            <div class="text-left">
              <p class="mb-2">API endpoint ยังไม่มีใน production server</p>
              <p class="text-sm text-gray-600">กรุณา deploy backend ไปยัง production server ก่อน</p>
            </div>
          `,
          confirmButtonColor: '#ef4444',
        })
      } else {
        const message = error?.response?.data?.message || 'ไม่สามารถสร้างลูกค้าได้'
        Swal.fire({
          icon: 'error',
          title: 'สร้างไม่สำเร็จ',
          text: message,
          confirmButtonColor: '#ef4444',
        })
      }
    } finally {
      setCreatingCustomer(false)
    }
  }

  const handleCopyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
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
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มลูกค้าใหม่
        </Button>
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

      {/* Create Customer Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>เพิ่มลูกค้าใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลลูกค้าและสร้าง Username/Password สำหรับเข้าสู่ระบบ
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="createName">
                ชื่อ-สกุล/นิติบุคคล <span className="text-red-500">*</span>
              </Label>
              <Input
                id="createName"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                placeholder="กรอกชื่อ-สกุลหรือชื่อนิติบุคคล"
              />
            </div>
            <div>
              <Label htmlFor="createTaxId">หมายเลขนิติบุคคล</Label>
              <Input
                id="createTaxId"
                value={createFormData.taxId}
                onChange={(e) => setCreateFormData({ ...createFormData, taxId: e.target.value })}
                placeholder="กรอกหมายเลขนิติบุคคล (ถ้ามี)"
              />
            </div>
            <div>
              <Label htmlFor="createPhone">เบอร์โทรศัพท์</Label>
              <Input
                id="createPhone"
                value={createFormData.phone}
                onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                placeholder="กรอกเบอร์โทรศัพท์"
              />
            </div>
            <div>
              <Label htmlFor="createEmail">
                E-MAIL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="createEmail"
                type="email"
                value={createFormData.email}
                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                placeholder="กรอกอีเมล"
              />
            </div>
            <div>
              <Label htmlFor="createAddress">ที่อยู่</Label>
              <textarea
                id="createAddress"
                rows={4}
                value={createFormData.address}
                onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                placeholder="กรอกที่อยู่"
                className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="createUsername">
                USER NAME <span className="text-red-500">*</span>
              </Label>
              <Input
                id="createUsername"
                value={createFormData.username}
                onChange={(e) => setCreateFormData({ ...createFormData, username: e.target.value })}
                placeholder="กรอก Username สำหรับเข้าสู่ระบบ"
              />
            </div>
            <div>
              <Label htmlFor="createPassword">
                PASSWORD <span className="text-red-500">*</span> <span className="text-gray-500 text-xs font-normal">(อย่างน้อย 6 ตัวอักษร)</span>
              </Label>
              <Input
                id="createPassword"
                type="password"
                value={createFormData.password}
                onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                placeholder="กรอก Password (อย่างน้อย 6 ตัวอักษร)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                setCreateFormData({
                  name: '',
                  taxId: '',
                  phone: '',
                  email: '',
                  address: '',
                  username: '',
                  password: '',
                })
                setCopiedField(null)
              }}
              disabled={creatingCustomer}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreateCustomer} disabled={creatingCustomer} className="gap-2">
              {creatingCustomer && <Loader2 className="h-4 w-4 animate-spin" />}
              สร้างลูกค้าใหม่
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
