import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';
import type { SlideProps } from '@mui/material';
import type { AlertColor } from '@mui/material';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface SnackbarContextValue {
  notify: (message: string, severity?: AlertColor) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

const SlideUp = (props: SlideProps) => <Slide {...props} direction="up" />;

export const SnackbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  const notify = useCallback((message: string, severity: AlertColor = 'success') => {
    setState({ open: true, message, severity });
  }, []);

  const success = useCallback((message: string) => notify(message, 'success'), [notify]);
  const error = useCallback((message: string) => notify(message, 'error'), [notify]);

  const handleClose = (_: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setState((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ notify, success, error }}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={3500}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slots={{ transition: SlideUp }}
      >
        <Alert
          onClose={handleClose}
          severity={state.severity}
          variant="filled"
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            minWidth: 280,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar deve ser usado dentro de SnackbarProvider');
  return ctx;
};
