
import { useState } from "react";
import { Note } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotepadToolProps {
  notes: Note[];
  onNoteUpdate: (note: Note) => void;
  onNoteCreate: (note: Note) => void;
  onNoteDelete: (id: string) => void;
}

const NotepadTool = ({
  notes,
  onNoteUpdate,
  onNoteCreate,
  onNoteDelete,
}: NotepadToolProps) => {
  const { user } = useAuth();
  const { language } = useSettings();
  const isArabic = language === Language.Arabic;
  
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  
  const handleCreateNote = () => {
    if (!user || !noteContent.trim()) return;
    
    const newNote: Note = {
      id: uuidv4(),
      userId: user.id,
      content: noteContent.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    onNoteCreate(newNote);
    setNoteContent("");
    setIsCreating(false);
  };
  
  const handleUpdateNote = () => {
    if (!user || !activeNoteId || !noteContent.trim()) return;
    
    const noteToUpdate = notes.find(note => note.id === activeNoteId);
    
    if (noteToUpdate) {
      const updatedNote: Note = {
        ...noteToUpdate,
        content: noteContent.trim(),
        updatedAt: new Date(),
      };
      
      onNoteUpdate(updatedNote);
      setActiveNoteId(null);
      setNoteContent("");
    }
  };
  
  const handleEditNote = (note: Note) => {
    setActiveNoteId(note.id);
    setNoteContent(note.content);
    setIsCreating(false);
  };
  
  const handleCancel = () => {
    setActiveNoteId(null);
    setIsCreating(false);
    setNoteContent("");
  };

  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!isCreating && !activeNoteId ? (
          <Button onClick={() => {
            setIsCreating(true);
            setActiveNoteId(null);
            setNoteContent("");
          }}>
            <Plus className="h-4 w-4 mr-1" />
            {isArabic ? "إضافة ملاحظة" : "Add Note"}
          </Button>
        ) : (
          <Button variant="ghost" onClick={handleCancel}>
            {isArabic ? "إلغاء" : "Cancel"}
          </Button>
        )}
      </div>
      
      {(isCreating || activeNoteId) && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <Textarea 
                placeholder={isArabic ? "اكتب ملاحظتك هنا..." : "Type your note here..."}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="min-h-[200px]"
              />
              
              <div className="flex justify-end">
                <Button onClick={isCreating ? handleCreateNote : handleUpdateNote}>
                  <Save className="h-4 w-4 mr-1" />
                  {isCreating
                    ? isArabic ? "إضافة" : "Add"
                    : isArabic ? "تحديث" : "Update"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div>
        <h3 className="font-medium mb-2">{isArabic ? "ملاحظاتك" : "Your Notes"}</h3>
        
        {sortedNotes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {isArabic
                  ? "لا توجد ملاحظات بعد. أضف ملاحظتك الأولى للبدء!"
                  : "No notes yet. Add your first note to get started!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {sortedNotes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="p-4">
                    <div className="whitespace-pre-line mb-4">
                      {note.content}
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditNote(note)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        {isArabic ? "تعديل" : "Edit"}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:text-destructive"
                        onClick={() => onNoteDelete(note.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {isArabic ? "حذف" : "Delete"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default NotepadTool;
