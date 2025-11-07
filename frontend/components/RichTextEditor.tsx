'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-white underline cursor-pointer',
        },
      }),
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const url = window.prompt('URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Max 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert('Dosya boyutu 10MB\'dan küçük olmalıdır!');
        return;
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (res.ok) {
          const data = await res.json();
          const fileUrl = data.url;
          const fileName = file.name;
          editor.chain().focus().insertContent(`<a href="${fileUrl}" class="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800">📎 ${fileName}</a> `).run();
        } else {
          alert('Dosya yükleme hatası!');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Dosya yükleme hatası!');
      }
    };
    input.click();
  };

  return (
    <div className="border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800">
      <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors ${
            editor.isActive('bold') ? 'bg-zinc-300 dark:bg-zinc-600 font-bold' : ''
          }`}
          type="button"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors ${
            editor.isActive('italic') ? 'bg-zinc-300 dark:bg-zinc-600' : ''
          }`}
          type="button"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors ${
            editor.isActive('underline') ? 'bg-zinc-300 dark:bg-zinc-600 underline' : ''
          }`}
          type="button"
        >
          <u>U</u>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors ${
            editor.isActive('strike') ? 'bg-zinc-300 dark:bg-zinc-600 line-through' : ''
          }`}
          type="button"
        >
          <s>S</s>
        </button>
        
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-zinc-300 dark:bg-zinc-600 font-bold' : ''
          }`}
          type="button"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-zinc-300 dark:bg-zinc-600 font-bold' : ''
          }`}
          type="button"
        >
          H2
        </button>
        
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />
        
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors ${
            editor.isActive('bulletList') ? 'bg-zinc-300 dark:bg-zinc-600' : ''
          }`}
          type="button"
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors ${
            editor.isActive('orderedList') ? 'bg-zinc-300 dark:bg-zinc-600' : ''
          }`}
          type="button"
        >
          1. List
        </button>
        
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />
        
        <button
          onClick={setLink}
          className={`px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors ${
            editor.isActive('link') ? 'bg-zinc-300 dark:bg-zinc-600' : ''
          }`}
          type="button"
        >
          🔗 Link
        </button>
        <button
          onClick={addAttachment}
          className="px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
          type="button"
        >
          📎 Dosya
        </button>
        
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />
        
        <input
          type="color"
          onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
          className="w-8 h-6 rounded cursor-pointer"
          title="Metin Rengi"
        />
        
        <button
          onClick={() => editor.chain().focus().unsetColor().run()}
          className="px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors text-sm"
          type="button"
        >
          Renk Sıfırla
        </button>
        
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />
        
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
          type="button"
        >
          ―
        </button>
        
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          ↶
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="px-3 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          ↷
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
