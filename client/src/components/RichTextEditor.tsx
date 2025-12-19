import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import {
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  Paperclip,
  ChevronDown,
  Type,
  MoreHorizontal
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Start typing...",
  className = ""
}) => {
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [showInsertDropdown, setShowInsertDropdown] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable the default list extensions to use our custom ones
        bulletList: false,
        orderedList: false,
        listItem: false,
        // Disable default Link extension to avoid duplication
        link: false,
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc pl-6',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal pl-6',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'list-item',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] p-3',
        placeholder: placeholder,
      },
    },
  });

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg bg-white">
        <div className="h-10 bg-gray-50 border-b border-gray-300 animate-pulse"></div>
        <div className="p-3 h-32 bg-gray-50 animate-pulse"></div>
      </div>
    );
  }

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleAttachment = () => {
    // Placeholder for attachment functionality
    window.prompt('Attach file (placeholder):');
  };

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-white dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowFormatDropdown(!showFormatDropdown)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <Type className="w-4 h-4" />
              <span className="font-bold">Aa</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {showFormatDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 min-w-[150px]">
                <button
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 1 }).run();
                    setShowFormatDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    editor.isActive('heading', { level: 1 }) ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Heading 1
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 2 }).run();
                    setShowFormatDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    editor.isActive('heading', { level: 2 }) ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Heading 2
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().setParagraph().run();
                    setShowFormatDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    editor.isActive('paragraph') ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Paragraph
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 text-sm font-bold rounded transition-colors ${
              editor.isActive('bold')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            B
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 text-sm italic rounded transition-colors ${
              editor.isActive('italic')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            I
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMoreDropdown(!showMoreDropdown)}
              className={`px-2 py-1 text-sm rounded transition-colors ${
                editor.isActive('strike') || editor.isActive('underline')
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showMoreDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    editor.chain().focus().toggleStrike().run();
                    setShowMoreDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    editor.isActive('strike') ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Strikethrough
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().toggleCode().run();
                    setShowMoreDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    editor.isActive('code') ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Code
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* List Options */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowListDropdown(!showListDropdown)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <List className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {showListDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    editor.chain().focus().toggleBulletList().run();
                    setShowListDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    editor.isActive('bulletList') ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Bullet List
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().toggleOrderedList().run();
                    setShowListDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    editor.isActive('orderedList') ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Numbered List
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Insert Options */}
        <div className="flex items-center gap-1">
          <button
            onClick={setLink}
            className={`px-2 py-1 text-sm rounded transition-colors ${
              editor.isActive('link')
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <button
            onClick={addImage}
            className="px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowInsertDropdown(!showInsertDropdown)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <span className="text-lg">+</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {showInsertDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    editor.chain().focus().toggleCodeBlock().run();
                    setShowInsertDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Code Block
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().toggleBlockquote().run();
                    setShowInsertDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Quote
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().setHorizontalRule().run();
                    setShowInsertDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Divider
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Attachment */}
        <div className="ml-auto">
          <button
            onClick={handleAttachment}
            className="px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[150px] bg-white dark:bg-gray-800">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
