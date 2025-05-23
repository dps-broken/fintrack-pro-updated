import React from 'react';
import { format, parseISO, differenceInDays, formatDistanceToNowStrict } from 'date-fns';
import GoalProgressCircular from './GoalProgressCircular';
import { PencilSquareIcon, TrashIcon, TrophyIcon, CalendarDaysIcon, PlusIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import Card, { CardBody, CardFooter } from '../common/Card';
import Button from '../common/Button';
import { motion } from 'framer-motion';

const GoalItem = ({ goal, onEdit, onDelete, onOpenUpdateProgressModal }) => {
  const { name, targetAmount, currentAmount, deadline, description, progress, isAchieved } = goal;

  const daysLeft = deadline ? differenceInDays(parseISO(deadline), new Date()) : null;
  let deadlineText = "No deadline";
  if (deadline) {
    if (daysLeft < 0 && !isAchieved) {
        deadlineText = `Overdue by ${formatDistanceToNowStrict(parseISO(deadline), { addSuffix: false })}`;
    } else if (isAchieved) {
        deadlineText = `Achieved on or before ${format(parseISO(deadline), 'MMM d, yyyy')}`;
    } else {
        deadlineText = `${formatDistanceToNowStrict(parseISO(deadline), { addSuffix: true })}`;
    }
  }


  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };


  return (
    <motion.div variants={itemVariants}>
        <Card className={`flex flex-col h-full border-2 ${isAchieved ? 'border-green-500 dark:border-green-400' : 'border-transparent'}`} hoverEffect={!isAchieved}>
        <CardBody className="flex-grow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                    {isAchieved ? (
                        <TrophyIcon className="h-8 w-8 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                    ) : (
                        <TrophyIcon className="h-8 w-8 text-primary-light dark:text-primary-dark flex-shrink-0" />
                    )}
                    <div>
                        <h3 className="text-lg font-semibold text-text-light dark:text-text-dark truncate" title={name}>
                            {name}
                        </h3>
                        {isAchieved && (
                            <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100 rounded-full">
                                Achieved! 🎉
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex space-x-1">
                    <button
                    onClick={() => onEdit(goal)}
                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md"
                    aria-label="Edit goal"
                    >
                    <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                    onClick={() => onDelete(goal._id)}
                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md"
                    aria-label="Delete goal"
                    >
                    <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                    <GoalProgressCircular percentage={progress || 0} achieved={isAchieved} />
                </div>
                <div className="flex-grow space-y-1 text-sm text-center sm:text-left">
                    <p className="text-text-light dark:text-text-dark">
                        <span className="font-semibold">₹{currentAmount.toFixed(2)}</span> saved
                    </p>
                    <p className="text-text-muted-light dark:text-text-muted-dark">
                        Target: ₹{targetAmount.toFixed(2)}
                    </p>
                    {deadline && (
                        <p className={`flex items-center justify-center sm:justify-start text-xs ${daysLeft < 0 && !isAchieved ? 'text-red-500' : 'text-text-muted-light dark:text-text-muted-dark'}`}>
                            <CalendarDaysIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                            {deadlineText}
                        </p>
                    )}
                    {description && <p className="text-xs text-text-muted-light dark:text-text-muted-dark pt-1 italic truncate" title={description}>{description}</p>}
                </div>
            </div>
        </CardBody>
        {!isAchieved && (
            <CardFooter className="bg-gray-50 dark:bg-slate-700/50">
                <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => onOpenUpdateProgressModal(goal)}
                    leftIcon={<BanknotesIcon className="h-4 w-4"/>}
                >
                    Update Progress
                </Button>
            </CardFooter>
        )}
        </Card>
    </motion.div>
  );
};

export default GoalItem;