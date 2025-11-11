import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import apiClient from '@/lib/api'
import Swal from 'sweetalert2'


export default function AddEditArticle() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [articleForm, setArticleForm] = useState({
    title: '',
    excerpt: '',
    author: 'ทีมงาน teeyaiimport',
    readTime: '5 นาที',
    tags: '',
  })
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [existingImage, setExistingImage] = useState('')
  const [imageUploading, setImageUploading] = useState(false)

  const previousPreviewRef = useRef(null)

  const editor = useEditor({
    extensions: [StarterKit, ImageExtension],
    content: '<p>เขียนเนื้อหาบทความของคุณที่นี่...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4'
      }
    }
  })

  useEffect(() => {
    if (isEditing && editor) {
      fetchArticle()
    }
  }, [isEditing, id, editor])

  const fetchArticle = async () => {
    try {
      const { data } = await apiClient.get(`/api/articles/${id}`)
      const article = data?.data

      if (article) {
        setArticleForm({
          title: article.title,
          excerpt: article.excerpt || '',
          author: article.author,
          readTime: article.readTime,
          tags: Array.isArray(article.tags) ? article.tags.join(', ') : ''
        })
        if (article.image) {
          setExistingImage(article.image)
        }
        if (editor && article.content) {
          editor.commands.setContent(article.content)
        }
      }
    } catch (error) {
      console.error('fetch article error', error)
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถดึงข้อมูลบทความได้',
        text: error?.response?.data?.message || 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#ef4444',
      }).then(() => {
        navigate('/admin/content')
      })
    }
  }

  useEffect(() => {
    return () => {
      if (previousPreviewRef.current && previousPreviewRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(previousPreviewRef.current)
      }
    }
  }, [])

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'ไฟล์ใหญ่เกินไป',
        text: 'ขนาดไฟล์ต้องไม่เกิน 5MB',
        confirmButtonColor: '#ef4444'
      })
      return
    }

    if (previousPreviewRef.current && previousPreviewRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(previousPreviewRef.current)
    }

    const previewUrl = URL.createObjectURL(file)
    previousPreviewRef.current = previewUrl
    setImagePreview(previewUrl)
    setImageUploading(true)

    const formData = new FormData()
    formData.append('image', file)
    formData.append('folder', 'teeyai/articles')

    try {
      const { data } = await apiClient.post('/api/uploads/image', formData)
      if (!data?.url) {
        throw new Error('ไม่พบ URL ของรูปภาพจาก Cloudinary')
      }

      setImageUrl(data.url)
      setExistingImage('')

      Swal.fire({
        icon: 'success',
        title: 'อัพโหลดรูปภาพสำเร็จ!',
        confirmButtonColor: '#10b981',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (error) {
      console.error(error)
      setImageUrl('')
      setImagePreview('')
      Swal.fire({
        icon: 'error',
        title: 'อัพโหลดไม่สำเร็จ',
        text: error.message || 'กรุณาลองใหม่อีกครั้ง',
        confirmButtonColor: '#ef4444'
      })
    } finally {
      setImageUploading(false)
    }
  }

  const handleRemoveImage = () => {
    if (previousPreviewRef.current && previousPreviewRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(previousPreviewRef.current)
    }
    previousPreviewRef.current = null
    setImageUrl('')
    setImagePreview('')
    setExistingImage('')
  }

  const handleSave = async () => {
    if (!articleForm.title || !articleForm.excerpt || !editor?.getHTML()) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกหัวข้อ สรุป และเนื้อหาให้ครบถ้วน',
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'ตกลง'
      })
      return
    }

    const tagsArray = articleForm.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag)

    const finalImage = imageUrl || existingImage || null

    const payload = {
      title: articleForm.title,
      excerpt: articleForm.excerpt,
      content: editor.getHTML(),
      image: finalImage,
      author: articleForm.author,
      readTime: articleForm.readTime,
      tags: tagsArray,
    }

    try {
      if (isEditing) {
        await apiClient.put(`/api/articles/${id}`, payload)

        Swal.fire({
          icon: 'success',
          title: 'อัพเดตบทความสำเร็จ!',
          confirmButtonColor: '#3b82f6',
          timer: 1500,
        }).then(() => {
          navigate('/admin/content')
        })
      } else {
        await apiClient.post('/api/articles', payload)

        Swal.fire({
          icon: 'success',
          title: 'เพิ่มบทความใหม่สำเร็จ!',
          confirmButtonColor: '#10b981',
          timer: 1500,
        }).then(() => {
          navigate('/admin/content')
        })
      }
    } catch (error) {
      console.error('save article error', error)
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: error?.response?.data?.message || 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#ef4444',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/content')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับ
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEditing ? 'แก้ไขบทความ' : 'เพิ่มบทความใหม่'}</h1>
            <p className="text-muted-foreground">
              {isEditing ? 'แก้ไขข้อมูลบทความของคุณ' : 'สร้างบทความใหม่สำหรับเว็บไซต์'}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={imageUploading}>
          {imageUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEditing ? 'บันทึกการแก้ไข' : 'เผยแพร่บทความ'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลหลัก</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">หัวข้อบทความ <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="เช่น 5 เทคนิคเพิ่มประสิทธิภาพการขนส่ง..."
                  value={articleForm.title}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  className="text-lg"
                />
              </div>
              <div>
                <Label htmlFor="excerpt">สรุปบทความ <span className="text-red-500">*</span></Label>
                <textarea
                  id="excerpt"
                  placeholder="เขียนสรุปสั้นๆ เกี่ยวกับบทความนี้..."
                  value={articleForm.excerpt}
                  onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>เนื้อหาบทความ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={editor?.isActive('bold') ? 'bg-gray-200' : ''}
                >
                  <strong>B</strong>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={editor?.isActive('italic') ? 'bg-gray-200' : ''}
                >
                  <em>I</em>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
                >
                  H2
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
                >
                  H3
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={editor?.isActive('bulletList') ? 'bg-gray-200' : ''}
                >
                  • List
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={editor?.isActive('orderedList') ? 'bg-gray-200' : ''}
                >
                  1. List
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden bg-white">
                <EditorContent editor={editor} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>รูปภาพปก</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(imagePreview || imageUrl || existingImage) ? (
                <div className="relative">
                  <img
                    src={imagePreview || imageUrl || existingImage}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">อัพโหลดรูปภาพปก</p>
                  <p className="text-xs text-gray-400 mb-4">PNG, JPG (สูงสุด 5MB)</p>
                </div>
              )}
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('imageUpload')?.click()}
                disabled={imageUploading}
              >
                {imageUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ImageIcon className="h-4 w-4 mr-2" />
                )}
                {imageUploading ? 'กำลังอัพโหลด...' : (imagePreview || imageUrl || existingImage ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ')}
              </Button>
              <p className="text-xs text-muted-foreground">
                * ระบบจะอัพโหลดรูปไปที่ Cloudinary และบันทึก URL อัตโนมัติ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลเพิ่มเติม</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="author">ผู้เขียน</Label>
                <Input
                  id="author"
                  value={articleForm.author}
                  onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="readTime">เวลาอ่าน</Label>
                <Input
                  id="readTime"
                  placeholder="5 นาที"
                  value={articleForm.readTime}
                  onChange={(e) => setArticleForm({ ...articleForm, readTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (คั่นด้วยเครื่องหมายจุลภาค)</Label>
                <Input
                  id="tags"
                  placeholder="เทคนิค, การขนส่ง, ประสิทธิภาพ"
                  value={articleForm.tags}
                  onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
