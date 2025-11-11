import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { LogIn, User, AlertCircle } from 'lucide-react'
import apiClient from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await apiClient.post('/api/auth/customer/login', {
        userId: formData.userId.trim(),
        password: formData.password
      })

      login({ user: data.user, token: data.token })
      navigate('/account')
    } catch (error) {
      const message = error?.response?.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/10 rounded-full mb-4">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">เข้าสู่ระบบลูกค้า</h1>
          <p className="text-muted-foreground">
            เข้าสู่ระบบเพื่อจัดการบัญชีของคุณ
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Customer Login
            </CardTitle>
            <CardDescription>
              กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าสู่ระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <div>
                <Label htmlFor="userId">หมายเลขบัญชี / อีเมล</Label>
                <Input
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <LogIn className="h-4 w-4" />
                {loading ? t('common.loading') : t('auth.loginButton')}
              </Button>
            </form>

            {/* Link to Admin Login */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                เข้าสู่ระบบสำหรับผู้ดูแลระบบ →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


