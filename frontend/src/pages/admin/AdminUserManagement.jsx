import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, Edit, Trash2, Key, Loader2, Shield, UserCog } from 'lucide-react'
import Swal from 'sweetalert2'
import apiClient from '@/lib/api'

export default function AdminUserManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [adminUsers, setAdminUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'admin',
  })

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [passwordUser, setPasswordUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    fetchAdminUsers()
  }, [])

  const fetchAdminUsers = async () => {
    try {
      setLoading(true)
      const { data } = await apiClient.get('/api/admin-users')
      setAdminUsers(data?.data || [])
    } catch (error) {
      console.error('fetch admin users error', error)
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถดึงข้อมูลได้',
        text: error?.response?.data?.message || 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = searchTerm.trim()
    ? adminUsers.filter((user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : adminUsers

  const handleAddUser = () => {
    setCurrentUser(null)
    setFormData({
      email: '',
      name: '',
      password: '',
      role: 'admin',
    })
    setDialogOpen(true)
  }

  const handleEditUser = (user) => {
    setCurrentUser(user)
    setFormData({
      email: user.email || '',
      name: user.name || '',
      password: '',
      role: user.role || 'admin',
    })
    setDialogOpen(true)
  }

  const handleSaveUser = async () => {
    if (!formData.email || !formData.name) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกอีเมลและชื่อให้ครบถ้วน',
        confirmButtonColor: '#f59e0b',
      })
      return
    }

    if (!currentUser && !formData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกรหัสผ่าน',
        confirmButtonColor: '#f59e0b',
      })
      return
    }

    try {
      setSaving(true)
      
      if (currentUser) {
        // Update
        await apiClient.put(`/api/admin-users/${currentUser.id}`, {
          email: formData.email,
          name: formData.name,
          role: formData.role,
        })
        
        Swal.fire({
          icon: 'success',
          title: 'อัปเดตสำเร็จ!',
          confirmButtonColor: '#10b981',
          timer: 1500,
        })
      } else {
        // Create
        await apiClient.post('/api/admin-users', formData)
        
        Swal.fire({
          icon: 'success',
          title: 'สร้าง Admin User สำเร็จ!',
          confirmButtonColor: '#10b981',
          timer: 1500,
        })
      }
      
      setDialogOpen(false)
      fetchAdminUsers()
    } catch (error) {
      console.error('save admin user error', error)
      Swal.fire({
        icon: 'error',
        title: 'ไม่สำเร็จ',
        text: error?.response?.data?.message || 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = (user) => {
    setPasswordUser(user)
    setNewPassword('')
    setPasswordDialogOpen(true)
  }

  const handleConfirmResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'รหัสผ่านไม่ถูกต้อง',
        text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        confirmButtonColor: '#f59e0b',
      })
      return
    }

    try {
      setResetting(true)
      await apiClient.post(`/api/admin-users/${passwordUser.id}/reset-password`, {
        newPassword,
      })

      Swal.fire({
        icon: 'success',
        title: 'รีเซ็ตรหัสผ่านสำเร็จ!',
        confirmButtonColor: '#10b981',
        timer: 1500,
      })

      setPasswordDialogOpen(false)
      setPasswordUser(null)
      setNewPassword('')
    } catch (error) {
      console.error('reset password error', error)
      Swal.fire({
        icon: 'error',
        title: 'รีเซ็ตรหัสผ่านไม่สำเร็จ',
        text: error?.response?.data?.message || 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setResetting(false)
    }
  }

  const handleDeleteUser = (user) => {
    Swal.fire({
      icon: 'warning',
      title: 'ยืนยันการลบ',
      text: `คุณแน่ใจหรือไม่ที่จะลบ Admin User "${user.name}"?`,
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/api/admin-users/${user.id}`)
          
          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ!',
            confirmButtonColor: '#10b981',
            timer: 1500,
          })
          
          fetchAdminUsers()
        } catch (error) {
          console.error('delete admin user error', error)
          Swal.fire({
            icon: 'error',
            title: 'ลบไม่สำเร็จ',
            text: error?.response?.data?.message || 'เกิดข้อผิดพลาด',
            confirmButtonColor: '#ef4444',
          })
        }
      }
    })
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Super Admin</span>
      case 'admin':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Admin</span>
      case 'staff':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Staff</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">{role}</span>
    }
  }

  const renderDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">จัดการ Admin Users</h1>
          <p className="text-muted-foreground mt-1">จัดการผู้ดูแลระบบ</p>
        </div>
        <Button onClick={handleAddUser} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่ม Admin User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            รายชื่อ Admin Users
          </CardTitle>
          <CardDescription>
            {loading ? 'กำลังโหลดข้อมูล...' : `ทั้งหมด ${adminUsers.length} คน`}
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหา Admin User..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" /> กำลังโหลดข้อมูล...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCog className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>ยังไม่มีข้อมูล Admin User</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="bg-purple-100 rounded-full p-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-lg">{user.name}</p>
                          {getRoleBadge(user.role)}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1 text-right">
                        <p>สร้างเมื่อ: {renderDate(user.createdAt)}</p>
                        {user.lastLoginAt && (
                          <p>Login ล่าสุด: {renderDate(user.lastLoginAt)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      แก้ไข
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetPassword(user)}
                      className="gap-2"
                    >
                      <Key className="h-4 w-4" />
                      รีเซ็ตรหัสผ่าน
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentUser ? 'แก้ไข Admin User' : 'เพิ่ม Admin User ใหม่'}</DialogTitle>
            <DialogDescription>
              {currentUser ? 'แก้ไขข้อมูล Admin User' : 'กรอกข้อมูล Admin User ใหม่'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                ชื่อ-นามสกุล <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ชื่อ-นามสกุล"
              />
            </div>
            <div>
              <Label htmlFor="email">
                อีเมล <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
            {!currentUser && (
              <div>
                <Label htmlFor="password">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
              </div>
            )}
            <div>
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือก Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveUser} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              บันทึก
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
              {passwordUser?.name} ({passwordUser?.email})
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
              disabled={resetting}
            >
              ยกเลิก
            </Button>
            <Button onClick={handleConfirmResetPassword} disabled={resetting} className="gap-2">
              {resetting && <Loader2 className="h-4 w-4 animate-spin" />}
              ยืนยัน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


