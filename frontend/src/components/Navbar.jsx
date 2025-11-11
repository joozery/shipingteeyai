import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import LanguageSwitcher from './LanguageSwitcher'
import { User, Menu, LogOut, UserCircle, Settings } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import logoTee from '@/assets/logoteeyai.png'

export default function Navbar() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const languageLabel = t('nav.language', { defaultValue: 'เลือกภาษา' })
  const accountLabel = t('nav.account', { defaultValue: 'บัญชีของฉัน' })
  const logoutLabel = t('nav.logout', { defaultValue: 'ออกจากระบบ' })

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-[#1a2a6c] border-b border-[#23336e] sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src={logoTee} 
              alt="teeyaiimport logo" 
              className="h-16 w-auto transition-all duration-300 group-hover:scale-110 brightness-110 contrast-110 drop-shadow-2xl"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {[
              { path: '/', label: t('nav.home') },
              { path: '/services', label: t('nav.services') },
              { path: '/about', label: t('nav.about') },
              { path: '/articles', label: t('nav.articles') },
              { path: '/contact', label: t('nav.contact') },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${
                  isActive(item.path)
                    ? 'text-blue-400 font-bold'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full shadow-lg shadow-blue-400/50" />
                )}
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 shadow-premium hover:shadow-premium-lg transition-all duration-300"
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    {user?.name || user?.email || 'User'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || ''}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/account')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>บัญชีของฉัน</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/account')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>ตั้งค่า</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>ออกจากระบบ</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 shadow-premium hover:shadow-premium-lg transition-all duration-300"
                >
                  <User className="h-4 w-4 mr-2" />
                  {t('nav.login')}
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-full"
                onClick={() => navigate('/account')}
              >
                <UserCircle className="h-5 w-5" />
              </Button>
            ) : (
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-white hover:bg-slate-800 border border-slate-700 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 animate-fade-in border-t border-slate-700">
            <div className="px-4 flex items-center justify-between bg-slate-800/70 border border-slate-700 rounded-lg py-2">
              <span className="text-sm font-medium text-gray-100">{languageLabel}</span>
              <LanguageSwitcher />
            </div>
            {[
              { path: '/', label: t('nav.home') },
              { path: '/services', label: t('nav.services') },
              { path: '/about', label: t('nav.about') },
              { path: '/articles', label: t('nav.articles') },
              { path: '/contact', label: t('nav.contact') },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-400/20 text-blue-400 font-bold'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="px-4 pt-2">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 shadow-premium hover:shadow-premium-lg transition-all duration-300"
                    onClick={() => {
                      navigate('/account')
                      setMobileMenuOpen(false)
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {accountLabel}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-slate-600 text-white hover:bg-slate-800"
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {logoutLabel}
                  </Button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 shadow-premium hover:shadow-premium-lg transition-all duration-300">
                    <User className="h-4 w-4 mr-2" />
                    {t('nav.login')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
