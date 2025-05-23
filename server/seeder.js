import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from './models/User.model.js'; // If you want to seed a test user
import Category from './models/Category.model.js';
import connectDB from './config/db.js';

dotenv.config(); // Load .env variables from server directory's .env

connectDB();

const PREDEFINED_CATEGORIES = [
    // Expenses
    { name: 'Food', type: 'expense', icon: 'FaUtensils', color: '#FF6384', isPredefined: true },
    { name: 'Groceries', type: 'expense', icon: 'FaShoppingCart', color: '#FF9F40', isPredefined: true },
    { name: 'Travel', type: 'expense', icon: 'FaCar', color: '#FFCD56', isPredefined: true },
    { name: 'Housing', type: 'expense', icon: 'FaHome', color: '#4BC0C0', isPredefined: true },
    { name: 'Utilities', type: 'expense', icon: 'FaLightbulb', color: '#36A2EB', isPredefined: true },
    { name: 'Entertainment', type: 'expense', icon: 'FaFilm', color: '#9966FF', isPredefined: true },
    { name: 'Healthcare', type: 'expense', icon: 'FaBriefcaseMedical', color: '#C9CBCF', isPredefined: true },
    { name: 'Shopping', type: 'expense', icon: 'FaShoppingBag', color: '#F7464A', isPredefined: true },
    { name: 'Education', type: 'expense', icon: 'FaBook', color: '#46BFBD', isPredefined: true },
    { name: 'Gifts', type: 'expense', icon: 'FaGift', color: '#FDB45C', isPredefined: true },
    { name: 'Smoking', type: 'expense', icon: 'FaSmoking', color: '#808080', isPredefined: true },
    { name: 'Room Items', type: 'expense', icon: 'FaBed', color: '#A0522D', isPredefined: true },
    { name: 'Subscription', type: 'expense', icon: 'FaCreditCard', color: '#7E57C2', isPredefined: true },
    { name: 'Personal Care', type: 'expense', icon: 'FaUserTie', color: '#00ACC1', isPredefined: true },
    { name: 'Other Expense', type: 'expense', icon: 'FaQuestionCircle', color: '#6c757d', isPredefined: true },

    // Income
    { name: 'Salary', type: 'income', icon: 'FaMoneyBillWave', color: '#4CAF50', isPredefined: true },
    { name: 'Freelance', type: 'income', icon: 'FaLaptopCode', color: '#8BC34A', isPredefined: true },
    { name: 'Investment', type: 'income', icon: 'FaChartLine', color: '#CDDC39', isPredefined: true },
    { name: 'Gifts Received', type: 'income', icon: 'FaGift', color: '#FFEB3B', isPredefined: true },
    { name: 'Cashback', type: 'income', icon: 'FaUndo', color: '#FFC107', isPredefined: true },
    { name: 'Friend', type: 'income', icon: 'FaUserFriends', color: '#FF9800', isPredefined: true }, // "Friend" could be ambiguous, maybe "Loan Repayment" or "From Friends"
    { name: 'Rental Income', type: 'income', icon: 'FaKey', color: '#00BCD4', isPredefined: true },
    { name: 'Other Income', type: 'income', icon: 'FaPlusCircle', color: '#009688', isPredefined: true },
];


const importData = async () => {
  try {
    // Clear existing predefined categories (optional, be careful with this)
    // await Category.deleteMany({ isPredefined: true });
    // console.log('Existing predefined categories cleared (if any).'.yellow);

    let seededCount = 0;
    for (const catData of PREDEFINED_CATEGORIES) {
        const existing = await Category.findOne({ name: catData.name, type: catData.type, isPredefined: true });
        if (!existing) {
            await Category.create(catData);
            seededCount++;
            console.log(`Seeded category: ${catData.name}`.green);
        } else {
            console.log(`Category "${catData.name}" (${catData.type}) already exists, skipping.`.gray);
        }
    }
    console.log(`${seededCount} new predefined categories seeded successfully!`.green.inverse);

    // You can also seed a test user here if needed
    // await User.deleteMany(); // To clear users (DANGEROUS)
    // const createdUsers = await User.insertMany(sampleUsers);
    // console.log('Sample users imported!'.green.inverse);

    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    // DANGEROUS: This will delete ALL data from these collections.
    // Use with extreme caution.
    // await Goal.deleteMany();
    // await Budget.deleteMany();
    // await Transaction.deleteMany();
    // await Category.deleteMany({ isPredefined: false }); // Delete only custom categories
    // await User.deleteMany();

    await Category.deleteMany({ isPredefined: true });
    console.log('All predefined categories destroyed!'.red.inverse);

    // console.log('All data destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') { // To run destroy: node seeder.js -d
  destroyData();
} else if (process.argv[2] === '-import') { // To run import: node seeder.js -import
  importData();
} else {
  console.log('Seeder script:');
  console.log('To import predefined categories: node seeder.js -import');
  console.log('To destroy predefined categories: node seeder.js -d (Use with caution!)');
  process.exit();
}