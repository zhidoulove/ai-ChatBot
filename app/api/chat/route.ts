import OpenAI from "openai"

//创建deepseek客户端
const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

//定义消息类型
type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

//定义请求类型
type ChatRequest = {
  model?: string
  messages: Message[]
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json()
    const {
      model = 'deepseek-chat',
      temperature = 0.7,
      maxTokens = 2000,
      systemPrompt,
      messages
    } = body

    console.log('收到请求:', {
      model,
      temperature,
      maxTokens,
      messageCount: messages.length
    })

    // 构建完整的消息列表
    const fullMessages: Message[] = []

    // 如果有系统提示词，添加到最前面
    if (systemPrompt) {
      fullMessages.push({ role: 'system', content: systemPrompt })
    }

    // 添加对话历史
    fullMessages.push(...messages)

    // 调用 DeepSeek API
    const response = await client.chat.completions.create({
      model: model,
      messages: fullMessages,
      temperature: temperature,
      max_tokens: maxTokens,
      stream: true // 启用流式响应
    })

    // 创建流式响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content || ''
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
        } catch (error) {
          controller.error(error)
        } finally {
          controller.close()
        }
      }
    })

    // 返回流式响应
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

} catch (error: unknown) {
  console.error('Deepseek API 错误:', error)
  //详细错误信息
  const errorMessage = error instanceof Error ? error.message : '未知错误'
  const errorStatus = (error as { status?: number })?.status || 500

  return new Response(
    JSON.stringify({ 
      error: "调用 AI 接口失败",
      details: errorMessage
      }),
    {
      status: errorStatus,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    )
}
  
}

    
    
    
  