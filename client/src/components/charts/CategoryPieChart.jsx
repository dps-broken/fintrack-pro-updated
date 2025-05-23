import React, { useContext, useEffect, useRef } from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // For displaying labels on chart
import { ThemeContext } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

const CategoryPieChart = ({ data, type = 'doughnut', title = 'Spending by Category' }) => {
  const { actualTheme } = useContext(ThemeContext);
  const chartRef = useRef(null);

  // Data for the chart:
  // data should be an array of objects like:
  // [{ categoryName: 'Food', totalSpent: 1500, categoryColor: '#FF6384' (optional) }, ...]

  const chartData = {
    labels: data.map(item => item.categoryName),
    datasets: [
      {
        label: 'Amount Spent',
        data: data.map(item => item.totalSpent),
        backgroundColor: data.map(item => item.categoryColor || getRandomColor()), // Use provided color or generate
        borderColor: actualTheme === 'dark' ? '#334155' : '#ffffff', // card-dark or white for border
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  // Function to generate random colors if not provided
  function getRandomColor() {
    const r = Math.floor(Math.random() * 200); // Avoid too light/dark colors for better visibility
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);
    return `rgb(${r},${g},${b})`;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Important for responsiveness in a container
    animation: {
        duration: 1000, // general animation time
        easing: 'easeInOutQuart',
        // onProgress: function(animation) {
        //     // You can add custom progress effects here
        // },
        // onComplete: function(animation) {
        //     // You can add custom completion effects here
        // }
    },
    plugins: {
      legend: {
        position: 'bottom', // 'top', 'left', 'bottom', 'right'
        labels: {
          color: actualTheme === 'dark' ? '#e2e8f0' : '#34495e', // text-dark or text-light
          boxWidth: 15,
          padding: 20,
          font: {
            size: 12,
          }
        },
      },
      title: {
        display: !!title, // Show title if provided
        text: title,
        color: actualTheme === 'dark' ? '#e2e8f0' : '#34495e',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: type === 'pie' ? 10 : (type === 'doughnut' ? -5 : 10 ) // Doughnut needs less bottom padding if datalabels are inside
        }
      },
      tooltip: {
        enabled: true,
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
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
              }).format(context.parsed);
            }
            return label;
          },
        },
      },
      datalabels: { // chartjs-plugin-datalabels
        display: type === 'doughnut' ? 'auto' : true, // Show labels, 'auto' for doughnut to avoid overlap
        color: (context) => { // Dynamic color for labels for better contrast
            const bgColor = context.dataset.backgroundColor[context.dataIndex];
            // Basic contrast check, can be improved
            if (!bgColor) return actualTheme === 'dark' ? '#FFF' : '#000';
            const r = parseInt(bgColor.slice(1, 3), 16);
            const g = parseInt(bgColor.slice(3, 5), 16);
            const b = parseInt(bgColor.slice(5, 7), 16);
            return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#FFFFFF';
        },
        formatter: (value, context) => {
          const sum = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          const percentage = ((value / sum) * 100).toFixed(1) + '%';
          return percentage; // Show percentage on slices
        },
        font: {
          weight: 'bold',
          size: 11,
        },
        // anchor: 'end', // 'center', 'start', 'end'
        // align: 'end',  // 'center', 'start', 'end', 'top', 'bottom', 'left', 'right'
        // offset: type === 'doughnut' ? 0 : 8, // Offset from slice for pie
        // clamp: true, // Prevents labels from going outside chart area
      },
    },
    cutout: type === 'doughnut' ? '60%' : '0%', // For doughnut chart
  };

  // Destroy chart instance on component unmount to prevent memory leaks
  useEffect(() => {
    const chartInstance = chartRef.current;
    return () => {
      if (chartInstance) {
        // chartInstance.destroy(); // react-chartjs-2 handles this
      }
    };
  }, []);


  const ChartComponent = type === 'doughnut' ? Doughnut : Pie;

  return (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative h-72 sm:h-80 md:h-96" // Set a fixed height for the container
    >
      {data && data.length > 0 ? (
        <ChartComponent ref={chartRef} data={chartData} options={options} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-text-muted-light dark:text-text-muted-dark">No data available for this chart.</p>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryPieChart;