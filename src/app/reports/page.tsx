'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '@/lib/supabase'

interface MonthlyData {
  month: string
  income: number
  expense: number
}

interface CategoryData {
  name: string
  value: number
}

export default function ReportsPage() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])

  useEffect(() => {
    fetchMonthlyReport()
    fetchCategoryReport()
  }, [])

  const fetchMonthlyReport = async () => {
    // Agrupar por mês
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type, date')

    if (error) console.error(error)
    else {
      const grouped = data.reduce((acc, transaction) => {
        const month = new Date(transaction.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        if (!acc[month]) acc[month] = { income: 0, expense: 0 }
        if (transaction.type === 'income') acc[month].income += transaction.amount
        else acc[month].expense += transaction.amount
        return acc
      }, {} as Record<string, { income: number; expense: number }>)

      const chartData = Object.entries(grouped).map(([month, values]) => ({
        month,
        income: values.income,
        expense: values.expense
      }))
      setMonthlyData(chartData)
    }
  }

  const fetchCategoryReport = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, categories (name)')
      .eq('type', 'expense')

    if (error) console.error(error)
    else {
      const grouped = data.reduce((acc, transaction) => {
        const category = transaction.categories?.name || 'Outros'
        acc[category] = (acc[category] || 0) + transaction.amount
        return acc
      }, {} as Record<string, number>)

      const chartData = Object.entries(grouped).map(([name, value]) => ({ name, value }))
      setCategoryData(chartData)
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Relatórios</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#00C49F" name="Receitas" />
                <Bar dataKey="expense" fill="#FF8042" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}