'use client'
import { useState } from "react"
import { PlusCircle, MessageSquare, Trash2 } from "lucide-react"
import { MoreVertical, Edit, Pin, Copy} from "lucide-react"
import {Button} from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type Chat = {
  id: string
  name: string
  messages: Message[]
  createdAt: number
  isPinned?: boolean
}

type SidebarProps = {
  chats: Chat[]
  currentChatId: string
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
  onRenameChat: (chatId: string, newName: string) => void
  onCopyChat: (chatId: string) => void
  onTogglePinChat: (chatId: string) => void
}

export default function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onCopyChat,
  onTogglePinChat
}: SidebarProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string>('')

  //开始编辑
  const startEditing = (chatId: string, name: string) => {
    setEditingChatId(chatId)
    setEditingName(name)
  }

  //保存编辑
  const saveEditing = () => {
    if(editingChatId && editingName.trim()){
      onRenameChat(editingChatId, editingName)
    }
    setEditingChatId(null)
    setEditingName('')
  }

  //取消编辑
  const cancelEditing = () => {
    setEditingChatId(null)
    setEditingName('')
  }
    

  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
     {/* 顶部新建按钮 */}
     <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <Button
        onClick={onNewChat}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        size="default"
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        新建对话
      </Button>
     </div>
     {/* 对话列表 */}
     <div className="flex-1 overflow-y-auto p-2">
      {chats
      .sort((a, b) => {
        if(a.isPinned && !b.isPinned) return -1
        if(!a.isPinned && b.isPinned) return 1
        return b.createdAt - a.createdAt
      })
      .map(chat => (
        <div
          key={chat.id}
          className={`
        flex items-center justify-between p-3 rounded-lg cursor-pointer mb-2
        hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors
        ${chat.id === currentChatId 
          ? 'bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500' 
          : 'bg-white dark:bg-gray-800'
        }
        ${chat.isPinned ? 'border-l-4 border-yellow-500' : ''}
      `}
        >
          {/* 左侧：点击区域 */}
          <div 
          onClick={() => {
            if(editingChatId !== chat.id){
              onSelectChat(chat.id)
            }
          }}
          onDoubleClick={() => startEditing(chat.id, chat.name)}
          className="flex items-center gap-2 flex-1 min-w-0">
            <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
            {/* 置顶图标 */}
            {chat.isPinned && (
              <Pin className="w-3 h-3 text-yellow-500" />
            )}
            {/* 名称或输入框 */}
            {editingChatId === chat.id ? (
              //编辑模式
              <input 
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === 'Enter'){
                    saveEditing()
                  }else if(e.key === 'Escape'){
                    cancelEditing()
                  }
                }}
                onBlur={saveEditing}
                autoFocus
                className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-blue-500 rounded focus:outline-none"
                onClick={(e) => e.stopPropagation()}//阻止触发外层点击
              />
            ) : (
              //显示模式
              <span className="text-sm truncate">
                {chat.name}
              </span>
            )}
          </div>
          {/* 右侧：菜单按钮 */}
          {editingChatId !== chat.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                    <span className="sr-only">打开菜单</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    startEditing(chat.id, chat.name)
                  }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    重命名
                  </DropdownMenuItem>
                  <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onTogglePinChat(chat.id)
                  }}
                  >
                    <Pin className="w-4 h-4 mr-2" />
                    {chat.isPinned ? '取消置顶' : '置顶'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onCopyChat(chat.id)
                  }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    复制对话
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteChat(chat.id)
                  }}
                  className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除对话
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          )}
        </div>
      ))}
      
     </div>

     {/* 底部信息 */}
     <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        共{chats.length}个对话
      </p>
     </div>
    </div>
  )
}