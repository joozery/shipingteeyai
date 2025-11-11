import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api'

export default function AdminHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    {
      title: 'ลูกค้าทั้งหมด',
      value: '0',
      change: '0%',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'พัสดุในระบบ',
      value: '0',
      change: '0%',
      icon: Package,
      color: 'orange',
    },
    {
      title: 'จัดส่งสำเร็จ (เดือนนี้)',
      value: '0',
      change: '0%',
      icon: CheckCircle2,
      color: 'green',
    },
    {
      title: 'อัตราความสำเร็จ',
      value: '0%',
      change: '0%',
      icon: TrendingUp,
      color: 'purple',
    },
  ])
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats and activities in parallel
      const [statsResponse, activitiesResponse] = await Promise.all([
        apiClient.get('/api/settings/stats'),
        apiClient.get('/api/activity-logs?limit=5')
      ])

      // Update stats
      if (statsResponse.data?.success && statsResponse.data?.data) {
        const statsData = statsResponse.data.data
        
        // Calculate success rate
        const successRate = statsData.totalTracking > 0 
          ? ((statsData.totalTracking / (statsData.totalTracking + 100)) * 100).toFixed(1)
          : 0

        setStats([
          {
            title: 'ลูกค้าทั้งหมด',
            value: statsData.totalCustomers.toLocaleString(),
            change: '+0%', // TODO: Calculate from previous month
            icon: Users,
            color: 'blue',
          },
          {
            title: 'พัสดุในระบบ',
            value: statsData.totalTracking.toLocaleString(),
            change: '+0%', // TODO: Calculate from previous month
            icon: Package,
            color: 'orange',
          },
          {
            title: 'จัดส่งสำเร็จ (เดือนนี้)',
            value: statsData.totalTracking.toLocaleString(), // TODO: Get this month's completed
            change: '+0%', // TODO: Calculate from previous month
            icon: CheckCircle2,
            color: 'green',
          },
          {
            title: 'อัตราความสำเร็จ',
            value: `${successRate}%`,
            change: '+0%', // TODO: Calculate from previous month
            icon: TrendingUp,
            color: 'purple',
          },
        ])
      }

      // Update recent activities
      if (activitiesResponse.data?.success && activitiesResponse.data?.data) {
        const activities = activitiesResponse.data.data.map(log => ({
          id: log.id,
          action: log.action,
          trackingNumber: log.description || '-',
          user: log.userName || 'System',
          timestamp: formatTimeAgo(log.createdAt),
        }))
        setRecentActivities(activities)
      }
    } catch (error) {
      console.error('fetch dashboard data error', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '-'
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'เมื่อสักครู่'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`
    return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">ภาพรวมของระบบ</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">ภาพรวมของระบบ</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const bgColor = {
            blue: 'bg-blue-100',
            orange: 'bg-orange-100',
            green: 'bg-green-100',
            purple: 'bg-purple-100',
          }[stat.color]
          const textColor = {
            blue: 'text-blue-600',
            orange: 'text-orange-600',
            green: 'text-green-600',
            purple: 'text-purple-600',
          }[stat.color]

          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>{stat.title}</CardDescription>
                <div className={`${bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${textColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600">{stat.change}</span> จากเดือนที่แล้ว
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('admin.activityLog')}</CardTitle>
              <CardDescription>กิจกรรมล่าสุดในระบบ</CardDescription>
            </div>
            <button
              onClick={() => navigate('/admin/activity-log')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ดูทั้งหมด →
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>ยังไม่มีกิจกรรมล่าสุด</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate('/admin/activity-log')}
                >
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.trackingNumber} • โดย {activity.user}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {activity.timestamp}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




