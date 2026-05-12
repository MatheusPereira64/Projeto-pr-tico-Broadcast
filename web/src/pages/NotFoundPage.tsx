import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SendIcon from '@mui/icons-material/Send';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F5F7FF 0%, #EEF2FF 100%)',
        p: 4,
        textAlign: 'center',
      }}
    >
      {/* Ícone */}
      <Box
        sx={{
          width: 100,
          height: 100,
          borderRadius: '28%',
          background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 4,
          boxShadow: '0 20px 40px rgba(59,130,246,0.3)',
        }}
      >
        <SendIcon sx={{ fontSize: 48, color: 'white' }} />
      </Box>

      {/* Código de erro */}
      <Typography
        variant="h1"
        sx={{
          fontWeight: 900,
          fontSize: { xs: '6rem', sm: '8rem' },
          lineHeight: 1,
          background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2,
          letterSpacing: '-4px',
        }}
      >
        404
      </Typography>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Página não encontrada
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 380 }}>
        A página que você está procurando não existe ou foi movida. Verifique o endereço ou volte ao início.
      </Typography>

      <Button
        variant="contained"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/connections')}
        sx={{ borderRadius: 3, px: 4, py: 1.5, fontSize: '1rem' }}
      >
        Voltar ao início
      </Button>
    </Box>
  );
};
