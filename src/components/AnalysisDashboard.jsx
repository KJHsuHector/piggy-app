import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ShoppingBag, Coffee, Car, Home, Smartphone, Activity } from 'lucide-react';

const CATEGORY_META = {
  food: { label: 'Food & Dining', icon: Coffee, color: '#f59e0b' },
  transport: { label: 'Transport', icon: Car, color: '#3b82f6' },
  shopping: { label: 'Shopping', icon: ShoppingBag, color: '#ec4899' },
  housing: { label: 'Housing', icon: Home, color: '#8b5cf6' },
  bills: { label: 'Bills', icon: Smartphone, color: '#06b6d4' },
  other_out: { label: 'Other Exp.', icon: Activity, color: '#64748b' },
};

export const AnalysisDashboard = () => {
  const { transactions } = useTransactions();

  // Get current month boundaries
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();

  // Filter and group expenses for the current month
  const monthlyExpenses = transactions.filter(
    t => t.type === 'expense' && t.timestamp >= startOfMonth && t.timestamp <= endOfMonth
  );

  const categoryTotals = monthlyExpenses.reduce((acc, t) => {
    const cat = t.categoryId || 'other_out';
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {});

  const totalSpent = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  // Format data for Recharts
  const chartData = Object.keys(categoryTotals)
    .map(key => ({
      name: CATEGORY_META[key]?.label || 'Other',
      value: categoryTotals[key],
      color: CATEGORY_META[key]?.color || '#64748b',
      id: key
    }))
    .sort((a, b) => b.value - a.value); // Sort largest to smallest

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel" style={{ padding: '0.5rem', marginBottom: 0, borderRadius: '8px' }}>
          <p style={{ fontWeight: '600', color: data.color }}>{data.name}</p>
          <p>${data.value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
    // Hide labels for very small slices to prevent overlap
    if (percent < 0.05) return null; 

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 15; // Set label slightly outside the donut
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? 'start' : 'end';

    return (
      <g>
        <text x={x} y={y - 8} fill="var(--text-secondary)" textAnchor={textAnchor} dominantBaseline="central" style={{ fontSize: '10px' }}>
          {name}
        </text>
        <text x={x} y={y + 6} fill="var(--text-primary)" textAnchor={textAnchor} dominantBaseline="central" style={{ fontSize: '11px', fontWeight: 'bold' }}>
          {Math.round(percent * 100)}%
        </text>
      </g>
    );
  };

  return (
    <div className="analysis-dashboard animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0 }}>
        <h2 className="title" style={{ marginBottom: '0.25rem' }}>Monthly Analysis</h2>
        <p className="subtitle" style={{ marginBottom: '1rem' }}>
          {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {totalSpent === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '3rem 1rem' }}>
          <p className="subtitle">No expenses recorded this month.</p>
        </div>
      ) : (
        <>
          <div className="glass-panel flex-center" style={{ flexShrink: 0, height: '220px', position: 'relative', margin: '0 1rem' }}>
            {/* Center Text inside the Donut: Smaller text, wider inner radius */}
            <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
              <div className="subtitle" style={{ fontSize: '0.7rem' }}>Total Spent</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>${totalSpent.toLocaleString()}</div>
            </div>
            
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="65%"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, marginTop: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', flexShrink: 0 }}>Category Breakdown</h3>
            <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1rem', marginBottom: 0 }}>
              {chartData.map((item, index) => {
                const percentage = Math.round((item.value / totalSpent) * 100);
                const isLast = index === chartData.length - 1;
                const Icon = CATEGORY_META[item.id]?.icon || Activity;
                
                return (
                  <div 
                    key={item.id} 
                    className="flex-between"
                    style={{ 
                      padding: '1rem 0',
                      borderBottom: isLast ? 'none' : '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="flex-center" style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${item.color}20`, color: item.color }}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{item.name}</div>
                        <div className="subtitle" style={{ fontSize: '0.75rem' }}>{percentage}%</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: '700' }}>
                      ${item.value.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
