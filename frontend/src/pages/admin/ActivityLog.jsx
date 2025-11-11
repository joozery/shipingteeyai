import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Activity, Search, User, Package, FileText, Settings as SettingsIcon, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api'

export default function ActivityLog() {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch activity logs from API
  useEffect(() => {
    fetchActivityLogs()
  }, [])

  const fetchActivityLogs = async () => {
    try {
      setLoading(true)
      const { data } = await apiClient.get('/api/activity-logs?limit=100')
      setActivities(data?.data || [])
    } catch (error) {
      console.error('fetch activity logs error', error)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }


  const getIcon = (type) => {
    switch (type) {
      case 'tracking':
        return <Package className="h-5 w-5 text-blue-600" />
      case 'customer':
        return <User className="h-5 w-5 text-green-600" />
      case 'content':
        return <FileText className="h-5 w-5 text-purple-600" />
      case 'settings':
        return <SettingsIcon className="h-5 w-5 text-orange-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'tracking':
        return 'bg-blue-100 text-blue-800'
      case 'customer':
        return 'bg-green-100 text-green-800'
      case 'content':
        return 'bg-purple-100 text-purple-800'
      case 'settings':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredActivities = activities.filter(
    (activity) =>
      activity.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('admin.activityLog')}</h1>
        <p className="text-muted-foreground">
          บันทึกการทำงานทั้งหมดในระบบ
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.activityLog')}</CardTitle>
          <CardDescription>
            {loading ? 'กำลังโหลดข้อมูล...' : `ประวัติการทำงานทั้งหมด ${activities.length} รายการ`}
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหา activity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 mr-2 animate-spin text-blue-600" />
              <span className="text-muted-foreground">กำลังโหลดข้อมูล...</span>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>ยังไม่มี Activity Logs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="bg-gray-100 rounded-full p-2">
                    {getIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{activity.action}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(activity.type)}`}>
                        {activity.type}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      โดย {activity.userName || 'Unknown'} • {formatDateTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




