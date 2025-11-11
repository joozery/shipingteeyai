import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Clock, HeadphonesIcon, Search, TrendingUp, Shield, Zap, Calendar, ArrowRight, UserPlus, ClipboardList, MapPin, CheckCircle, Loader2 } from 'lucide-react'
import heroBg from '@/assets/1380.jpg'
import apiClient from '@/lib/api'

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [articles, setArticles] = useState([])
  const [loadingArticles, setLoadingArticles] = useState(true)

  // Fetch latest articles from API
  useEffect(() => {
    fetchLatestArticles()
  }, [])

  const fetchLatestArticles = async () => {
    try {
      setLoadingArticles(true)
      const { data } = await apiClient.get('/api/articles')
      // Get latest 4 articles
      const latestArticles = (data?.data || []).slice(0, 4)
      setArticles(latestArticles)
    } catch (error) {
      console.error('fetch articles error', error)
      setArticles([])
    } finally {
      setLoadingArticles(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDefaultImage = () => {
    return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200'
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/tracking?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Compact & Modern */}
      <section className="relative overflow-hidden min-h-[550px] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        ></div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-slate-900/85 to-blue-900/80"></div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Heading */}
            <div className="space-y-4 mb-8 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
                {t('home.title')}
              </h1>
              
              <p className="text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-sky-300">
                {t('home.subtitle')}
              </p>
              
              <p className="text-base md:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                {t('home.hero.description')}
              </p>
            </div>

            {/* Search Box - Compact */}
            <div className="max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <form onSubmit={handleSearch} className="relative">
                <div className="relative flex flex-col sm:flex-row items-center gap-3 bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/20">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={t('home.hero.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-5 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                  </div>
                  <Button 
                    type="submit"
                    size="default"
                    className="w-full sm:w-auto px-8 py-5 text-base bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {t('home.hero.searchButton')}
                  </Button>
                </div>
              </form>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '400ms' }}>
              {[
                { icon: Shield, label: t('home.hero.stats.safe') },
                { icon: Clock, label: t('home.hero.stats.fast') },
                { icon: TrendingUp, label: t('home.hero.stats.realtime') },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <Icon className="w-6 h-6 text-blue-300" />
                    <span className="text-xs md:text-sm text-white font-medium">{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Compact Light Theme */}
      <section className="relative py-14 bg-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] bg-repeat"></div>
        </div>

        {/* Gradient Overlays */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-100/40 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 border border-blue-200 rounded-full mb-4">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-700 font-semibold tracking-wider">{t('home.howItWorks.badge')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {t('home.howItWorks.title')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500">
                {t('home.howItWorks.steps')}
              </span>
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                number: '01',
                icon: UserPlus,
                title: t('home.howItWorks.step1.title'),
                description: t('home.howItWorks.step1.description'),
                color: 'from-blue-500 to-blue-600',
                delay: '0ms',
              },
              {
                number: '02',
                icon: ClipboardList,
                title: t('home.howItWorks.step2.title'),
                description: t('home.howItWorks.step2.description'),
                color: 'from-cyan-500 to-blue-500',
                delay: '100ms',
              },
              {
                number: '03',
                icon: MapPin,
                title: t('home.howItWorks.step3.title'),
                description: t('home.howItWorks.step3.description'),
                color: 'from-blue-600 to-cyan-600',
                delay: '200ms',
              },
              {
                number: '04',
                icon: CheckCircle,
                title: t('home.howItWorks.step4.title'),
                description: t('home.howItWorks.step4.description'),
                color: 'from-cyan-600 to-blue-400',
                delay: '300ms',
              },
            ].map((step, index) => {
              const Icon = step.icon
              return (
                <div 
                  key={index}
                  className="relative group animate-fade-in"
                  style={{ animationDelay: step.delay }}
                >
                  {/* Connecting Line */}
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-300 to-transparent -translate-y-1/2 z-0"></div>
                  )}

                  {/* Card */}
                  <div className="relative bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-xl transition-all duration-500 h-full">
                    {/* Number Badge */}
                    <div className="absolute -top-2.5 -right-2.5 w-9 h-9 bg-gradient-to-br from-white to-blue-50 border-2 border-blue-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-blue-600 font-bold text-sm">{step.number}</span>
                    </div>

                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br ${step.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section - New Layout */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Side - Image */}
              <div className="relative animate-fade-in max-w-md mx-auto lg:mx-0">
                {/* Rating Badge */}
                <div className="absolute -top-3 left-6 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 fill-yellow-300" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                    <span className="font-bold text-base">4.9</span>
                  </div>
                  <span className="text-xs font-medium">{t('home.whyChooseUs.rating')}</span>
                </div>

                {/* Main Image Container */}
                <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/30 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-200/30 rounded-full blur-2xl"></div>
                  
                  {/* Image */}
                  <div className="relative rounded-xl overflow-hidden shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500&h=550&fit=crop" 
                      alt="Logistics Professional"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Right Side - Features List */}
              <div className="space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
                {/* Header */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 border border-blue-200 rounded-full mb-3">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-700 font-semibold">{t('home.whyChooseUs.whyChooseUs')}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {t('home.whyChooseUs.title')}{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                      {t('home.whyChooseUs.titleHighlight')}
                    </span>
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {t('home.whyChooseUs.subtitle')}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-4">
                  {[
                    {
                      icon: Package,
                      title: t('home.features.reliable'),
                      desc: t('home.features.reliableDesc'),
                      color: 'from-blue-500 to-blue-600',
                    },
                    {
                      icon: Clock,
                      title: t('home.features.fast'),
                      desc: t('home.features.fastDesc'),
                      color: 'from-cyan-500 to-blue-500',
                    },
                    {
                      icon: HeadphonesIcon,
                      title: t('home.features.support'),
                      desc: t('home.features.supportDesc'),
                      color: 'from-blue-600 to-cyan-600',
                    },
                  ].map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <div 
                        key={index}
                        className="flex gap-3 group"
                      >
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600 text-xs leading-relaxed">
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section - Compact with 4 Cards */}
      <section className="py-14 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 border border-blue-200 rounded-full mb-4">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-700 font-medium">{t('home.articles.badge')}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">
                    {t('home.articles.title')}
                  </span>
                </h2>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  {t('home.articles.subtitle')}
                </p>
          </div>

          {loadingArticles ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">กำลังโหลดบทความ...</span>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>ยังไม่มีบทความในระบบ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {articles.map((article, i) => (
                <Card 
                  key={article.id} 
                  className="group overflow-hidden border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-500 bg-white animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={article.image || getDefaultImage()} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {article.tags && article.tags.length > 0 && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-blue-600/90 backdrop-blur-sm border border-blue-400 rounded-full text-xs text-white font-medium">
                          {article.tags[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {article.excerpt && (
                      <CardDescription className="line-clamp-2 mb-3 text-gray-600 text-sm">
                        {article.excerpt}
                      </CardDescription>
                    )}
                    <Link to={`/articles/${article.id}`}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="gap-2 p-0 text-blue-600 hover:text-blue-700"
                      >
                        {t('home.articles.readMore')}
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <Link to="/articles">
                  <Button 
                    size="default" 
                    variant="outline"
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6"
                  >
                    {t('home.articles.viewAll')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
          </div>
        </div>
      </section>

      {/* Trust Section - Light Theme with Container Port Background */}
      <section className="relative py-16 bg-white overflow-hidden">
        {/* Background Image - Container Port */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1600&auto=format&fit=crop&q=80"
            alt="Industrial Port Container Yard"
            className="w-full h-full object-cover opacity-40"
            loading="eager"
          />
          {/* Light overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/75 to-white/85"></div>
        </div>

        {/* Gradient Overlays for depth */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto px-4 text-center">
          {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 border border-blue-300 rounded-full mb-6 animate-fade-in">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-700 font-semibold tracking-wider">{t('home.cta.badge')}</span>
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 leading-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
                {t('home.cta.title')}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500">
                  {t('home.cta.titleHighlight')}
                </span>{' '}
                {t('home.cta.titleSuffix')}
              </h2>

              {/* Subtitle */}
              <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
                {t('home.cta.subtitle')}<br />
                {t('home.cta.subtitle2')}
              </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-in" style={{ animationDelay: '300ms' }}>
                <Link to="/contact">
                  <Button 
                    size="default"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-5 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {t('home.cta.getStarted')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/services">
                  <Button 
                    size="default"
                    variant="outline"
                    className="border-2 border-blue-600 bg-white hover:bg-blue-50 text-blue-600 px-6 py-5 text-sm font-semibold rounded-xl transition-all duration-300"
                  >
                    {t('home.cta.viewServices')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
          </div>

          {/* Stats or Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
            {[
              { icon: Shield, title: t('home.cta.feature1.title'), desc: t('home.cta.feature1.description'), color: 'from-blue-500 to-blue-600' },
              { icon: TrendingUp, title: t('home.cta.feature2.title'), desc: t('home.cta.feature2.description'), color: 'from-cyan-500 to-blue-500' },
              { icon: Zap, title: t('home.cta.feature3.title'), desc: t('home.cta.feature3.description'), color: 'from-blue-600 to-cyan-600' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div 
                  key={i} 
                  className="group p-5 rounded-xl bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-500"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-1.5 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 text-xs">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
