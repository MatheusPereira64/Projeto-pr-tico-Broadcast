import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Paper,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/connections');
    } catch {
      setError('E-mail ou senha inválidos. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Painel esquerdo — gradiente */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          p: 6,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            top: -100,
            right: -100,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            bottom: -80,
            left: -80,
          }}
        />
        <Box sx={{ position: 'relative', textAlign: 'center' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              backdropFilter: 'blur(10px)',
            }}
          >
            <SendIcon sx={{ fontSize: 36, color: 'white' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            SendFlow
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 300 }}>
            Gerencie suas conexões e envie mensagens para seus contatos com facilidade.
          </Typography>
        </Box>
      </Box>

      {/* Painel direito — formulário */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 480px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
          p: { xs: 3, sm: 6 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 400,
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          {/* Logo mobile */}
          <Box sx={{ display: { md: 'none' }, textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <SendIcon sx={{ color: 'white', fontSize: 26 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }} color="primary">
              SendFlow
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            Bem-vindo de volta
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Entre na sua conta para continuar
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="current-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 1, py: 1.4, fontSize: '1rem' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
            Não tem uma conta?{' '}
            <Link component={RouterLink} to="/register" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Cadastre-se grátis
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};
