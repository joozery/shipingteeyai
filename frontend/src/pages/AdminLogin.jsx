import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Shield, LogIn, AlertCircle } from 'lucide-react'
import apiClient from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await apiClient.post('/api/auth/admin/login', {
        email: formData.email.trim(),
        password: formData.password
      })

      login({ user: data.user, token: data.token })
      navigate('/admin')
    } catch (error) {
      const message = error?.response?.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านของ Admin ไม่ถูกต้อง'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600/20 backdrop-blur-sm border-2 border-red-500/50 rounded-full mb-4">
            <Shield className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-white">Admin Portal</h1>
          <p className="text-gray-300">
            เข้าสู่ระบบจัดการสำหรับผู้ดูแลระบบ
          </p>
        </div>

        <Card className="border-red-500/30 bg-gray-900/50 backdrop-blur-sm">
          <CardHeader className="border-b border-red-500/20">
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-500" />
              Admin Login
            </CardTitle>
            <CardDescription className="text-gray-400">
              กรอกข้อมูลผู้ดูแลระบบเพื่อเข้าสู่ระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <div>
                <Label htmlFor="email" className="text-gray-300">
                  อีเมล
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-300">
                  {t('auth.password')}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800" 
                disabled={loading}
              >
                <LogIn className="h-4 w-4" />
                {loading ? t('common.loading') : 'เข้าสู่ระบบ Admin'}
              </Button>
            </form>

            {/* Link to Customer Login */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                เข้าสู่ระบบสำหรับลูกค้า →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



