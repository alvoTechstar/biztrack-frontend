// src/hooks/useThemeActions.js
import { useTheme } from '../context/ThemeContext';

export const useThemeActions = () => {
  const theme = useTheme();

  const getActionConfig = (actionType, entityName) => {
    const configs = {
      disable: {
        title: `Disable ${entityName}`,
        description: `You are about to disable this ${entityName.toLowerCase()}.`,
        buttonText: `Disable ${entityName}`,
        buttonColor: theme.colors.warning,
        loadingText: 'Disabling...'
      },
      delete: {
        title: `Delete ${entityName}`,
        description: `You are about to delete this ${entityName.toLowerCase()}. This action cannot be undone.`,
        buttonText: `Delete ${entityName}`,
        buttonColor: theme.colors.error,
        loadingText: 'Deleting...'
      },
      enable: {
        title: `Enable ${entityName}`,
        description: `You are about to enable this ${entityName.toLowerCase()}.`,
        buttonText: `Enable ${entityName}`,
        buttonColor: theme.colors.success,
        loadingText: 'Enabling...'
      },
      reject: {
        title: `Reject ${entityName}`,
        description: `You are about to reject this ${entityName.toLowerCase()}.`,
        buttonText: `Reject ${entityName}`,
        buttonColor: theme.colors.error,
        loadingText: 'Rejecting...'
      }
    };

    return configs[actionType] || configs.disable;
  };

  return {
    getActionConfig,
    primaryColor: theme.primaryColor,
    themeColors: theme.colors
  };
};