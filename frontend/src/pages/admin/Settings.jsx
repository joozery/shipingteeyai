import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Mail, Bell, Shield, Database, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api'
import Swal from 'sweetalert2'

export default function Settings() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    auto_status_update: true,
    maintenance_mode: false,
  })
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalTracking: 0,
    totalActivities: 0,
    totalArticles: 0,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch settings and stats from API
  useEffect(() => {
    fetchSettings()
    fetchStats()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data } = await apiClient.get('/api/settings')
      if (data?.success && data?.data) {
        setSettings({
          email_notifications: data.data.email_notifications ?? true,
          sms_notifications: data.data.sms_notifications ?? false,
          auto_status_update: data.data.auto_status_update ?? true,
          maintenance_mode: data.data.maintenance_mode ?? false,
        })
      }
    } catch (error) {
      console.error('fetch settings error', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get('/api/settings/stats')
      if (data?.success && data?.data) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('fetch stats error', error)
    }
  }

  const handleToggle = (key) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await apiClient.put('/api/settings', settings)
      
      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ!',
        confirmButtonColor: '#10b981',
        timer: 1500,
      })
    } catch (error) {
      console.error('save settings error', error)
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: error?.response?.data?.message || 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('admin.settings')}</h1>
        <p className="text-muted-foreground">จัดการการตั้งค่าระบบ</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              ระบบอัตโนมัติ
            </CardTitle>
            <CardDescription>
              จัดการการทำงานอัตโนมัติของระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoStatusUpdate" className="text-base">
                  อัพเดตสถานะอัตโนมัติ
                </Label>
                <p className="text-sm text-muted-foreground">
                  ระบบจะอัพเดตสถานะพัสดุอัตโนมัติตามข้อมูลจาก GPS
                </p>
              </div>
              <Switch
                id="autoStatusUpdate"
                checked={settings.auto_status_update}
                onCheckedChange={() => handleToggle('auto_status_update')}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              ความปลอดภัย
            </CardTitle>
            <CardDescription>
              จัดการการตั้งค่าความปลอดภัยของระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode" className="text-base">
                  โหมดบำรุงรักษา
                </Label>
                <p className="text-sm text-muted-foreground">
                  ปิดระบบชั่วคราวเพื่อทำการบำรุงรักษา
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenance_mode}
                onCheckedChange={() => handleToggle('maintenance_mode')}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              ข้อมูลระบบ
            </CardTitle>
            <CardDescription>
              ข้อมูลสถิติของระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">ลูกค้าทั้งหมด</p>
                <p className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">พัสดุทั้งหมด</p>
                <p className="text-2xl font-bold">{stats.totalTracking.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Activity Log</p>
                <p className="text-2xl font-bold">{stats.totalActivities.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">บทความทั้งหมด</p>
                <p className="text-2xl font-bold">{stats.totalArticles.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" disabled={loading || saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              'บันทึกการตั้งค่า'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

