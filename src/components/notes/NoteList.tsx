import { useState } from "react";
import { Note } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";

interface NoteListProps {
  notes: Note[];
  onNoteUpdate: (note: Note) => void;
  onNoteDelete: (id: string) => void;
}

const NoteList = ({ notes, onNoteUpdate, onNoteDelete }: NoteListProps) => {
  const { language } = useSettings();
  const isArabic = language === Language.Arabic;
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (editingNote) {
      onNoteUpdate({
        ...editingNote,
        content: editContent.trim(),
        updatedAt: new Date()
      });
      setEditingNote(null);
      setEditContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditContent("");
  };

  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (notes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-4">
          {isArabic 
            ? "لا توجد ملاحظات بعد. أضف ملاحظتك الأولى للبدء!"
            : "No notes yet. Add your first note to get started!"}
        </p>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedNotes.map((note) => (
          <Card key={note.id} className="overflow-hidden">
            <div className="p-4">
              {editingNote?.id === note.id ? (
                <div className="space-y-4">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[100px] bg-background text-foreground"
                    placeholder={isArabic ? "اكتب ملاحظتك هنا..." : "Type your note here..."}
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={handleSaveEdit} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Save className="h-4 w-4 mr-1" />
                      {isArabic ? "حفظ" : "Save"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="hover:bg-accent hover:text-accent-foreground">
                      <X className="h-4 w-4 mr-1" />
                      {isArabic ? "إلغاء" : "Cancel"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-2 whitespace-pre-line">
                    {note.content}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(note.updatedAt), "PPP p")}
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleEdit(note)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 hover:text-destructive"
                        onClick={() => onNoteDelete(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default NoteList;
