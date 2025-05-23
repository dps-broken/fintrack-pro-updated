import React, { useContext, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, // For X-axis
  LinearScale,   // For Y-axis
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // For area fill
} from 'chart.js';
import { ThemeContext } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { parseISO, format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const IncomeExpenseLineChart = ({
  incomeData,  // Array of { date: 'YYYY-MM-DD', amount: number }
  expenseData, // Array of { date: 'YYYY-MM-DD', amount: number }
  title = 'Income vs Expense Trend',
  granularity = 'daily', // 'daily', 'monthly' - for label formatting
}) => {
  const { actualTheme } = useContext(ThemeContext);
  const chartRef = useRef(null);

  // Combine all dates from both datasets to create a complete set of labels
  const allDates = new Set([
    ...incomeData.map(d => d.date),
    ...expenseData.map(d => d.date)
  ]);
  const sortedLabels = Array.from(allDates).sort((a, b) => parseISO(a) - parseISO(b));

  const formattedLabels = sortedLabels.map(dateStr => {
    const dateObj = parseISO(dateStr);
    if (granularity === 'monthly') return format(dateObj, 'MMM yyyy');
    if (granularity === 'yearly') return format(dateObj, 'yyyy');
    return format(dateObj, 'MMM d'); // Daily default
  });

  // Map data to the sorted labels, filling with 0 if no data for a label
  const mapDataToLabels = (data, labels) => {
    const dataMap = new Map(data.map(d => [d.date, d.amount]));
    return labels.map(labelDate => dataMap.get(labelDate) || 0);
  };

  const processedIncomeData = mapDataToLabels(incomeData, sortedLabels);
  const processedExpenseData = mapDataToLabels(expenseData, sortedLabels);


  const chartData = {
    labels: formattedLabels,
    datasets: [
      {
        label: 'Income',
        data: processedIncomeData,
        borderColor: actualTheme === 'dark' ? 'rgb(74, 222, 128)' : 'rgb(34, 197, 94)', // Green
        backgroundColor: actualTheme === 'dark' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(34, 197, 94, 0.3)',
        tension: 0.3, // Makes the line curved
        fill: true, // Fill area under line
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: 'Expense',
        data: processedExpenseData,
        borderColor: actualTheme === 'dark' ? 'rgb(248, 113, 113)' : 'rgb(239, 68, 68)', // Red
        backgroundColor: actualTheme === 'dark' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(239, 68, 68, 0.3)',
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 1000,
        easing: 'easeInOutQuart',
    },
    scales: {
      x: {
        grid: {
          color: actualTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: actualTheme === 'dark' ? '#94a3b8' : '#64748b', // text-muted
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: granularity === 'daily' ? 10 : 12, // Adjust based on expected data points
        },
      },
      y: {
        grid: {
          color: actualTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: actualTheme === 'dark' ? '#94a3b8' : '#64748b',
          callback: function (value) {
            if (value >= 1000000) return `₹${value / 1000000}M`;
            if (value >= 1000) return `₹${value / 1000}K`;
            return `₹${value}`;
          },
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: actualTheme === 'dark' ? '#e2e8f0' : '#34495e',
          boxWidth: 15,
          padding: 20,
        },
      },
      title: {
        display: !!title,
        text: title,
        color: actualTheme === 'dark' ? '#e2e8f0' : '#34495e',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
            top: 10,
            bottom: 20
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index', // Show tooltips for all datasets at that index
        intersect: false, // Tooltip will show even if not directly hovering over point
        backgroundColor: actualTheme === 'dark' ? 'rgba(51, 65, 85, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: actualTheme === 'dark' ? '#e2e8f0' : '#34495e',
        bodyColor: actualTheme === 'dark' ? '#cbd5e1' : '#4a5568',
        borderColor: actualTheme === 'dark' ? '#475569' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        boxPadding: 3,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    interaction: { // For hover effects
        mode: 'index',
        intersect: false,
    },
    hover: {
        mode: 'nearest',
        intersect: true
    }
  };

  useEffect(() => {
    const chartInstance = chartRef.current;
    return () => {
      if (chartInstance) {
        // chartInstance.destroy();
      }
    };
  }, []);

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative h-72 sm:h-80 md:h-96" // Set a fixed height for the container
    >
      {(incomeData.length > 0 || expenseData.length > 0) ? (
        <Line ref={chartRef} data={chartData} options={options} />
      ) : (
        <div className="flex items-center justify-center h-full">
            <p className="text-text-muted-light dark:text-text-muted-dark">No trend data available.</p>
        </div>
      )}
    </motion.div>
  );
};

export default IncomeExpenseLineChart;