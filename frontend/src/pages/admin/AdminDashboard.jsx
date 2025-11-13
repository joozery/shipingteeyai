import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom'
import { Users, Package, FileText, Settings, LogOut, BarChart3, Activity, Menu, X, Bell, Search, ChevronDown, Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import logoImg from '@/assets/logo.png'
import apiClient from '@/lib/api'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token, loading, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user || !token || (user.role !== 'admin' && user.role !== 'super_admin')) {
      logout()
      navigate('/admin/login')
    }
  }, [loading, user, token, logout, navigate])

  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // Fetch recent activity logs for notifications
  useEffect(() => {
    if (user && token && notificationsEnabled) {
      fetchNotifications()
      // Refresh notifications every 30 seconds
      const interval = setInterval(() => {
        if (notificationsEnabled) {
          fetchNotifications()
        }
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [user, token, notificationsEnabled])

  const fetchNotifications = async () => {
    if (!notificationsEnabled) return
    
    try {
      const { data } = await apiClient.get('/api/activity-logs?limit=10')
      const logs = data?.data || []
      setNotifications(logs)
      // Count unread (for now, all are considered unread)
      setUnreadCount(logs.length > 0 ? logs.length : 0)
    } catch (error) {
      // If 500 or 404 error, disable notifications to prevent spam
      if (error?.response?.status === 500 || error?.response?.status === 404) {
        setNotificationsEnabled(false)
        setNotifications([])
        setUnreadCount(0)
        return
      }
      // For other errors, still log but don't disable
      console.error('fetch notifications error', error)
      setNotifications([])
      setUnreadCount(0)
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

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const menuItems = [
    { path: '/admin', icon: BarChart3, label: 'ภาพรวม', exact: true },
    { path: '/admin/customers', icon: Users, label: t('admin.customers'), badge: '8' },
    { path: '/admin/tracking', icon: Package, label: t('admin.tracking') },
    { path: '/admin/content', icon: FileText, label: t('admin.content'), badge: 'ใหม่' },
    { path: '/admin/activity-log', icon: Activity, label: t('admin.activityLog') },
    { path: '/admin/admin-users', icon: Shield, label: 'จัดการ Admin', badge: 'New' },
    { path: '/admin/settings', icon: Settings, label: t('admin.settings') },
  ]

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  if (loading) {
    return null
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-xl transition-all duration-300 z-50 flex flex-col ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <img 
                  src={logoImg} 
                  alt="teeyaiimport logo" 
                  className="h-10 w-10 object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">
                    teeyaiimport
                  </span>
                  <span className="text-sm font-bold text-gray-900">TEEYAI IMPORT MASTER</span>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors mx-auto text-gray-600"
            >
              <img 
                src={logoImg} 
                alt="logo" 
                className="h-8 w-8 object-contain"
              />
            </button>
          )}
        </div>

        {/* Search */}
        {sidebarOpen && (
          <div className="px-4 py-4">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="ค้นหาเมนู"
                className="pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 border-0 text-sm text-gray-600 focus-visible:ring-2 focus-visible:ring-blue-200"
              />
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="px-3 pt-1 pb-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path, item.exact)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                {active && sidebarOpen && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 rounded-full bg-blue-500" />
                )}
                <Icon
                  className={`h-5 w-5 flex-shrink-0 transition-colors ${
                    active ? 'text-blue-700' : 'text-gray-600 group-hover:text-gray-900'
                  }`}
                />
                {sidebarOpen && (
                  <div className="flex items-center justify-between flex-1">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          item.badge === 'ใหม่'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold w-full text-red-500 hover:bg-red-50 transition-all border border-red-100"
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>ออกจากระบบ</span>}
          </button>
          {sidebarOpen && user && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                {user.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email || 'admin@teeyaiimport.com'}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-24'}`}>
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
          <div className="h-16 px-4 md:px-8 flex items-center justify-between">
            {/* Left: Page Title / Breadcrumb */}
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">
                {menuItems.find(item => isActive(item.path, item.exact))?.label || 'Dashboard'}
              </h1>
            </div>

            {/* Right: User Info & Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="h-4 w-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="ค้นหา..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-700 border-0 text-sm text-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-400"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors relative"
                >
                  <Bell className="h-5 w-5 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotifications(false)}
                    />
                    <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto z-50 shadow-xl border border-gray-200">
                      <CardContent className="p-0">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">การแจ้งเตือน</h3>
                          {unreadCount > 0 && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                              {unreadCount} ใหม่
                            </span>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                              <p className="text-sm">ยังไม่มีการแจ้งเตือน</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {notifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                  onClick={() => {
                                    setShowNotifications(false)
                                    navigate('/admin/activity-log')
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 mb-1">
                                        {notification.action}
                                      </p>
                                      {notification.description && (
                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                          {notification.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{notification.userName || 'Unknown'}</span>
                                        <span>•</span>
                                        <span>{formatTimeAgo(notification.createdAt)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-gray-200">
                            <button
                              onClick={() => {
                                setShowNotifications(false)
                                navigate('/admin/activity-log')
                              }}
                              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              ดูทั้งหมด
                            </button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative pl-4 border-l border-slate-700">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-gray-300">{user.role}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0) || 'A'}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-300 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <Card className="absolute right-0 top-12 w-56 z-50 shadow-xl border border-gray-200">
                      <CardContent className="p-2">
                        <div className="p-3 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email || 'admin@teeyai.com'}</p>
                          <p className="text-xs text-gray-400 mt-1">{user.role}</p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setShowUserMenu(false)
                              navigate('/admin/settings')
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2"
                          >
                            <Settings className="h-4 w-4" />
                            การตั้งค่า
                          </button>
                          <button
                            onClick={() => {
                              setShowUserMenu(false)
                              navigate('/admin/activity-log')
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2"
                          >
                            <Activity className="h-4 w-4" />
                            ประวัติการทำงาน
                          </button>
                        </div>
                        <div className="pt-1 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setShowUserMenu(false)
                              handleLogout()
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
                          >
                            <LogOut className="h-4 w-4" />
                            ออกจากระบบ
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 md:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}



