import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Backdrop,
  Fade,
  Box,
  styled,
  CircularProgress
} from '@mui/material';
import AppFormButton from '../buttons/AppFormButton';
import { useTheme } from '../theme/ThemeContext';

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    maxWidth: '500px',
    width: '100%',
  },
  '& .MuiBackdrop-root': {
    backdropFilter: 'blur(2px)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
}));

const AnimatedBackdrop = styled(Backdrop)({
  zIndex: -1,
  position: 'fixed',
  backdropFilter: 'blur(3px)',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
});

export default function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  title ,
  message,
  confirmText,
  cancelText,
  isLoading = false,
  itemName,
}) {
  const { primaryColor } = useTheme();

  return (
    <>
      <AnimatedBackdrop open={open} transitionDuration={500} />
      
      <StyledDialog
        open={open}
        onClose={onClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        sx={{
          '& .MuiDialog-container': {
            backdropFilter: 'blur(2px)',
          },
        }}
      >
        <Fade in={open} timeout={300}>
          <Box>
            <DialogTitle sx={{
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #e0e0e0',
              padding: '20px 24px',
              fontSize: '1.25rem',
              fontWeight: '600',
            }}>
              {title}
            </DialogTitle>
            
            <DialogContent sx={{ padding: '24px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p className="text-gray-700">
                  {message}
                </p>
                {itemName && (
                  <p className="font-semibold">
                    Item: <span className="text-red-600">{itemName}</span>
                  </p>
                )}
              </Box>
            </DialogContent>
            
            <DialogActions sx={{
              padding: '16px 24px',
              borderTop: '1px solid #e0e0e0',
              justifyContent: 'flex-end',
              gap: '12px',
            }}>
              <AppFormButton 
                text={cancelText}
                color="invert" 
                action={onClose}
                validation={true}
                disabled={isLoading}
              />
                
              <AppFormButton
                text={
                  isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CircularProgress size={16} color="inherit" />
                      Deleting...
                    </Box>
                  ) : (
                    confirmText
                  )
                }
                color={primaryColor}
                validation={true}
                action={onConfirm}
                disabled={isLoading}
              />
            </DialogActions>
          </Box>
        </Fade>
      </StyledDialog>
    </>
  );
}