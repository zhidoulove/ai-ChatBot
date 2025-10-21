'use client'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import{Copy, Check} from 'lucide-react'

type MessageDisplayProps = {
    content: string
}

type CodeProps = {
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

export default function MessageDisplay({ content }: MessageDisplayProps) {
  //添加复制状态
  const [copied, setCopied] = useState(false)

  //复制函数
  const handleCopy = async () => {
        try{
          await navigator.clipboard.writeText(content)
          setCopied(true)
          setTimeout(() => {
            setCopied(false)
          }, 2000)
        }catch(error){
          console.error('复制失败:', error)
        }
    }
    return (
      <div className='relative message-container'>
        {/* 复制按钮 - 鼠标悬停时显示 */}
        <button
          onClick={handleCopy}
          className='copy-button absolute top-2 right-2 p-1.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 z-10'
          title={copied ? '已复制！' : '点击复制'}
        >
          {copied ? <Check className='w-4 h-4 text-green-500' /> : <Copy className='w-4 h-4 text-gray-600 dark:text-gray-400' />}
        </button>
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // 自定义代码块渲染方式
                code({inline, className, children, ...props}: CodeProps){
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style = {oneDark}
                      language = {match[1]}
                      PreTag = 'div'
                      {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                      ) : (
                        <code className='bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm' {...props}>
                          {children}
                        </code>
                      )
                },
                // 自定义段落样式
                p:({children}) => <p className='mb-2 last:mb-0'>{children}</p>,
                // 自定义列表样式
                ul:({children}) => <ul className='list-disc list-inside mb-2'>{children}</ul>,
                ol:({children}) => <ol className='list-decimal list-inside mb-2'>{children}</ol>,
                // 自定义链接样式
                a:({children, href}) =>(
                  <a href={href}
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className='text-blue-500 hover:underline'
                   >
                    {children}
                  </a>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
      </div>
    )
}