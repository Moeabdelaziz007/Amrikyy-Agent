import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageContext } from '../contexts/AppContexts';
import { useTheme } from '../contexts/ThemeContext';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotesApp: React.FC = () => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();

  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: lang === 'en' ? 'Welcome to Notes' : 'مرحباً بك في الملاحظات',
      content: lang === 'en' 
        ? 'This is your first note. You can create, edit, and delete notes here.'
        : 'هذه أول ملاحظة لك. يمكنك إنشاء وتحرير وحذف الملاحظات هنا.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: lang === 'en' ? 'New Note' : 'ملاحظة جديدة',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setIsEditing(true);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    if (selectedNote?.id === id) {
      setSelectedNote(updatedNotes[0] || null);
      setIsEditing(false);
    }
  };

  const handleEditNote = () => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
      setIsEditing(true);
    }
  };

  const handleSaveNote = () => {
    if (selectedNote) {
      const updatedNotes = notes.map(note =>
        note.id === selectedNote.id
          ? { ...note, title: editTitle, content: editContent, updatedAt: new Date() }
          : note
      );
      setNotes(updatedNotes);
      setSelectedNote({ ...selectedNote, title: editTitle, content: editContent, updatedAt: new Date() });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="h-full flex bg-background text-text">
      {/* Notes List Sidebar */}
      <div className="w-64 border-r flex flex-col" style={{ borderColor: theme.colors.border }}>
        <div className="p-3 border-b" style={{ borderColor: theme.colors.border }}>
          <button
            onClick={handleNewNote}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            <span className="font-semibold">{lang === 'en' ? 'New Note' : 'ملاحظة جديدة'}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                setSelectedNote(note);
                setIsEditing(false);
              }}
              className={`p-3 border-b cursor-pointer hover:bg-white/5 transition-colors ${
                selectedNote?.id === note.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
              }`}
              style={{ borderBottomColor: theme.colors.border }}
            >
              <h3 className="font-semibold text-sm mb-1 line-clamp-1">{note.title}</h3>
              <p className="text-xs text-text-secondary line-clamp-2 mb-1">{note.content || (lang === 'en' ? 'Empty note' : 'ملاحظة فارغة')}</p>
              <p className="text-xs text-text-secondary">{formatDate(note.updatedAt)}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Note Content */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: theme.colors.border }}>
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 text-2xl font-bold bg-transparent outline-none"
                  placeholder={lang === 'en' ? 'Note title...' : 'عنوان الملاحظة...'}
                />
              ) : (
                <h1 className="text-2xl font-bold">{selectedNote.title}</h1>
              )}
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveNote}
                      className="p-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
                      title={lang === 'en' ? 'Save' : 'حفظ'}
                    >
                      <Save size={18} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      title={lang === 'en' ? 'Cancel' : 'إلغاء'}
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEditNote}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      title={lang === 'en' ? 'Edit' : 'تحرير'}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(selectedNote.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                      title={lang === 'en' ? 'Delete' : 'حذف'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full bg-transparent outline-none resize-none text-lg"
                  placeholder={lang === 'en' ? 'Start typing...' : 'ابدأ الكتابة...'}
                />
              ) : (
                <div className="text-lg whitespace-pre-wrap">
                  {selectedNote.content || (
                    <span className="text-text-secondary italic">
                      {lang === 'en' ? 'No content yet. Click edit to add.' : 'لا يوجد محتوى بعد. انقر فوق تحرير للإضافة.'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t text-xs text-text-secondary" style={{ borderColor: theme.colors.border }}>
              {lang === 'en' ? 'Last updated:' : 'آخر تحديث:'} {formatDate(selectedNote.updatedAt)}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-secondary">
            <div className="text-center">
              <Edit className="w-24 h-24 mx-auto mb-4 opacity-20" />
              <p>{lang === 'en' ? 'No note selected' : 'لم يتم تحديد ملاحظة'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesApp;
