import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Baseline,
  Highlighter,
  List,
  ListOrdered,
  Link2
} from 'lucide-react'
import { cn, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'

interface RichTextEditorProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  isRequired?: boolean
  isInvalid?: boolean
  minHeight?: string
  toolbar?: 'full' | 'minimal'
}

const COLORS = [
  '#000000', '#444444', '#666666', '#999999', '#cccccc', '#eeeeee', '#f3f3f3', '#ffffff',
  '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff',
  '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0',
]

const FONT_SIZES = [
  { label: 'Nhỏ', value: '1' },
  { label: 'Thường', value: '3' },
  { label: 'Lớn', value: '5' },
  { label: 'Rất lớn', value: '7' },
]

export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  (
    {
      label,
      value = '',
      onChange,
      onBlur,
      placeholder = 'Nhập nội dung...',
      className,
      isRequired,
      isInvalid,
      minHeight = '200px',
      toolbar = 'full'
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null)
    const [isFocused, setIsFocused] = useState(false)
    const [hasContent, setHasContent] = useState(false)

    useImperativeHandle(ref, () => editorRef.current as HTMLDivElement)

    // Sync content from prop to editor only when needed
    useEffect(() => {
      if (editorRef.current) {
        // Only update if external value is different AND not focused 
        // OR if editor is empty but value exists
        const currentHTML = editorRef.current.innerHTML
        if (value !== currentHTML) {
          if (!isFocused || (currentHTML === '' || currentHTML === '<br>' || currentHTML === '<p><br></p>')) {
             editorRef.current.innerHTML = value || ''
             setHasContent(!!(editorRef.current.innerText.trim() || value))
          }
        }
      }
    }, [value, isFocused])

    const handleInput = () => {
      if (editorRef.current) {
        const content = editorRef.current.innerHTML
        const isEmpty = editorRef.current.innerText.trim().length === 0 && !editorRef.current.querySelector('img')
        setHasContent(!isEmpty)
        onChange?.(isEmpty ? '' : content)
      }
    }

    const execCommand = (command: string, val: string = '') => {
      // Save selection before focusing (focus() can reset cursor position)
      const sel = window.getSelection()
      const savedRange = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null

      editorRef.current?.focus()

      // Restore saved selection after focus
      if (savedRange && sel) {
        sel.removeAllRanges()
        sel.addRange(savedRange)
      }

      document.execCommand(command, false, val)
      handleInput()
    }

    // Custom list insertion — more reliable than execCommand('insertOrderedList')
    const insertList = (type: 'ol' | 'ul') => {
      const editor = editorRef.current
      if (!editor) return
      editor.focus()

      const sel = window.getSelection()
      if (!sel) return

      // Determine range
      const range = sel.rangeCount > 0 ? sel.getRangeAt(0) : document.createRange()

      // Build list element
      const list = document.createElement(type)
      const li = document.createElement('li')

      if (!range.collapsed) {
        // Wrap selected content inside <li>
        li.appendChild(range.extractContents())
      } else {
        // Empty cursor: create empty li
        li.appendChild(document.createElement('br'))
      }
      list.appendChild(li)

      range.deleteContents()
      range.insertNode(list)

      // Place cursor inside <li>
      const newRange = document.createRange()
      newRange.setStart(li, li.childNodes.length)
      newRange.collapse(true)
      sel.removeAllRanges()
      sel.addRange(newRange)

      handleInput()
    }

    const ToolbarButton = ({
      icon: Icon,
      onClick,
      title,
      active = false
    }: {
      icon: any
      onClick: () => void
      title: string
      active?: boolean
    }) => (
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          onClick()
        }}
        className={cn(
          "p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors flex items-center justify-center",
          active && "bg-blue-50 text-blue-600"
        )}
        title={title}
      >
        <Icon size={16} />
      </button>
    )

    return (
      <div className={cn('relative flex flex-col', className)}>
        {/* Label */}
        {label && (
          <div className="mb-1.5 flex items-center gap-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
            {isRequired && <span className="text-red-500 font-bold">*</span>}
          </div>
        )}

        {/* Toolbar Container */}
        {toolbar === 'minimal' ? (
          <div className="flex items-center gap-0.5 px-1 py-0.5 bg-white border border-gray-200 rounded-t-lg dark:bg-gray-800 dark:border-gray-700">
            <ToolbarButton icon={Bold} onClick={() => execCommand('bold')} title="In đậm" />
            <ToolbarButton icon={Italic} onClick={() => execCommand('italic')} title="In nghiêng" />
            <ToolbarButton icon={Underline} onClick={() => execCommand('underline')} title="Gạch chân" />
            <div className="w-px h-5 bg-gray-200 mx-1 dark:bg-gray-600" />
            <ToolbarButton icon={ListOrdered} onClick={() => insertList('ol')} title="Danh sách có số" />
            <ToolbarButton icon={List} onClick={() => insertList('ul')} title="Danh sách gạch đầu dòng" />
            <div className="w-px h-5 bg-gray-200 mx-1 dark:bg-gray-600" />
            <ToolbarButton
              icon={Link2}
              title="Chèn liên kết"
              onClick={() => {
                const url = prompt('Nhập URL:')
                if (url) execCommand('createLink', url)
              }}
            />
            <ToolbarButton icon={Type} onClick={() => execCommand('removeFormat')} title="Xóa định dạng" />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-0.5 p-1 bg-gray-50 border border-gray-200 rounded-t-lg dark:bg-gray-800/50 dark:border-gray-700">
            <ToolbarButton icon={Bold} onClick={() => execCommand('bold')} title="In đậm" />
            <ToolbarButton icon={Italic} onClick={() => execCommand('italic')} title="In nghiêng" />
            <ToolbarButton icon={Underline} onClick={() => execCommand('underline')} title="Gạch chân" />
            
            <div className="w-px h-6 bg-gray-200 mx-1 dark:bg-gray-700" />
            
            <ToolbarButton icon={AlignLeft} onClick={() => execCommand('justifyLeft')} title="Căn trái" />
            <ToolbarButton icon={AlignCenter} onClick={() => execCommand('justifyCenter')} title="Căn giữa" />
            <ToolbarButton icon={AlignRight} onClick={() => execCommand('justifyRight')} title="Căn phải" />
            
            <div className="w-px h-6 bg-gray-200 mx-1 dark:bg-gray-700" />

            {/* Color Picker */}
            <Popover placement="bottom-start" showArrow>
              <PopoverTrigger>
                 <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-600 outline-none" title="Màu chữ">
                   <Palette size={16} />
                 </button>
              </PopoverTrigger>
              <PopoverContent className="p-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                 <div className="grid grid-cols-8 gap-1">
                   {COLORS.map(color => (
                     <div 
                      key={color} 
                      className="w-4 h-4 rounded-sm cursor-pointer border border-gray-100 hover:scale-125 transition-transform" 
                      style={{ backgroundColor: color }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        execCommand('foreColor', color)
                      }}
                     />
                   ))}
                 </div>
              </PopoverContent>
            </Popover>

            {/* Background Color Picker */}
            <Popover placement="bottom-start" showArrow>
              <PopoverTrigger>
                 <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-600 outline-none" title="Màu nền">
                   <Highlighter size={16} />
                 </button>
              </PopoverTrigger>
              <PopoverContent className="p-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                 <div className="grid grid-cols-8 gap-1">
                   {COLORS.map(color => (
                     <div 
                      key={color} 
                      className="w-4 h-4 rounded-sm cursor-pointer border border-gray-100 hover:scale-125 transition-transform" 
                      style={{ backgroundColor: color }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        execCommand('hiliteColor', color)
                      }}
                     />
                   ))}
                 </div>
                 <button 
                  className="w-full mt-2 py-1 text-[10px] bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded border border-gray-200 dark:border-gray-600"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    execCommand('hiliteColor', 'transparent')
                  }}
                 >
                   Xóa màu nền
                 </button>
              </PopoverContent>
            </Popover>

            {/* Font Size Picker */}
            <Popover placement="bottom-start" showArrow>
              <PopoverTrigger>
                 <button type="button" className="p-2 rounded hover:bg-gray-100 text-gray-600 outline-none flex items-center gap-1" title="Cỡ chữ">
                   <Baseline size={16} />
                   <span className="text-[10px] uppercase font-bold">Size</span>
                 </button>
              </PopoverTrigger>
              <PopoverContent className="p-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                 <div className="flex flex-col">
                   {FONT_SIZES.map(size => (
                     <button
                      key={size.value}
                      className="text-left px-3 py-1.5 text-sm hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        execCommand('fontSize', size.value)
                      }}
                     >
                       {size.label}
                     </button>
                   ))}
                 </div>
              </PopoverContent>
            </Popover>

            <div className="w-px h-6 bg-gray-200 mx-1 dark:bg-gray-700" />
            <ToolbarButton icon={Type} onClick={() => execCommand('removeFormat')} title="Xóa định dạng" />
          </div>
        )}

        {/* Editor Area */}
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck="false"
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false)
              onBlur?.()
            }}
            onKeyDown={(e) => {
               if (e.key === 'Tab') {
                  e.preventDefault()
                  execCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;')
               }
            }}
            className={cn(
              'w-full p-4 outline-none border border-gray-200 border-t-0 rounded-b-lg prose prose-sm max-w-none dark:prose-invert overflow-y-auto custom-scrollbar text-[13px] leading-relaxed rich-text-content resize-y',
              isFocused && 'ring-2 ring-blue-500/10 border-blue-400',
              isInvalid && 'border-red-500 ring-red-500/10',
              !isFocused && !isInvalid && 'bg-white dark:bg-gray-800'
            )}
            style={{ minHeight }}
          />

          {/* Placeholder */}
          {!hasContent && !isFocused && (
            <div className="absolute top-4 left-4 text-gray-400 pointer-events-none text-sm italic opacity-70">
              {placeholder}
            </div>
          )}
        </div>
        
        {isInvalid && (
          <span className="mt-1 text-xs text-red-500">Trường này là bắt buộc</span>
        )}
      </div>
    )
  }
)

RichTextEditor.displayName = 'RichTextEditor'
