import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Edit2, Trash2, FileText, Calendar, Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'
import apiClient from '@/lib/api'

export default function ContentManagement() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
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
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถดึงข้อมูลได้',
        text: error?.response?.data?.message || 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddArticle = () => {
    navigate('/admin/content/new')
  }

  const handleEditArticle = (articleId) => {
    navigate(`/admin/content/edit/${articleId}`)
  }

  const handleDeleteArticle = (articleId) => {
    Swal.fire({
      icon: 'warning',
      title: 'ยืนยันการลบ',
      text: 'คุณแน่ใจหรือไม่ที่จะลบบทความนี้?',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/api/articles/${articleId}`)
          
          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ!',
            confirmButtonColor: '#10b981',
            timer: 1500,
          })
          
          fetchArticles()
        } catch (error) {
          console.error('delete article error', error)
          Swal.fire({
            icon: 'error',
            title: 'ลบไม่สำเร็จ',
            text: error?.response?.data?.message || 'เกิดข้อผิดพลาด',
            confirmButtonColor: '#ef4444',
          })
        }
      }
    })
  }


  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.author.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">บทความและข่าวสาร</h1>
          <p className="text-muted-foreground">จัดการบทความและข่าวสารทั้งหมด</p>
        </div>
        <Button onClick={handleAddArticle} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มบทความใหม่
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการบทความทั้งหมด</CardTitle>
          <CardDescription>
            ทั้งหมด {articles.length} บทความ
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาบทความ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" /> กำลังโหลดข้อมูล...
            </div>
          ) : (
            <div className="space-y-2">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>ยังไม่มีบทความในระบบ</p>
                  <Button onClick={handleAddArticle} variant="outline" className="mt-4">
                    เพิ่มบทความแรก
                  </Button>
                </div>
              ) : (
              filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(article.createdAt).toLocaleDateString('th-TH')}
                      </div>
                      <span>•</span>
                      <span>{article.author}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                      {article.tags && article.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex gap-1">
                            {article.tags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditArticle(article.id)}
                      className="gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      แก้ไข
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteArticle(article.id)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      ลบ
                    </Button>
                  </div>
                </div>
              ))
            )}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
