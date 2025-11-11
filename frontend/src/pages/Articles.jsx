import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, ArrowRight, User, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api'

export default function Articles() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch articles from API
  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const { data } = await apiClient.get('/api/articles')
      setArticles(data?.data || [])
    } catch (error) {
      console.error('fetch articles error', error)
      setArticles([])
    } finally {
      setLoading(false)
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


  const handleSubscribe = (e) => {
    e.preventDefault()
    console.log('Subscribe:', email)
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white">
      {/* Header Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4YzAgNi42MyAzLjU4IDEyLjQzIDguOTIgMTUuNThWNjBoMThWMzMuNThDMzIuNDIgMzAuNDMgMzYgMjQuNjMgMzYgMTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-100"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full mb-6 animate-fade-in">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-700 font-medium">บทความและข่าวสาร</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in text-gray-900" style={{ animationDelay: '100ms' }}>
            สำรวจบทความและ{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500">
              ข่าวสารล่าสุด
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            อัปเดตความรู้และเทรนด์ใหม่ๆ ในวงการโลจิสติกส์และการขนส่ง เพื่อให้ธุรกิจของคุณก้าวไปข้างหน้า
          </p>

          {/* Subscribe Form */}
          <form onSubmit={handleSubscribe} className="max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex flex-col sm:flex-row gap-4 bg-white/80 backdrop-blur-sm p-2 rounded-2xl border-2 border-blue-200 shadow-lg">
              <Input
                type="email"
                placeholder="กรอกอีเมลเพื่อรับข่าวสารล่าสุด..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent border-0 text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 px-6 py-6 text-base"
              />
              <Button 
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-10 py-6 text-base font-semibold rounded-xl"
              >
                สมัครรับข่าวสาร
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="container mx-auto px-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">กำลังโหลดบทความ...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">ยังไม่มีบทความในระบบ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Featured Article - Large */}
          {articles[0] && (
            <div className="lg:col-span-6 lg:row-span-2 animate-fade-in">
              <Link to={`/articles/${articles[0].id}`}>
                <Card className="group relative h-full overflow-hidden bg-white border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 cursor-pointer">
                  <div className="relative h-full min-h-[500px]">
                  <img 
                    src={articles[0].image || getDefaultImage()} 
                    alt={articles[0].title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                  
                  <div className="relative h-full flex flex-col justify-end p-8">
                    {/* Tags */}
                    {articles[0].tags && articles[0].tags.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {articles[0].tags.map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm border border-blue-400 rounded-full text-xs text-white font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-blue-100 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{articles[0].author || 'ทีมงาน teeyaiimport'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(articles[0].createdAt)}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold mb-4 text-white group-hover:text-blue-300 transition-colors">
                      {articles[0].title}
                    </h2>

                    {/* Excerpt */}
                    {articles[0].excerpt && (
                      <p className="text-gray-200 mb-6 line-clamp-3">
                        {articles[0].excerpt}
                      </p>
                    )}

                    {/* Button */}
                    <Button 
                      variant="ghost" 
                      className="w-fit gap-2 text-blue-300 hover:text-blue-200 hover:bg-blue-500/20 px-0"
                    >
                      อ่านเพิ่มเติม
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
                </Card>
              </Link>
            </div>
          )}

          {/* Regular Articles - Smaller Cards */}
          {articles.slice(1).map((article, index) => (
            <div 
              key={article.id} 
              className="lg:col-span-6 animate-fade-in"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <Link to={`/articles/${article.id}`}>
                <Card className="group relative h-full overflow-hidden bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-500 cursor-pointer">
                  <div className="flex flex-col sm:flex-row h-full">
                  {/* Image */}
                  <div className="relative sm:w-2/5 h-64 sm:h-auto overflow-hidden">
                    <img 
                      src={article.image || getDefaultImage()} 
                      alt={article.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {article.tags.map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-full text-xs text-blue-700 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div>
                      {/* Title */}
                      <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Excerpt */}
                      {article.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Meta */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(article.createdAt)}</span>
                      </div>

                      {/* Button */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-0"
                      >
                        อ่านเพิ่มเติม
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
                </Card>
              </Link>
            </div>
          ))}
          </div>
        )}
      </section>
    </div>
  )
}

