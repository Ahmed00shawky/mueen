import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { NewsItem } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Sample news data (In a real app, this would come from an API)
const sampleNews = [
  {
    id: "1",
    title: "New Breakthrough in Pharmacy Research",
    summary: "Scientists have discovered a promising new approach to drug delivery systems that could revolutionize treatment methods.",
    imageUrl: "https://images.unsplash.com/photo-1576072115205-e4dc07b82241?q=80&w=300",
    sourceUrl: "https://example.com/news/1",
    publishedAt: new Date()
  },
  {
    id: "2",
    title: "FDA Approves New Medication for Chronic Pain Management",
    summary: "The FDA has recently approved a new medication targeted at managing chronic pain with fewer side effects than traditional options.",
    imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=300",
    sourceUrl: "https://example.com/news/2",
    publishedAt: new Date(Date.now() - 86400000)
  },
  {
    id: "3",
    title: "Medical Community Debates New Healthcare Policies",
    summary: "Healthcare professionals are discussing the implications of newly proposed policies on patient care and healthcare accessibility.",
    imageUrl: "https://images.unsplash.com/photo-1624727828489-a1e03b79bba8?q=80&w=300",
    sourceUrl: "https://example.com/news/3",
    publishedAt: new Date(Date.now() - 172800000)
  }
];

// Sample info fields
const infoFields = [
  { id: 1, title: "Emergency Contacts", content: "Hospital: +123-456-7890\nPoison Control: +123-456-7891\nPharmacy Hotline: +123-456-7892" },
  { id: 2, title: "Medicine Reference", content: "Access the medicine reference database for detailed information on medications, dosages, and interactions." },
  { id: 3, title: "Health Reminders", content: "Stay up to date with health reminders and vaccination schedules." },
  { id: 4, title: "Staff Directory", content: "Find contact information for all medical staff members." },
  { id: 5, title: "Treatment Guidelines", content: "Access the latest treatment protocols and guidelines for various medical conditions." },
  { id: 6, title: "Medical Resources", content: "Links to trusted medical resources and research papers." }
];

const BrowseView = () => {
  const { language } = useSettings();
  const { isAdmin } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [editingField, setEditingField] = useState<number | null>(null);
  const [fieldContent, setFieldContent] = useState("");
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newNews, setNewNews] = useState<Partial<NewsItem>>({});
  const [isAddingNews, setIsAddingNews] = useState(false);
  
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

  const handleEditField = (id: number, content: string) => {
    setEditingField(id);
    setFieldContent(content);
  };

  const handleSaveField = (id: number) => {
    setEditingField(null);
    // In a real app, save the updated content to your database
    console.log(`Updated field ${id} with content: ${fieldContent}`);
  };

  const handleEditNews = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
  };

  const handleSaveNews = () => {
    if (editingNews) {
      storage.updateNewsItem(editingNews);
      setNews(storage.getNews());
      setEditingNews(null);
    }
  };

  const handleDeleteNews = (id: string) => {
    storage.deleteNewsItem(id);
    setNews(storage.getNews());
  };

  const handleAddNews = () => {
    if (newNews.title && newNews.summary) {
      const newsItem: NewsItem = {
        id: Date.now().toString(),
        title: newNews.title,
        summary: newNews.summary,
        imageUrl: newNews.imageUrl,
        sourceUrl: newNews.sourceUrl || '#',
        publishedAt: new Date()
      };
      storage.addNewsItem(newsItem);
      setNews(storage.getNews());
      setNewNews({});
      setIsAddingNews(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* News Ticker */}
      <Card className="overflow-hidden">
        <div className="bg-primary px-4 py-2 text-primary-foreground flex justify-between items-center">
          <h3 className="font-medium">
            {isArabic ? "أخبار الصيدلة" : "Pharmacy News"}
          </h3>
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:text-primary-foreground/80"
              onClick={() => setIsAddingNews(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              {isArabic ? "إضافة خبر" : "Add News"}
            </Button>
          )}
        </div>
        <ScrollArea className="h-60">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {isAddingNews && (
              <Card className="overflow-hidden">
                <CardContent className="p-4 space-y-4">
                  <Input
                    placeholder={isArabic ? "عنوان الخبر" : "News Title"}
                    value={newNews.title || ''}
                    onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                  />
                  <Textarea
                    placeholder={isArabic ? "ملخص الخبر" : "News Summary"}
                    value={newNews.summary || ''}
                    onChange={(e) => setNewNews({ ...newNews, summary: e.target.value })}
                  />
                  <Input
                    placeholder={isArabic ? "رابط الصورة" : "Image URL"}
                    value={newNews.imageUrl || ''}
                    onChange={(e) => setNewNews({ ...newNews, imageUrl: e.target.value })}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsAddingNews(false)}>
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
              <Card key={item.id} className="overflow-hidden">
                {editingNews?.id === item.id ? (
                  <CardContent className="p-4 space-y-4">
                    <Input
                      value={editingNews.title}
                      onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                    />
                    <Textarea
                      value={editingNews.summary}
                      onChange={(e) => setEditingNews({ ...editingNews, summary: e.target.value })}
                    />
                    <Input
                      value={editingNews.imageUrl || ''}
                      onChange={(e) => setEditingNews({ ...editingNews, imageUrl: e.target.value })}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setEditingNews(null)}>
                        {isArabic ? "إلغاء" : "Cancel"}
                      </Button>
                      <Button onClick={handleSaveNews}>
                        {isArabic ? "حفظ" : "Save"}
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  <>
                    {item.imageUrl && (
                      <div className="h-32 overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{item.summary}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          {new Date(item.publishedAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditNews(item)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteNews(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Info Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {infoFields.map((field) => (
          <Card key={field.id} className="overflow-hidden">
            <div className="bg-secondary px-4 py-2">
              <h3 className="font-medium">{field.title}</h3>
            </div>
            <CardContent className="p-4">
              {editingField === field.id ? (
                <div className="space-y-4">
                  <textarea
                    value={fieldContent}
                    onChange={(e) => setFieldContent(e.target.value)}
                    className="w-full min-h-[100px] p-2 border rounded-md"
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      className="px-3 py-1 bg-muted rounded-md text-sm"
                      onClick={() => setEditingField(null)}
                    >
                      {isArabic ? "إلغاء" : "Cancel"}
                    </button>
                    <button 
                      className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm"
                      onClick={() => handleSaveField(field.id)}
                    >
                      {isArabic ? "حفظ" : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="whitespace-pre-line">{field.content}</p>
                  {isAdmin && (
                    <div className="mt-4 flex justify-end">
                      <button 
                        className="text-sm text-primary"
                        onClick={() => handleEditField(field.id, field.content)}
                      >
                        {isArabic ? "تعديل" : "Edit"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BrowseView;
