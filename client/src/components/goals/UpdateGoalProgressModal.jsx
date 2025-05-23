import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { toast } from 'sonner';
import { BanknotesIcon } from '@heroicons/react/24/outline';

const UpdateGoalProgressModal = ({ isOpen, onClose, goal, onProgressUpdate }) => {
  const [currentAmount, setCurrentAmount] = useState(goal?.currentAmount || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (goal) {
      setCurrentAmount(goal.currentAmount || 0);
      setError(''); // Reset error when goal changes
    }
  }, [goal]);

  if (!goal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const newAmount = parseFloat(currentAmount);

    if (isNaN(newAmount) || newAmount < 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    if (newAmount > goal.targetAmount) {
      setError("Current amount cannot exceed target amount. Update target first if needed.");
      // Or allow it and let backend/model handle it
    }

    setIsLoading(true);
    try {
      await onProgressUpdate(goal._id, newAmount); // This calls the actual service update
      onClose();
    } catch (err) {
      // Error is typically handled by the calling page's onProgressUpdate (which includes toast)
      // toast.error(err.message || "Failed to update progress.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Progress for "${goal.name}"`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
          Target: ₹{goal.targetAmount.toFixed(2)}
        </p>
        <Input
          id="currentAmountUpdate"
          name="currentAmountUpdate"
          type="number"
          label="Current Amount Saved (₹)"
          value={currentAmount}
          onChange={(e) => setCurrentAmount(e.target.value)}
          leftIcon={<BanknotesIcon />}
          error={error} // Display validation error here
          touched={!!error} // Consider this field touched if there's an error
          disabled={isLoading}
          autoFocus
        />
        {/* {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>} */}
        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
            Update Progress
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateGoalProgressModal;