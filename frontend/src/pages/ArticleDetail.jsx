import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft, 
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Tag,
  TrendingUp,
  ChevronRight,
  Loader2
} from 'lucide-react'
import apiClient from '@/lib/api'

export default function ArticleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch article and related articles from API
  useEffect(() => {
    fetchArticle()
    fetchRelatedArticles()
  }, [id])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const { data } = await apiClient.get(`/api/articles/${id}`)
      setArticle(data?.data || null)
    } catch (error) {
      console.error('fetch article error', error)
      setArticle(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedArticles = async () => {
    try {
      const { data } = await apiClient.get('/api/articles')
      const allArticles = data?.data || []
      // Get 3 random articles excluding current one
      const filtered = allArticles.filter(a => a.id !== parseInt(id))
      setRelatedArticles(filtered.slice(0, 3))
    } catch (error) {
      console.error('fetch related articles error', error)
      setRelatedArticles([])
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


  const handleShare = (platform) => {
    const url = window.location.href
    const title = article?.title || ''
    const text = article?.excerpt || ''
    
    let shareUrl = ''
    switch (platform) {
      case 'Facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'Twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
      case 'LinkedIn':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      default:
        if (navigator.share) {
          navigator.share({ title, text, url })
          return
        }
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">กำลังโหลดบทความ...</span>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบบทความ</h1>
          <Button onClick={() => navigate('/articles')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            กลับไปหน้าบทความ
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] bg-gray-900 overflow-hidden">
        <img 
          src={article.image || getDefaultImage()} 
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-6">
            <Link to="/" className="hover:text-blue-200 transition-colors">หน้าแรก</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/articles" className="hover:text-blue-200 transition-colors">บทความ</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-400">รายละเอียด</span>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map((tag, i) => (
                <span key={i} className="px-4 py-1.5 bg-blue-600/90 backdrop-blur-sm border border-blue-400 rounded-full text-sm text-white font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-4xl">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-300">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              <span className="font-medium">{article.author || 'ทีมงาน teeyaiimport'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span>{formatDate(article.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>{article.readTime || '5 นาที'} อ่าน</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              onClick={() => navigate('/articles')}
              className="mb-6 gap-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับไปหน้าบทความ
            </Button>

            {/* Article Content */}
            <Card className="p-8 md:p-12 bg-white shadow-lg">
              {/* Excerpt */}
              {article.excerpt && (
                <div className="text-xl text-gray-700 font-medium leading-relaxed mb-8 pb-8 border-b-2 border-blue-100">
                  {article.excerpt}
                </div>
              )}

              {/* Content */}
              {article.content && (
                <div 
                  className="article-content prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              )}

              {/* Share Section */}
              <div className="mt-12 pt-8 border-t-2 border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">แชร์บทความนี้</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: Facebook, label: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700' },
                    { icon: Twitter, label: 'Twitter', color: 'bg-sky-500 hover:bg-sky-600' },
                    { icon: Linkedin, label: 'LinkedIn', color: 'bg-blue-700 hover:bg-blue-800' },
                    { icon: Share2, label: 'อื่นๆ', color: 'bg-gray-600 hover:bg-gray-700' },
                  ].map((social, i) => {
                    const Icon = social.icon
                    return (
                      <Button 
                        key={i}
                        onClick={() => handleShare(social.label)}
                        className={`gap-2 ${social.color} text-white transition-all duration-300 hover:scale-105`}
                      >
                        <Icon className="w-4 h-4" />
                        {social.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-6">
              {/* Related Articles */}
              <Card className="p-6 bg-white shadow-lg">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  บทความที่เกี่ยวข้อง
                </h3>
                <div className="space-y-4">
                  {relatedArticles.length === 0 ? (
                    <p className="text-sm text-gray-500">ยังไม่มีบทความที่เกี่ยวข้อง</p>
                  ) : (
                    relatedArticles.map((relatedArticle) => (
                      <Link 
                        key={relatedArticle.id}
                        to={`/articles/${relatedArticle.id}`}
                        className="group block"
                      >
                        <div className="flex gap-3 p-3 rounded-lg hover:bg-blue-50 transition-all duration-300">
                          <img 
                            src={relatedArticle.image || getDefaultImage()} 
                            alt={relatedArticle.title}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                              {relatedArticle.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(relatedArticle.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                <Link to="/articles">
                  <Button variant="outline" className="w-full mt-4 gap-2 hover:bg-blue-50 border-blue-300 text-blue-600">
                    ดูบทความทั้งหมด
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Button>
                </Link>
              </Card>

              {/* Tags Cloud */}
              <Card className="p-6 bg-white shadow-lg">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  <Tag className="w-5 h-5 text-blue-600" />
                  หมวดหมู่ยอดนิยม
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['เทคนิค', 'การขนส่ง', 'เทคโนโลยี', 'ส่งออก', 'แนวโน้ม', 'คู่มือ', 'นวัตกรรม'].map((tag, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-full text-xs text-blue-700 font-medium cursor-pointer transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles for Article Content */}
      <style>{`
        .article-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 3px solid #3b82f6;
        }
        
        .article-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #334155;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }
        
        .article-content p {
          color: #475569;
          line-height: 1.8;
          margin-bottom: 1.25rem;
          font-size: 1.0625rem;
        }
        
        .article-content ul {
          list-style: none;
          padding-left: 0;
          margin: 1.5rem 0;
        }
        
        .article-content ul li {
          position: relative;
          padding-left: 2rem;
          margin-bottom: 0.75rem;
          color: #475569;
          line-height: 1.7;
        }
        
        .article-content ul li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #3b82f6;
          font-weight: bold;
          font-size: 1.25rem;
        }
        
        .article-content strong {
          color: #1e293b;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}

