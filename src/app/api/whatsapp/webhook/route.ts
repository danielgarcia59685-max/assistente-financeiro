import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// GET handler para verificação do webhook
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const hubChallenge = searchParams.get('hub.challenge')
  
  if (hubChallenge) {
    return new NextResponse(hubChallenge, { status: 200 })
  }
  
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const from = formData.get('From') as string
    const body = formData.get('Body') as string

    if (!from || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!supabase) {
      console.warn('Supabase não está configurado')
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Extrair número do WhatsApp (remover whatsapp:)
    const whatsappNumber = from.replace('whatsapp:', '')

    // Encontrar ou criar usuário baseado no número
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', whatsappNumber) // Usando email como identificador único, mas poderia ser phone
      .single()

    if (!user) {
      // Criar usuário se não existir
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ name: `User ${whatsappNumber}`, email: whatsappNumber }])
        .select()
        .single()

      if (createError) {
        console.error('Erro ao criar usuário:', createError)
        return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
      }
      user = newUser
    }

    // Processar mensagem com OpenAI
    const response = await processMessage(body, user.id)

    // Enviar resposta via WhatsApp
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: from,
      body: response
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function processMessage(message: string, userId: string): Promise<string> {
  // Usar OpenAI para entender e processar a mensagem
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Você é um assistente financeiro. Analise a mensagem do usuário e extraia informações de transações financeiras.
        Responda sempre em português brasileiro e seja conciso.
        Formatos esperados:
        - "Gastei R$ 50 no mercado com cartão" -> tipo: expense, valor: 50, categoria: Alimentação, método: card
        - "Recebi R$ 1000 de salário no PIX" -> tipo: income, valor: 1000, categoria: Salário, método: pix
        - "Paguei a conta de luz R$ 150" -> tipo: expense, valor: 150, categoria: Serviços, método: não especificado
        Retorne apenas um JSON com: { "type": "income|expense", "amount": number, "category": "string", "payment_method": "pix|card|cash|transfer", "description": "string" }
        Se não for uma transação, retorne { "type": "query" }`
      },
      {
        role: 'user',
        content: message
      }
    ]
  })

  const aiResponse = completion.choices[0].message.content

  try {
    const parsed = JSON.parse(aiResponse || '{}')

    if (parsed.type === 'query') {
      // Responder a consultas
      return await handleQuery(message, userId)
    } else if (parsed.type === 'income' || parsed.type === 'expense') {
      // Salvar transação
      await saveTransaction(parsed, userId)
      return `✅ Transação registrada: ${parsed.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${parsed.amount} na categoria ${parsed.category}`
    }
  } catch (error) {
    console.error('Erro ao parsear resposta da IA:', error)
  }

  return 'Mensagem processada. Para registrar transações, diga algo como "Gastei R$ 50 no mercado".'
}

async function saveTransaction(data: any, userId: string) {
  if (!supabase) {
    console.warn('Supabase não está configurado')
    return
  }

  try {
    // Criar transação diretamente (sem tabela categories separada)
    await supabase
      .from('transactions')
      .insert([{
        amount: data.amount,
        type: data.type,
        category: data.category,
        description: data.description || '',
        payment_method: data.payment_method || 'cash',
        user_id: userId,
        date: new Date().toISOString().split('T')[0]
      }])
  } catch (error) {
    console.error('Erro ao salvar transação:', error)
  }
}

async function handleQuery(message: string, userId: string): Promise<string> {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('saldo') || lowerMessage.includes('quanto tenho')) {
    // Calcular saldo
    const { data: incomes } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'income')

    const { data: expenses } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'expense')

    const totalIncome = incomes?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0
    const totalExpense = expenses?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0
    const balance = totalIncome - totalExpense

    return `💰 Seu saldo atual é R$ ${balance.toFixed(2)} (Receitas: R$ ${totalIncome.toFixed(2)}, Despesas: R$ ${totalExpense.toFixed(2)})`
  }

  if (lowerMessage.includes('relatório') || lowerMessage.includes('resumo')) {
    // Resumo mensal
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .gte('date', `${currentMonth}-01`)
      .lt('date', `${currentMonth}-32`)

    const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0
    const expense = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0

    return `📊 Resumo do mês: Receitas R$ ${income.toFixed(2)}, Despesas R$ ${expense.toFixed(2)}, Lucro R$ ${(income - expense).toFixed(2)}`
  }

  return 'Olá! Sou seu assistente financeiro. Posso registrar transações como "Gastei R$ 50 no mercado" ou responder perguntas sobre seu saldo e relatórios.'
}