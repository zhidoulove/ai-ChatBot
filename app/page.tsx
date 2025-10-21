'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import MessageDisplay from './component/MessageDisplay'
import Sidebar from './component/Sidebar'
import { useTheme } from 'next-themes'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {Button} from '@/components/ui/button'

import{
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Settings } from 'lucide-react'
import {Moon,  Sun } from 'lucide-react'
  

// 定义消息的类型
type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// 定义对话（聊天会话）的类型
type Chat = {
  id: string           // 对话的唯一标识
  name: string         // 对话的名称（用于显示在侧边栏）
  messages: Message[]  // 这个对话中的所有消息
  createdAt: number    // 创建时间（时间戳）
  isPinned?: boolean    // 是否置顶
}

//定义AI模型的类型
type ModelId =
  | 'deepseek-chat'
  | 'deepseek-coder'

//定义模型配置
type ModelConfig = {
  id: ModelId
  name: string
  provider: string
  description: string
}

// DeepSeek 模型列表配置
const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'DeepSeek',
    description: '强大的对话模型，性价比极高'
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'DeepSeek',
    description: '专为编程优化的模型'
  }
]

//定义对话设置类型
type ChatSettings = {
  temperature: number
  maxTokens: number
  systemPrompt: string
}

//对话设置的默认值
const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: '你是一个有帮助的AI助手，请用简洁、准确、有礼貌的语言与用户交流'
}

export default function Home() {
  // 状态1：存储所有的对话
  const [chats, setChats] = useState<Chat[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chats')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          //解析失败，返回默认值
        }
      }

    }
    return [
      {
        id: '1',
        name: '新对话',
        messages: [
          {
            id: '1',
            role: 'assistant',
            content: '你好！我是你的 AI 助手，有什么可以帮助你的吗？'
          }
        ],
        createdAt: Date.now()
      }
    ]
  }
  )
  //状态2：当前选中的对话
  const [currentChatId, setCurrentChatId] = useState<string>('1')

  // 状态3：存储输入框中的文字
  const [input, setInput] = useState('')

  // 状态4：记录 AI 是否正在回复
  const [isLoading, setIsLoading] = useState(false)

  //状态5：当前选择的模型
  const [selectedModel, setSelectedModel] = useState<ModelId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedModel')
      if (saved) {
        return saved as ModelId
      }
    }
    return 'deepseek-chat'
  })

  //状态6：对话设置
  const [settings, setSettings] = useState<ChatSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('settings')
      if (saved) {
          return JSON.parse(saved)
      }
    }
    return DEFAULT_CHAT_SETTINGS
  })

  //状态7：设置面板是否打开
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  //获取主题控制
  const { theme, setTheme } = useTheme()

  //获取当前对话的消息
  const currentChat = chats.find(chat => chat.id === currentChatId)
  const messages = useMemo(() => currentChat?.messages || [], [currentChat])

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(), //时间戳作为id
      name: `对话 ${chats.length + 1}`, //自动命名
      messages: [
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: '你好！我是你的 AI 助手，有什么可以帮助你的吗？'
        }
      ],
      createdAt: Date.now()
    }

    const upDateChats = [...chats, newChat]
    setChats(upDateChats)
    setCurrentChatId(newChat.id)


    //保存到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chats', JSON.stringify(upDateChats))
    }
  }

  //选择对话
  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  //删除对话
  const handleDeleteChat = (chatId: string) => {
    if (chats.length === 1) {
      alert('至少需要保留一个对话')
      return
    }
    const updatedChats = chats.filter(chat => chat.id !== chatId)
    setChats(updatedChats)
    if (chatId === currentChatId) {
      setCurrentChatId(updatedChats[0].id)
    }
    //保存到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chats', JSON.stringify(updatedChats))
    }
  }

  const handleRenameChat = (chatId: string, newName: string) => {
    //非空判断
    if (!newName.trim()) {
      return
    }
    const updatedChats = chats.map(chat =>
      chat.id === chatId
        ? { ...chat, name: newName.trim() }
        : chat
    )
    setChats(updatedChats)

    //保存到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chats', JSON.stringify(updatedChats))
    }
  }

  //置顶对话
  const handleTogglePinChat = (chatId: string) => {
    const updatedChats = chats.map(chat =>
      chat.id === chatId
        ? { ...chat, isPinned: !chat.isPinned }
        : chat
    )
    setChats(updatedChats)

    //保存到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chats', JSON.stringify(updatedChats))
    }
  }

  //复制对话内容
  const handleCopyChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (!chat) return

    //构建对话文本
    const chatText = chat.messages.map(
      msg => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`
    ).join('\n\n')

    //复制到剪贴板
    navigator.clipboard.writeText(chatText)
      .then(() => {
        alert('对话已复制到剪贴板')
      })
      .catch(err => {
        console.error('复制失败:', err)
      })
  }





  //创建一个引用，用于指向消息列表的底部
  const messagesEndRef = useRef<HTMLDivElement>(null)

  //自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  //当消息列表发生变化时，自动滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages])


  //当消息变化时， 保存到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chats', JSON.stringify(chats))
    }
  }, [chats])

  //当模型变化时，保存到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedModel', selectedModel)
    }
  }, [selectedModel])
  
  //当设置变化时，保存到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('settings', JSON.stringify(settings))
    }
  }, [settings])

  //清空对话函数
  const handleClearChat = () => {
    const defaultMessage = [
      {
        id: '1',
        role: 'assistant' as const,
        content: '你好！我是你的 AI 助手，有什么可以帮助你的吗？'
      }
    ]

    const updatedChats = chats.map(chat =>
      chat.id === currentChatId
        ? { ...chat, messages: defaultMessage }
        : chat
    )
    setChats(updatedChats)
    if (typeof window !== 'undefined') {
      localStorage.setItem('chats', JSON.stringify(updatedChats))
    }
  }
  // 处理发送消息的函数
  const handleSend = async () => {
    // 如果输入框为空，就不发送
    if (!input.trim() || isLoading) return

    console.log('使用模型:', selectedModel)

    const userInput = input
    setInput('')

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput
    }
    // 更新当前对话的消息
    const newMessages = [...messages, userMessage]
    const updatedChat = chats.map(chat => chat.id === currentChatId ? { ...chat, messages: newMessages } : chat)
    setChats(updatedChat)

    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: selectedModel,
          systemPrompt: settings.systemPrompt,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens
        })
      })

      if (!response.ok) {
        throw new Error('API 调用失败')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''

      }
      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const text = decoder.decode(value)
        assistantMessage.content += text

        //更新chats
        const updatedChats = updatedChat.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: [...newMessages, { ...assistantMessage }] } : chat)
        setChats(updatedChats)

      }
      //保存到localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('chats', JSON.stringify(chats))
      }
    } catch (error) {
      console.error('发送失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '发送失败，请稍后重试'
      }
      const updatedChats = updatedChat.map(chat => chat.id === currentChatId ? { ...chat, messages: [...newMessages, errorMessage] } : chat)
      setChats(updatedChats)

    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex h-screen bg-gray-50 dark:bg-gray-900'>
      {/* 左侧：侧边栏 */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onCopyChat={handleCopyChat}
        onTogglePinChat={handleTogglePinChat}
      />

      {/* 右侧：聊天界面 */}
      <div className="flex flex-col flex-1">
        {/* 顶部标题栏 */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className='flex items-center justify-between'>
            {/* 左侧：标题 */}
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {currentChat?.name || 'AI 聊天助手'}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                ({messages.length} 条消息)</span>
            </h1>
            {/* 右侧：模型选择和清空对话按钮 */}
            <div className="flex items-center gap-3">
              {/* 模型选择器 */}
              <div className="flex items-center gap-2">
                <label className='text-sm text-gray-600 dark:text-gray-400'>
                  模型:
                </label>
                <Select
                  value={selectedModel}
                  onValueChange={(value) => setSelectedModel(value as ModelId)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col gap-1 py-1">
                          {/* 模型名称 */}
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{model.name}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {model.provider}
                            </span>
                          </div>
                          {/* 模型描述 */}
                          <span className="text-xs text-muted-foreground">
                            {model.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* 清空对话按钮 */}
              <Button
                onClick={handleClearChat}
                variant="outline"
                size="sm"
              >
                清空当前对话
              </Button>
              {/* 设置按钮和对话框 */}
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className='w-4 h-4 mr-2'/>
                    设置
                  </Button>
                </DialogTrigger>
                {/* 对话框内容 */}
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>模型设置</DialogTitle>
                    <DialogDescription>
                      调整AI模型的行为参数
                    </DialogDescription>
                  </DialogHeader>

                  {/* 表单内容 */}
                  <div className="grid gap-4 py-4">
                    {/* Temperature设置 */}
                    <div className="grid gap-2">
                      <div className='flex items-center justify-between'>
                        <Label htmlFor='temperature'>Temperature（温度）</Label>
                        <span className="text-xs text-muted-foreground">
                          {settings.temperature}
                        </span>
                      </div>
                      <Slider
                        id='temperature'
                        min={0}
                        max={2}
                        step={0.1}
                        value={[settings.temperature]}
                        onValueChange={(value) => {
                          setSettings({
                            ...settings,
                            temperature: value[0]
                          })
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        温度越高，AI的创造力越强，但回答的可靠性越低。
                      </p>
                    </div>
                    {/* MaxTokens设置 */}
                    <div className="grid gap-2">
                      <div className='flex items-center justify-between'>
                        <Label htmlFor='maxTokens'>Max Tokens（最大令牌数）</Label>
                        <span className="text-xs text-muted-foreground">
                          {settings.maxTokens}
                        </span>
                      </div>
                      <Slider
                        id='maxTokens'
                        min={100}
                        max={4000}
                        step={100}
                        value={[settings.maxTokens]}
                        onValueChange={(value) => {
                          setSettings({
                            ...settings,
                            maxTokens: value[0]
                          })
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        控制回复的最大长度， 建议1000-3000。
                      </p>
                    </div>
                    {/* systemPrompt设置 */}
                    <div className='grid gap-2'>
                      <Label 
                        htmlFor='systemPrompt'
                        >System Prompt（系统提示词）
                      </Label>
                      <Textarea
                        id='systemPrompt'
                        placeholder='输入系统提示词...'
                        value={settings.systemPrompt}
                        onChange={(e) => {
                          setSettings({
                            ...settings,
                            systemPrompt: e.target.value
                          })
                        }}
                        rows={4}
                      />
                      <p className='text-xs text-muted-foreground'>
                        定义AI的角色和行为方式。
                      </p>
                    </div>
                    
                  </div>
                  {/* 底部按钮 */}
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsSettingsOpen(false)}
                      >取消</Button>
                    <Button
                      onClick={() => setIsSettingsOpen(false)}
                      >保存</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* 主题切换 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">切换主题</span>
              </Button>
            </div>
          </div>
        </header>

        {/* 中间消息显示区域 */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* 动态渲染所有消息 */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg p-4 shadow relative overflow-visible ${message.role === 'user'
                  ? 'bg-blue-500 text-white ml-auto max-w-[80%]'  // 用户消息：蓝色，靠右
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 max-w-[80%]'  // AI 消息：白色，靠左
                  }`}
              >
                <MessageDisplay content={message.content} />
              </div>
            ))}

            {/* 加载状态提示 */}
            {isLoading && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow max-w-[80%]">
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  AI 正在思考...
                </p>
              </div>
            )}

            {/* 空div，用于自动滚动到底部 */}
            <div ref={messagesEndRef}></div>
          </div>
        </main>

        {/* 底部输入区域 */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-3xl mx-auto flex gap-2">
            <input
              type="text"
              placeholder="输入你的消息..."
              value={input}  // 绑定状态
              onChange={(e) => setInput(e.target.value)}  // 更新状态
              onKeyDown={(e) => {
                // 按下 Enter 键时发送消息
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()  // 阻止默认的换行行为
                  handleSend()
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleSend}  // 绑定点击事件
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!input.trim() || isLoading}  // 输入为空时禁用按钮
            >
              {isLoading ? '发送中...' : '发送'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
