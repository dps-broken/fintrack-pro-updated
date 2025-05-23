// client/src/contexts/NotificationContext.js (Example for custom modals)
import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext({
  isModalOpen: false,
  modalContent: null, // Can be JSX
  modalTitle: '',
  openModal: () => {},
  closeModal: () => {},
  // You could add toast functions here too if building custom toasts
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalTitle('');
    setModalContent(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        isModalOpen,
        modalContent,
        modalTitle,
        openModal,
        closeModal,
      }}
    >
      {children}
      {/* You might render a global Modal component here that listens to this context */}
      {/* e.g., <GlobalModal isOpen={isModalOpen} title={modalTitle} onClose={closeModal}>{modalContent}</GlobalModal> */}
    </NotificationContext.Provider>
  );
};