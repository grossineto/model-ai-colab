import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, TrendingUp, DollarSign, Image, ArrowRight } from "lucide-react";

interface DashboardStepProps {
  onNext: () => void;
}

const monthlyData = [
  { month: "Jan", models: 12, revenue: 2400 },
  { month: "Fev", models: 19, revenue: 3200 },
  { month: "Mar", models: 27, revenue: 4800 },
  { month: "Abr", models: 34, revenue: 6200 },
  { month: "Mai", models: 45, revenue: 8100 },
  { month: "Jun", models: 58, revenue: 9800 },
];

const topContributors = [
  { name: "Sarah Johnson", contributions: 24, earnings: "R$ 21.600" },
  { name: "Maria Garcia", contributions: 19, earnings: "R$ 17.100" },
  { name: "Chen Wei", contributions: 16, earnings: "R$ 14.400" },
  { name: "Aisha Patel", contributions: 14, earnings: "R$ 12.600" },
];

export const DashboardStep = ({ onNext }: DashboardStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen bg-background p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4"
        >
          <h2 className="text-4xl font-bold text-foreground">
            Dashboard da Plataforma
          </h2>
          <p className="text-lg text-muted-foreground">
            Análises em tempo real e métricas de desempenho
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Image, label: "Total de Modelos", value: "58", color: "text-primary", delay: 0.3 },
            { icon: Users, label: "Contribuidores", value: "142", color: "text-accent", delay: 0.4 },
            { icon: DollarSign, label: "Pagamentos Totais", value: "R$ 162K", color: "text-primary", delay: 0.5 },
            { icon: TrendingUp, label: "Taxa de Crescimento", value: "+28%", color: "text-accent", delay: 0.6 },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
            >
              <Card className="rounded-2xl border-border hover:shadow-soft transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-10 w-10 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle>Modelos Criados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.75rem",
                        }}
                      />
                      <Bar dataKey="models" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle>Tendência de Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.75rem",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--accent))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--accent))", r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle>Principais Contribuidores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topContributors.map((contributor, index) => (
                  <motion.div
                    key={contributor.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                        {contributor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{contributor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {contributor.contributions} contribuições
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{contributor.earnings}</p>
                      <p className="text-xs text-muted-foreground">Total recebido</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="flex justify-center pt-8"
        >
          <Button
            onClick={onNext}
            size="lg"
            className="rounded-xl px-8 hover:scale-105 transition-transform"
          >
            Concluir Simulação
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
