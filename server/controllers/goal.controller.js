import asyncHandler from 'express-async-handler';
import Goal from '../models/Goal.model.js';
import User from '../models/User.model.js'; // For notifications
// import { sendGoalAchievedNotification } from '../services/email.service.js'; // If sending email for goals
import mongoose from 'mongoose';

/**
 * @desc    Create a new goal
 * @route   POST /api/goals
 * @access  Private
 */
const createGoal = asyncHandler(async (req, res) => {
  const { name, targetAmount, currentAmount, deadline, description } = req.body;

  if (!name || !targetAmount) {
    res.status(400);
    throw new Error('Goal name and target amount are required.');
  }

  const goal = await Goal.create({
    user: req.user._id,
    name,
    targetAmount: parseFloat(targetAmount),
    currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
    deadline: deadline ? new Date(deadline) : null,
    description,
  });

  res.status(201).json(goal);
});

/**
 * @desc    Get all goals for the logged-in user
 * @route   GET /api/goals
 * @access  Private
 */
const getGoals = asyncHandler(async (req, res) => {
  const { isAchieved } = req.query; // Filter by achieved status
  const query = { user: req.user._id };

  if (isAchieved !== undefined) {
    query.isAchieved = isAchieved === 'true';
  }

  const goals = await Goal.find(query).sort({ createdAt: -1 });
  res.json(goals.map(goal => ({...goal.toObject(), progress: goal.progress}) ));
});

/**
 * @desc    Get a single goal by ID
 * @route   GET /api/goals/:id
 * @access  Private
 */
const getGoalById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid goal ID format');
  }
  const goal = await Goal.findById(req.params.id);

  if (goal && goal.user.toString() === req.user._id.toString()) {
    res.json({...goal.toObject(), progress: goal.progress});
  } else {
    res.status(404);
    throw new Error('Goal not found or not authorized');
  }
});

/**
 * @desc    Update a goal's details (name, targetAmount, deadline, description)
 * @route   PUT /api/goals/:id
 * @access  Private
 */
const updateGoal = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid goal ID format');
  }
  const goal = await Goal.findById(req.params.id);

  if (goal && goal.user.toString() === req.user._id.toString()) {
    const { name, targetAmount, currentAmount, deadline, description, isAchieved } = req.body;

    goal.name = name || goal.name;
    goal.targetAmount = targetAmount !== undefined ? parseFloat(targetAmount) : goal.targetAmount;
    // currentAmount should ideally be updated via a specific 'contribute' or 'update progress' action
    // but allowing it here for full update flexibility.
    goal.currentAmount = currentAmount !== undefined ? parseFloat(currentAmount) : goal.currentAmount;
    goal.deadline = deadline !== undefined ? (deadline ? new Date(deadline) : null) : goal.deadline;
    goal.description = description !== undefined ? description : goal.description;

    // isAchieved is usually derived, but allow manual override if necessary
    if (typeof isAchieved === 'boolean') {
        goal.isAchieved = isAchieved;
    } else {
      // Recalculate based on current and target amounts if not explicitly set
      goal.isAchieved = goal.currentAmount >= goal.targetAmount;
    }

    // Check for achievement if currentAmount was updated
    const previouslyAchieved = goal.isAchieved; // Before potential save
    if (goal.currentAmount >= goal.targetAmount && !previouslyAchieved) {
        goal.isAchieved = true;
        // TODO: Trigger "Goal Achieved" notification (toast on frontend, optional email)
        // const user = await User.findById(req.user._id).select('email emailPreferences');
        // if (user && user.emailPreferences.goalNotifications) { // Assuming such a preference exists
        //    sendGoalAchievedNotification(user, goal);
        // }
        console.log(`Goal "${goal.name}" achieved by user ${req.user._id}! 🎉`);
    }


    const updatedGoal = await goal.save();
    res.json({...updatedGoal.toObject(), progress: updatedGoal.progress});
  } else {
    res.status(404);
    throw new Error('Goal not found or not authorized');
  }
});


/**
 * @desc    Update a goal's current progress (currentAmount)
 * @route   PATCH /api/goals/:id/progress
 * @access  Private
 */
const updateGoalProgress = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid goal ID format');
    }
    const goal = await Goal.findById(req.params.id);

    if (goal && goal.user.toString() === req.user._id.toString()) {
        const { currentAmount } = req.body;

        if (currentAmount === undefined || isNaN(parseFloat(currentAmount))) {
            res.status(400);
            throw new Error('Valid currentAmount is required.');
        }
        if (parseFloat(currentAmount) < 0) {
            res.status(400);
            throw new Error('Current amount cannot be negative.');
        }
        // Optional: if currentAmount cannot exceed targetAmount, enforce here too.
        // Model validation handles this, but early check is good.
        // if (parseFloat(currentAmount) > goal.targetAmount) {
        //     res.status(400);
        //     throw new Error('Current amount cannot exceed target amount. Update target first if needed.');
        // }


        goal.currentAmount = parseFloat(currentAmount);

        const previouslyAchieved = goal.isAchieved;
        // isAchieved will be updated by pre-save hook in model

        const updatedGoal = await goal.save(); // This will trigger pre-save hook

        if (updatedGoal.isAchieved && !previouslyAchieved) {
            // Goal was just achieved
            console.log(`Goal "${updatedGoal.name}" achieved by user ${req.user._id} via progress update! 🎉`);
            // TODO: Trigger "Goal Achieved" notification (toast on frontend, optional email)
            // const user = await User.findById(req.user._id).select('email emailPreferences');
            // if (user && user.emailPreferences.goalNotifications) {
            //    sendGoalAchievedNotification(user, updatedGoal);
            // }
        }

        res.json({...updatedGoal.toObject(), progress: updatedGoal.progress});
    } else {
        res.status(404);
        throw new Error('Goal not found or not authorized');
    }
});


/**
 * @desc    Delete a goal
 * @route   DELETE /api/goals/:id
 * @access  Private
 */
const deleteGoal = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error('Invalid goal ID format');
  }
  const goal = await Goal.findById(req.params.id);

  if (goal && goal.user.toString() === req.user._id.toString()) {
    await Goal.deleteOne({_id: goal._id});
    res.json({ message: 'Goal removed' });
  } else {
    res.status(404);
    throw new Error('Goal not found or not authorized');
  }
});

export {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
};