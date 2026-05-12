import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WifiIcon from '@mui/icons-material/Wifi';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from '../contexts/AuthContext';
import { useConnections } from '../hooks/useConnections';
import { createConnection, updateConnection, deleteConnection } from '../services/connections';
import type { Connection } from '../types';

export const ConnectionsPage = () => {
  const { user } = useAuth();
  const { connections, loading } = useConnections(user?.uid);
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Connection | null>(null);
  const [target, setTarget] = useState<Connection | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openCreate = () => { setEditing(null); setName(''); setError(''); setDialogOpen(true); };

  const openEdit = (conn: Connection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(conn); setName(conn.name); setError(''); setDialogOpen(true);
  };

  const openDelete = (conn: Connection, e: React.MouseEvent) => {
    e.stopPropagation();
    setTarget(conn); setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('O nome é obrigatório.'); return; }
    setSaving(true);
    try {
      if (editing) await updateConnection(editing.id, name.trim());
      else await createConnection(user!.uid, name.trim());
      setDialogOpen(false);
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!target) return;
    try { await deleteConnection(target.id); }
    finally { setDeleteDialogOpen(false); setTarget(null); }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
            Conexões
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {connections.length > 0
              ? `${connections.length} conexão${connections.length !== 1 ? 'ões' : ''} ativa${connections.length !== 1 ? 's' : ''}`
              : 'Gerencie suas conexões de broadcast'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ borderRadius: 2.5, px: { xs: 1.5, sm: 2.5 }, flexShrink: 0 }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Nova conexão</Box>
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      ) : connections.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: '2px dashed',
            borderColor: 'grey.200',
            borderRadius: 4,
            textAlign: 'center',
            py: 10,
            px: 4,
            bgcolor: 'transparent',
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <WifiIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>Nenhuma conexão ainda</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300, mx: 'auto' }}>
            Crie sua primeira conexão para começar a gerenciar contatos e mensagens
          </Typography>
          <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: 2.5 }}>
            Criar primeira conexão
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2.5 }}>
          {connections.map((conn) => (
            <Card
              key={conn.id}
              elevation={0}
              sx={{
                cursor: 'pointer',
                '&:hover': { boxShadow: '0 8px 24px rgba(59,130,246,0.15)', transform: 'translateY(-2px)', borderColor: 'primary.light' },
              }}
              onClick={() => navigate(`/connections/${conn.id}/contacts`)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <WifiIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={(e) => openEdit(conn, e)} sx={{ color: '#0EA5E9', '&:hover': { bgcolor: 'rgba(14,165,233,0.1)', color: '#0284C7' } }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" onClick={(e) => openDelete(conn, e)} sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', color: '#DC2626' } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
                  {conn.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                  <Chip
                    label="Ativa"
                    size="small"
                    sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: 'success.main', fontWeight: 600, fontSize: '0.7rem' }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Ver detalhes</Typography>
                    <ArrowForwardIcon sx={{ fontSize: 14 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs" disableRestoreFocus>
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
          {editing ? 'Editar conexão' : 'Nova conexão'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {editing ? 'Altere o nome da conexão.' : 'Dê um nome para identificar esta conexão.'}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            label="Nome da conexão"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Ex: WhatsApp Empresa"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" color="inherit" sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button variant="contained" color="info" onClick={handleSave} disabled={saving} sx={{ borderRadius: 2 }}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog excluir */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir conexão</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Tem certeza que deseja excluir <strong>{target?.name}</strong>? Todos os contatos e mensagens vinculados serão perdidos. Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" color="inherit" sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: 2 }}>Excluir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
