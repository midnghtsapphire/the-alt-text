import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function Dashboard() {
  const { data: statistics } = trpc.statistics.all.useQuery();

  // Process statistics by type
  const salaryData = statistics
    ?.filter(s => s.type === "salary")
    .map(s => ({
      city: s.label,
      salary: parseInt(s.value),
    })) || [];

  const growthData = statistics
    ?.filter(s => s.type === "growth")
    .map(s => ({
      metric: s.label,
      value: parseFloat(s.value),
    })) || [];

  const shortageData = statistics
    ?.filter(s => s.type === "shortage")
    .map(s => ({
      metric: s.label,
      value: parseInt(s.value),
    })) || [];

  const trainingData = statistics
    ?.filter(s => s.type === "training")
    .map(s => ({
      program: s.label,
      cost: parseInt(s.value),
    })) || [];

  const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Research Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Visual insights from the U.S. Tool & Die industry research
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Salary Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Tool Engineer Salaries by City</CardTitle>
              <CardDescription>
                Average annual salaries in top-paying markets compared to national average
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salaryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" angle={-45} textAnchor="end" height={100} />
                  <YAxis 
                    label={{ value: 'Salary ($)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Salary']}
                  />
                  <Legend />
                  <Bar dataKey="salary" fill="#3b82f6" name="Average Salary" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  <strong>Key Insight:</strong> Tool engineers in high-tech hubs like Cupertino and San Francisco 
                  earn approximately 50% more than the national average, reflecting the high value of proximity 
                  to innovation clusters.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Industry Growth Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Growth Projections</CardTitle>
              <CardDescription>
                Market growth and salary trends in the tooling industry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={growthData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="metric" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#10b981" name="Growth %" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  <strong>Market Outlook:</strong> The tooling market is projected to reach $80.2 billion by 2033, 
                  with steady job growth of 2% and salary increases of 7% over the past five years.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Workforce Shortage */}
          <Card>
            <CardHeader>
              <CardTitle>Workforce Shortage Analysis</CardTitle>
              <CardDescription>
                Projected worker shortages and CHIPS Act job creation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shortageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" angle={-20} textAnchor="end" height={80} />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString(), 'Workers']}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#ef4444" name="Workers" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  <strong>The "Silver Tsunami":</strong> By 2033, the U.S. manufacturing sector could face a 
                  shortfall of 1.9 million skilled workers. The CHIPS Act aims to create 67,000-146,000 new 
                  jobs by 2030 to address this crisis.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Training Program Costs */}
          <Card>
            <CardHeader>
              <CardTitle>Training Program Cost Comparison</CardTitle>
              <CardDescription>
                Investment required for various certification and training pathways
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trainingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="program" angle={-20} textAnchor="end" height={80} />
                  <YAxis 
                    label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
                  />
                  <Legend />
                  <Bar dataKey="cost" fill="#f59e0b" name="Program Cost" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>
                  <strong>Accessible Training:</strong> FAME apprenticeships offer a unique "earn while you learn" 
                  model with $30,000+ in paid training over 2 years. Entry-level SME certifications cost as little 
                  as $75 for students, making skilled manufacturing careers accessible.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Highest Salary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">$151,027</div>
                <p className="text-sm text-muted-foreground mt-1">San Francisco, CA</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Size 2033</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">$80.2B</div>
                <p className="text-sm text-muted-foreground mt-1">Projected tooling market</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Worker Shortage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">1.9M</div>
                <p className="text-sm text-muted-foreground mt-1">By 2033 (Silver Tsunami)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
