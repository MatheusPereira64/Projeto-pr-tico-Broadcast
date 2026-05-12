import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WifiIcon from '@mui/icons-material/Wifi';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from '../contexts/AuthContext';
import { useConnections } from '../hooks/useConnections';
import {
  createConnection,
  updateConnection,
  deleteConnection,
} from '../services/connections';
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

  const openCreate = () => {
    setEditing(null);
    setName('');
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (conn: Connection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(conn);
    setName(conn.name);
    setError('');
    setDialogOpen(true);
  };

  const openDelete = (conn: Connection, e: React.MouseEvent) => {
    e.stopPropagation();
    setTarget(conn);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateConnection(editing.id, name.trim());
      } else {
        await createConnection(user!.uid, name.trim());
      }
      setDialogOpen(false);
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!target) return;
    try {
      await deleteConnection(target.id);
    } finally {
      setDeleteDialogOpen(false);
      setTarget(null);
    }
  };

  return (
    <Box>
      <Box className="flex items-center justify-between mb-6">
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Conexões
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie suas conexões de broadcast
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nova conexão
        </Button>
      </Box>

      {loading ? (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      ) : connections.length === 0 ? (
        <Box className="flex flex-col items-center justify-center py-24 text-center">
          <WifiIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma conexão encontrada
          </Typography>
          <Typography variant="body2" color="text.disabled" className="mb-4">
            Crie sua primeira conexão para começar
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Nova conexão
          </Button>
        </Box>
      ) : (
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((conn) => (
            <Card key={conn.id} variant="outlined" className="hover:shadow-md transition-shadow">
              <CardActionArea onClick={() => navigate(`/connections/${conn.id}/contacts`)}>
                <CardContent>
                  <Box className="flex items-center justify-between">
                    <Box className="flex items-center gap-3">
                      <Box className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50">
                        <WifiIcon color="primary" />
                      </Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {conn.name}
                      </Typography>
                    </Box>
                    <Box className="flex items-center">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={(e) => openEdit(conn, e)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" onClick={(e) => openDelete(conn, e)}>
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                      <ChevronRightIcon color="action" />
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Editar conexão' : 'Nova conexão'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" className="mb-3">{error}</Alert>}
          <TextField
            autoFocus
            label="Nome da conexão"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="dense"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Excluir conexão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a conexão <strong>{target?.name}</strong>? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
