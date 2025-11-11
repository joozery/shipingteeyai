import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import logoTee from '@/assets/logoteeyai.png'
import contactLogo from '@/assets/logo.png'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4YzAgNi42MyAzLjU4IDEyLjQzIDguOTIgMTUuNThWNjBoMThWMzMuNThDMzIuNDIgMzAuNDMgMzYgMjQuNjMgMzYgMTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
      
      <div className="relative container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src={logoTee} 
                alt="teeyaiimport logo" 
                className="h-16 w-auto"
              />
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              {t('about.description')}
            </p>
            {/* Social Media */}
            <div className="flex space-x-3 pt-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-premium"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full mr-2"></span>
              {t('nav.services')}
            </h3>
            <ul className="space-y-2">
              {[
                t('services.domestic'),
                t('services.international'),
                t('services.warehouse'),
                t('services.sourcing'),
              ].map((service, i) => (
                <li key={i}>
                  <Link to="/services" className="text-blue-200 hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full mr-2"></span>
              เมนูด่วน
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/about', label: t('nav.about') },
                { to: '/articles', label: t('nav.articles') },
                { to: '/tracking', label: t('tracking.title') },
                { to: '/contact', label: t('nav.contact') },
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.to} className="text-blue-200 hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full mr-2"></span>
              {t('nav.contact')}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3 group">
                <img 
                  src={contactLogo} 
                  alt="company logo" 
                  className="h-10 w-10 object-cover flex-shrink-0"
                />
                <div>
                  <p className="text-white font-medium">บริษัท ตี๋ใหญ่ อิมพอร์ต มาสเตอร์ จำกัด</p>
                  <p className="text-blue-200 text-xs">Teeyai Import Master Co., Ltd.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <a href="tel:0944555697" className="text-blue-200 hover:text-white transition-colors block">094-4555697 (คุณ ไบรอัน)</a>
                  <a href="tel:0907179607" className="text-blue-200 hover:text-white transition-colors block">090-7179607 (คุณ ใบเฟิร์น)</a>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-blue-200 leading-relaxed">
                    เลขที่ 40 ซอย 41/5 อาคารมีมี่อพาร์ทเม้น<br />
                    ถนนเพชรเกษม ต.หาดใหญ่ อ.หาดใหญ่<br />
                    จ.สงขลา 90110
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-blue-200 text-sm">
              &copy; {new Date().getFullYear()} teeyaiimport. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-blue-200 hover:text-white transition-colors">นโยบายความเป็นส่วนตัว</a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">เงื่อนไขการใช้งาน</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
