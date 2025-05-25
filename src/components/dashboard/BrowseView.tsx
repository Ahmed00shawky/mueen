import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { NewsItem } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Plus, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Sample news data (In a real app, this would come from an API)
const sampleNews = [
  {
    id: "1",
    title: "Pharmacy Association",
    summary: "Official website of the Pharmacy Association",
    imageUrl: "https://images.unsplash.com/photo-1576072115205-e4dc07b82241?q=80&w=300",
    sourceUrl: "https://example.com/news/1",
    publishedAt: new Date()
  },
  {
    id: "2",
    title: "Medical Guidelines",
    summary: "Latest medical guidelines and protocols",
    imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=300",
    sourceUrl: "https://example.com/news/2",
    publishedAt: new Date(Date.now() - 86400000)
  },
  {
    id: "3",
    title: "Healthcare Resources",
    summary: "Access to healthcare resources and information",
    imageUrl: "https://images.unsplash.com/photo-1624727828489-a1e03b79bba8?q=80&w=300",
    sourceUrl: "https://example.com/news/3",
    publishedAt: new Date(Date.now() - 172800000)
  }
];

const BrowseView = () => {
  const { language } = useSettings();
  const { isAdmin } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newNews, setNewNews] = useState<Partial<NewsItem>>({});
  const [isAddingNews, setIsAddingNews] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const isArabic = language === Language.Arabic;

  useEffect(() => {
    // Get news from storage or use sample news if not available
    const storedNews = storage.getNews();
    if (storedNews.length === 0) {
      // Initialize with sample news
      sampleNews.forEach(item => {
        storage.addNewsItem(item);
      });
      setNews(sampleNews);
    } else {
      setNews(storedNews);
    }
  }, []);

  const getWebsiteImage = async (url: string) => {
    try {
      // Add https:// if not present
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      
      // Common logo paths for popular websites
      const logoPaths = {
        'google.com': 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
        'facebook.com': 'https://static.xx.fbcdn.net/rsrc.php/y8/r/dF5SId3UHWd.svg',
        'twitter.com': 'https://abs.twimg.com/responsive-web/web/icon-default.png',
        'youtube.com': 'https://www.youtube.com/img/desktop/yt_1200.png',
        'linkedin.com': 'https://static.licdn.com/sc/h/akt4ae504epesldzj74dzred8',
        'instagram.com': 'https://static.cdninstagram.com/rsrc.php/v3/y-/r/yXM3FgMdVNX.png',
        'github.com': 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        'amazon.com': 'https://m.media-amazon.com/images/G/01/gno/sprites/nav-sprite-global-1x-hm-dsk-reorg._CB405936603_.png',
        'microsoft.com': 'https://img.icons8.com/color/48/000000/microsoft.png',
        'apple.com': 'https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png',
      };

      // Check if it's a known website
      const domain = new URL(fullUrl).hostname.replace('www.', '');
      for (const [site, logo] of Object.entries(logoPaths)) {
        if (domain.includes(site)) {
          return logo;
        }
      }

      // For unknown websites, try to get the logo from common paths
      const commonLogoPaths = [
        '/logo.png',
        '/images/logo.png',
        '/img/logo.png',
        '/assets/logo.png',
        '/static/logo.png',
        '/images/logo.svg',
        '/img/logo.svg',
        '/assets/logo.svg',
        '/static/logo.svg',
      ];

      // Try to fetch the website's logo from common paths
      for (const path of commonLogoPaths) {
        try {
          const logoUrl = new URL(path, fullUrl).toString();
          const response = await fetch(logoUrl, { method: 'HEAD' });
          if (response.ok) {
            return logoUrl;
          }
        } catch (error) {
          continue;
        }
      }

      // If no logo found, return the Mueen logo
      return '/mueen-logo.png';
    } catch (error) {
      console.error('Error fetching website image:', error);
      return '/mueen-logo.png';
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isNew: boolean = false) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setPreviewImage(imageUrl);
        if (isNew) {
          setNewNews({ ...newNews, imageUrl });
        } else if (editingNews) {
          setEditingNews({ ...editingNews, imageUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = async (url: string, isNew: boolean = false) => {
    // Remove http:// or https:// if present
    const cleanUrl = url.replace(/^https?:\/\//, '');
    
    if (isNew) {
      setNewNews({ ...newNews, sourceUrl: cleanUrl });
      // Always try to get the website image when URL changes
      const imageUrl = await getWebsiteImage(cleanUrl);
      if (imageUrl) {
        setNewNews(prev => ({ ...prev, imageUrl }));
      }
    } else if (editingNews) {
      setEditingNews({ ...editingNews, sourceUrl: cleanUrl });
      // Always try to get the website image when URL changes
      const imageUrl = await getWebsiteImage(cleanUrl);
      if (imageUrl) {
        setEditingNews(prev => ({ ...prev, imageUrl }));
      }
    }
  };

  const handleEditNews = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setPreviewImage(null);
  };

  const handleSaveNews = () => {
    if (editingNews) {
      storage.updateNewsItem(editingNews);
      setNews(storage.getNews());
      setEditingNews(null);
      setPreviewImage(null);
    }
  };

  const handleDeleteNews = (id: string) => {
    if (window.confirm(isArabic ? "هل أنت متأكد من حذف هذا الرابط؟" : "Are you sure you want to delete this link?")) {
      storage.deleteNewsItem(id);
      setNews(storage.getNews());
    }
  };

  const handleAddNews = async () => {
    if (newNews.title && newNews.sourceUrl) {
      let imageUrl = newNews.imageUrl;
      if (!imageUrl) {
        imageUrl = await getWebsiteImage(`https://${newNews.sourceUrl}`);
      }

      const newsItem: NewsItem = {
        id: Date.now().toString(),
        title: newNews.title,
        summary: newNews.summary || '',
        imageUrl: imageUrl,
        sourceUrl: newNews.sourceUrl,
        publishedAt: new Date()
      };
      storage.addNewsItem(newsItem);
      setNews(storage.getNews());
      setNewNews({});
      setIsAddingNews(false);
      setPreviewImage(null);
    }
  };

  const handleCardClick = (item: NewsItem) => {
    if (!editingNews) {
      window.open(`https://${item.sourceUrl}`, '_blank');
    }
  };

  const renderImagePreview = (imageUrl: string | undefined, isEditing: boolean = false) => {
    const displayImage = isEditing ? (previewImage || imageUrl) : imageUrl;
    if (!displayImage) return null;

    return (
      <div className="h-32 overflow-hidden relative">
        <img 
          src={displayImage} 
          alt="Preview" 
          className="w-full h-full object-contain bg-muted"
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24 max-w-7xl">
      {/* Important Links */}
      <Card className="overflow-hidden">
        <div className="bg-primary px-4 py-3 text-primary-foreground flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {isArabic ? "روابط مهمة" : "Important Links"}
          </h3>
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:text-primary-foreground/80 transition-colors duration-200"
              onClick={() => setIsAddingNews(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              {isArabic ? "إضافة رابط" : "Add Link"}
            </Button>
          )}
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {isAddingNews && (
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 ease-in-out">
                <CardContent className="p-4 space-y-4">
                  {renderImagePreview(newNews.imageUrl, true)}
                  <Input
                    placeholder={isArabic ? "عنوان الرابط" : "Link Title"}
                    value={newNews.title || ''}
                    onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                  />
                  <Textarea
                    placeholder={isArabic ? "وصف الرابط (اختياري)" : "Link Description (Optional)"}
                    value={newNews.summary || ''}
                    onChange={(e) => setNewNews({ ...newNews, summary: e.target.value })}
                  />
                  <div className="space-y-2">
                    <Label>{isArabic ? "رابط الموقع" : "Website URL"}</Label>
                    <Input
                      placeholder="example.com"
                      value={newNews.sourceUrl || ''}
                      onChange={(e) => handleUrlChange(e.target.value, true)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? "صورة (اختياري)" : "Image (Optional)"}</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => {
                      setIsAddingNews(false);
                      setPreviewImage(null);
                    }}>
                      {isArabic ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button onClick={handleAddNews}>
                      {isArabic ? "حفظ" : "Save"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            {news.map((item) => (
              <div key={item.id} className="relative group mb-16">
                <div 
                  className="cursor-pointer"
                  onClick={() => handleCardClick(item)}
                >
                  <Card 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      !editingNews ? 'hover:shadow-xl hover:-translate-y-1 active:scale-95' : ''
                    }`}
                  >
                    {editingNews?.id === item.id ? (
                      <CardContent className="p-4 space-y-4">
                        {renderImagePreview(editingNews.imageUrl, true)}
                        <Input
                          value={editingNews.title}
                          onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                        />
                        <Textarea
                          value={editingNews.summary}
                          onChange={(e) => setEditingNews({ ...editingNews, summary: e.target.value })}
                        />
                        <div className="space-y-2">
                          <Label>{isArabic ? "رابط الموقع" : "Website URL"}</Label>
                          <Input
                            value={editingNews.sourceUrl}
                            onChange={(e) => handleUrlChange(e.target.value)}
                            placeholder="example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{isArabic ? "صورة (اختياري)" : "Image (Optional)"}</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" onClick={() => {
                            setEditingNews(null);
                            setPreviewImage(null);
                          }}>
                            {isArabic ? "إلغاء" : "Cancel"}
                          </Button>
                          <Button onClick={handleSaveNews}>
                            {isArabic ? "حفظ" : "Save"}
                          </Button>
                        </div>
                      </CardContent>
                    ) : (
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img 
                          src={item.imageUrl || '/mueen-logo.png'} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium mb-2 text-foreground line-clamp-2">
                                {item.title}
                              </h4>
                            </div>
                            {item.summary && (
                              <p className="text-sm text-foreground/90 line-clamp-3">
                                {item.summary}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
                {isAdmin && !editingNews && (
                  <div 
                    className="absolute -bottom-12 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-background hover:bg-primary/20 transition-colors duration-200 shadow-md"
                      onClick={() => handleEditNews(item)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      {isArabic ? "تعديل" : "Edit"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-background hover:bg-destructive/20 hover:text-destructive transition-colors duration-200 shadow-md"
                      onClick={() => handleDeleteNews(item.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isArabic ? "حذف" : "Delete"}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default BrowseView;
