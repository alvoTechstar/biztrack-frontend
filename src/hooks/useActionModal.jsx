// src/hooks/useActionModal.js
import { useState } from 'react';

export const useActionModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    actionType: '',
    entityId: null,
    entityName: '', // Add this field
    businessName: '', // Keep this for backward compatibility
    entityType: '', // 'business', 'user', 'ad', etc.
    reason: '',
    onSubmit: null,
    customDescription: null
  });

  const openModal = (actionType, entityId, entityName, entityType, onSubmit, customDescription = null) => {
    setModalState({
      isOpen: true,
      actionType,
      entityId,
      entityName, // Set entityName
      businessName: entityName, // Also set businessName for backward compatibility
      entityType,
      reason: '',
      onSubmit,
      customDescription
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      actionType: '',
      entityId: null,
      entityName: '',
      businessName: '',
      entityType: '',
      reason: '',
      onSubmit: null,
      customDescription: null
    });
  };

  const setReason = (reason) => {
    setModalState(prev => ({ ...prev, reason }));
  };

  const handleSubmit = async () => {
    if (modalState.onSubmit && modalState.entityId) {
      await modalState.onSubmit(modalState.entityId, modalState.reason);
    }
    closeModal();
  };

  return {
    modalState,
    openModal,
    closeModal,
    setReason,
    handleSubmit
  };
};