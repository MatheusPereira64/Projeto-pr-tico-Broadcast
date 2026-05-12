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
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('As senhas não coincidem.'); return; }
    if (password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres.'); return; }
    setLoading(true);
    try {
      await signUp(email, password);
      navigate('/connections');
    } catch {
      setError('Não foi possível criar a conta. Verifique se o e-mail já está em uso.');
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
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          p: 6,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -100, right: -100 }} />
        <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -80, left: -80 }} />
        <Box sx={{ position: 'relative', textAlign: 'center' }}>
          <Box component="img" src="/logo.png" alt="SendFlow" sx={{ width: 140, height: 'auto', mx: 'auto', mb: 3, display: 'block', borderRadius: '28%', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }} />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>SendFlow</Typography>
          <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 300 }}>
            Crie sua conta gratuitamente e comece a gerenciar suas conexões agora mesmo.
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
        <Paper elevation={0} sx={{ width: '100%', maxWidth: 400, p: { xs: 3, sm: 4 }, borderRadius: 4, border: '1px solid', borderColor: 'grey.200' }}>
          <Box sx={{ display: { md: 'none' }, textAlign: 'center', mb: 3 }}>
            <Box component="img" src="/logo.png" alt="SendFlow" sx={{ width: 80, height: 'auto', mb: 1.5, borderRadius: '28%', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }} color="primary">SendFlow</Typography>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Criar conta</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Registre-se gratuitamente no SendFlow</Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth autoComplete="email" />
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="new-password"
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
            <TextField label="Confirmar senha" type={showPassword ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} required fullWidth />
            <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ mt: 1, py: 1.4, fontSize: '1rem' }}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
            Já tem uma conta?{' '}
            <Link component={RouterLink} to="/login" sx={{ fontWeight: 700, color: 'primary.main' }}>Entrar</Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};
