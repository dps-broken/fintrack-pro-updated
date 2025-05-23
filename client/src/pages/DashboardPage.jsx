import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import analyticsService from '../services/analytics.service';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Loader, { PageLoader } from '../components/common/Loader';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';

// Placeholder Chart Components (you'll create these in components/charts/)
// import CategoryPieChart from '../../components/charts/CategoryPieChart'; // Example
import CategoryPieChart from '../components/charts/CategoryPieChart';
import IncomeExpenseLineChart from '../components/charts/IncomeExpenseLineChart'; // Example
import Button from '../components/common/Button';
import AddTransactionModal from '../components/transactions/AddTransactionModal'; // We'll create this

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [categorySpending, setCategorySpending] = useState([]);
  const [trends, setTrends] = useState({ income: [], expense: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [error, setError] = useState('');

  // For animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };


  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const summaryPromise = analyticsService.getDashboardSummary({ period: 'month' }); // Current month summary
      const categorySpendingPromise = analyticsService.getCategorySpending({ period: 'month', limit: 5 });
      const incomeTrendPromise = analyticsService.getIncomeExpenseTrends({ type: 'income', granularity: 'daily', period: 'month' });
      const expenseTrendPromise = analyticsService.getIncomeExpenseTrends({ type: 'expense', granularity: 'daily', period: 'month' });


      const [summaryData, categoryData, incomeData, expenseData] = await Promise.all([
        summaryPromise,
        categorySpendingPromise,
        incomeTrendPromise,
        expenseTrendPromise
      ]);
      
      setSummary(summaryData);
      setCategorySpending(categoryData);
      setTrends({ income: incomeData, expense: expenseData });

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError('Failed to load dashboard data. Please try again later.');
      toast.error('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <PageLoader text="Loading Dashboard..." />;
  }

  if (error && !summary) { // Show error only if crucial data (summary) failed
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-text-light dark:text-text-dark">
          Welcome back, {user?.name.split(' ')[0] || 'User'}!
        </h1>
        <Button
            variant="primary"
            onClick={() => setIsAddTransactionModalOpen(true)}
            leftIcon={<PlusCircleIcon className="h-5 w-5"/>}
        >
            Add Transaction
        </Button>
      </div>
      

      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardBody>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 dark:bg-green-600 rounded-md p-3">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark truncate">
                      Total Income (This Month)
                    </dt>
                    <dd className="text-2xl font-semibold text-green-600 dark:text-green-400">
                      ₹{summary?.totalIncome?.toFixed(2) || '0.00'}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardBody>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 dark:bg-red-600 rounded-md p-3">
                  <ArrowTrendingDownIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark truncate">
                      Total Expenses (This Month)
                    </dt>
                    <dd className="text-2xl font-semibold text-red-600 dark:text-red-400">
                      ₹{summary?.totalExpense?.toFixed(2) || '0.00'}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <CardBody>
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${summary?.currentBalance >= 0 ? 'bg-blue-500 dark:bg-blue-600' : 'bg-yellow-500 dark:bg-yellow-600'}`}>
                  <ScaleIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark truncate">
                      Net Balance (This Month)
                    </dt>
                    <dd className={`text-2xl font-semibold ${summary?.currentBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      ₹{summary?.currentBalance?.toFixed(2) || '0.00'}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible" // Ensure this is distinct for different sections if needed
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader title="Spending by Category (This Month)" />
            <CardBody>
              {categorySpending && categorySpending.length > 0 ? (
                <CategoryPieChart data={categorySpending} />
              ) : (
                <p className="text-center text-text-muted-light dark:text-text-muted-dark py-8">No spending data for this month.</p>
              )}
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader title="Income vs Expense Trend (This Month)" />
            <CardBody>
              { (trends.income.length > 0 || trends.expense.length > 0) ? (
                <IncomeExpenseLineChart incomeData={trends.income} expenseData={trends.expense} />
              ) : (
                 <p className="text-center text-text-muted-light dark:text-text-muted-dark py-8">No trend data available for this month.</p>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>
      
      {/* TODO: Add Recent Transactions List */}
      {/* <motion.div variants={itemVariants}>
        <Card>
          <CardHeader title="Recent Transactions" actions={<Link to="/transactions" className="text-sm font-medium text-primary-light dark:text-primary-dark hover:underline">View all</Link>} />
          <CardBody>
             Placeholder for recent transactions list component
          </CardBody>
        </Card>
      </motion.div> */}

        <AddTransactionModal
            isOpen={isAddTransactionModalOpen}
            onClose={() => setIsAddTransactionModalOpen(false)}
            onTransactionAdded={() => {
                fetchData(); // Refresh dashboard data after adding a transaction
                toast.success("Transaction added successfully!");
            }}
        />
    </div>
  );
};

export default DashboardPage;