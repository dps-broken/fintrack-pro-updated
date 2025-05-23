import React, { useContext } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ThemeContext } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SavingsRatioBarChart = ({
  totalIncome,
  totalExpense,
  savings,
  title = "Income vs. Expense & Savings",
}) => {
  const { actualTheme } = useContext(ThemeContext);

  const chartData = {
    labels: ['Summary'], // Single category for this specific visualization
    datasets: [
      {
        label: 'Income',
        data: [totalIncome],
        backgroundColor: actualTheme === 'dark' ? 'rgba(74, 222, 128, 0.7)' : 'rgba(34, 197, 94, 0.7)', // Green
        borderColor: actualTheme === 'dark' ? 'rgb(74, 222, 128)' : 'rgb(34, 197, 94)',
        borderWidth: 1,
        stack: 'Stack 0', // All positive values on one stack
      },
      {
        label: 'Expenses',
        data: [totalExpense],
        backgroundColor: actualTheme === 'dark' ? 'rgba(248, 113, 113, 0.7)' : 'rgba(239, 68, 68, 0.7)', // Red
        borderColor: actualTheme === 'dark' ? 'rgb(248, 113, 113)' : 'rgb(239, 68, 68)',
        borderWidth: 1,
        stack: 'Stack 1', // Expenses on a separate stack for clarity or stacked on income
      },
      {
        label: 'Savings',
        data: [savings > 0 ? savings : 0], // Only show positive savings in this bar
        backgroundColor: actualTheme === 'dark' ? 'rgba(56, 189, 248, 0.7)' : 'rgba(52, 152, 219, 0.7)', // Blue
        borderColor: actualTheme === 'dark' ? 'rgb(56, 189, 248)' : 'rgb(52, 152, 219)',
        borderWidth: 1,
        stack: 'Stack 0', // Stack savings on income if desired
      },
    ],
  };

  // If you want to show savings as part of the income bar:
  // const chartDataStacked = {
  //   labels: ['Period'],
  //   datasets: [
  //     {
  //       label: 'Savings',
  //       data: [savings > 0 ? savings : 0],
  //       backgroundColor: actualTheme === 'dark' ? 'rgba(56, 189, 248, 0.7)' : 'rgba(52, 152, 219, 0.7)',
  //       stack: 'incomeStack',
  //     },
  //     {
  //       label: 'Expenses',
  //       data: [totalExpense],
  //       backgroundColor: actualTheme === 'dark' ? 'rgba(248, 113, 113, 0.7)' : 'rgba(239, 68, 68, 0.7)',
  //       stack: 'incomeStack', // Both part of total income
  //     },
  //     // Optionally, a separate bar for total income if not fully represented by savings + expenses
  //   ],
  // };


  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 1000,
        easing: 'easeOutBounce', // Different easing for bar
    },
    scales: {
      x: {
        stacked: true, // For stacked bar chart
        grid: { display: false },
        ticks: { color: actualTheme === 'dark' ? '#94a3b8' : '#64748b' },
      },
      y: {
        stacked: true,
        grid: { color: actualTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          color: actualTheme === 'dark' ? '#94a3b8' : '#64748b',
          callback: (value) => `₹${value}`,
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: actualTheme === 'dark' ? '#e2e8f0' : '#34495e' },
      },
      title: {
        display: !!title,
        text: title,
        color: actualTheme === 'dark' ? '#e2e8f0' : '#34495e',
        font: { size: 16, weight: 'bold' },
      },
      tooltip: {
        // ... (tooltip config similar to other charts)
        callbacks: {
          label: (context) => `${context.dataset.label}: ₹${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    indexAxis: 'y', // Optional: for horizontal bar chart if only one category label
  };

  return (
     <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative h-64 sm:h-72 md:h-80"
    >
      {(totalIncome > 0 || totalExpense > 0) ? (
        <Bar data={chartData} options={options} />
      ) : (
         <div className="flex items-center justify-center h-full">
            <p className="text-text-muted-light dark:text-text-muted-dark">Not enough data for savings ratio chart.</p>
        </div>
      )}
    </motion.div>
  );
};

export default SavingsRatioBarChart;