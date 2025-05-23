import React, { useContext, useEffect, useRef } from 'react';
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ThemeContext } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const BarChart = ({
  chartData, // Expects { labels: [], datasets: [{ label: '', data: [], backgroundColor: '', borderColor: '' ... }] }
  title = "Bar Chart",
  options: customOptions = {}, // Allow overriding default options
  className = "relative h-72 sm:h-80 md:h-96", // Default height container
}) => {
  const { actualTheme } = useContext(ThemeContext);
  const chartRef = useRef(null);

  // Default options, can be merged with customOptions
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutExpo', // A nice easing for bars
      onProgress: function(animation) {
        // Example: Animate bar appearance
        // animation.chart.data.datasets.forEach(dataset => {
        //   dataset.data = dataset.data.map((value, index) => {
        //     return animation.currentStep / animation.numSteps * value;
        //   });
        // });
        // animation.chart.update(); // Be careful with performance on large datasets
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Cleaner look for x-axis grid
        },
        ticks: {
          color: actualTheme === 'dark' ? '#94a3b8' : '#64748b',
          font: {
            size: 10,
          }
        },
      },
      y: {
        grid: {
          color: actualTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          borderDash: [5, 5], // Dashed grid lines
        },
        ticks: {
          color: actualTheme === 'dark' ? '#94a3b8' : '#64748b',
          font: {
            size: 10,
          },
          callback: function (value) { // Format Y-axis ticks as currency
            if (Math.abs(value) >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
            if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
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
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
          }
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
            bottom: 20,
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: actualTheme === 'dark' ? 'rgba(51, 65, 85, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: actualTheme === 'dark' ? '#e2e8f0' : '#34495e',
        bodyColor: actualTheme === 'dark' ? '#cbd5e1' : '#4a5568',
        borderColor: actualTheme === 'dark' ? '#475569' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
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
                minimumFractionDigits: 0, // Adjust as needed
                maximumFractionDigits: 2,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
      datalabels: { // Optional: show values on top of bars
        display: (context) => {
            // Display only if value is significant enough, or always if few bars
            return context.dataset.data[context.dataIndex] > 0 && chartData.labels.length < 15;
        },
        anchor: 'end',
        align: 'end',
        offset: -4, // Position above the bar
        color: actualTheme === 'dark' ? '#cbd5e1' : '#4b5563', // Muted text color
        font: {
          size: 9,
          weight: '500',
        },
        formatter: (value) => {
          if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
          return `₹${value.toFixed(0)}`;
        },
      },
    },
    // barThickness: 20, // Or 'flex'
    // maxBarThickness: 30,
    // borderRadius: 4, // Rounded bars
    ...customOptions, // Merge custom options, allowing override
  };

  // Make sure chartData has datasets with default colors if not provided
  const themedChartData = {
    ...chartData,
    datasets: chartData.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || (actualTheme === 'dark' ? `rgba(56, 189, 248, ${0.7 - index*0.1})` : `rgba(52, 152, 219, ${0.7 - index*0.1})`), // Example: shades of blue
      borderColor: dataset.borderColor || (actualTheme === 'dark' ? `rgb(56, 189, 248)` : `rgb(52, 152, 219)`),
      borderWidth: dataset.borderWidth === undefined ? 1 : dataset.borderWidth,
      hoverBackgroundColor: dataset.hoverBackgroundColor || (actualTheme === 'dark' ? `rgba(56, 189, 248, ${0.9 - index*0.1})` : `rgba(52, 152, 219, ${0.9 - index*0.1})`),
    })),
  };


  useEffect(() => {
    const chartInstance = chartRef.current;
    // Optional: Apply global Chart.js defaults or animations here if needed
    // ChartJS.defaults.font.family = 'Inter, sans-serif';
    // ChartJS.defaults.plugins.legend.display = false; // Example global default

    return () => {
      if (chartInstance) {
        // react-chartjs-2 should handle destroy, but good practice if managing ChartJS directly
        // chartInstance.destroy();
      }
    };
  }, []);

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={className}
    >
      {chartData && chartData.labels && chartData.labels.length > 0 && chartData.datasets.some(ds => ds.data.length > 0) ? (
        <Bar ref={chartRef} data={themedChartData} options={defaultOptions} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-text-muted-light dark:text-text-muted-dark">No data available for this chart.</p>
        </div>
      )}
    </motion.div>
  );
};

export default BarChart;