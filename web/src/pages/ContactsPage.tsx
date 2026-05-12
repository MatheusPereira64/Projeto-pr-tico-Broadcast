import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
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
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MessageIcon from '@mui/icons-material/Message';
import PhoneIcon from '@mui/icons-material/Phone';
import { useAuth } from '../contexts/AuthContext';
import { useContacts } from '../hooks/useContacts';
import { createContact, updateContact, deleteContact } from '../services/contacts';
import type { Contact } from '../types';

export const ContactsPage = () => {
  const { connectionId } = useParams<{ connectionId: string }>();
  const { user } = useAuth();
  const { contacts, loading } = useContacts(user?.uid, connectionId);
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [target, setTarget] = useState<Contact | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openCreate = () => {
    setEditing(null);
    setName('');
    setPhone('');
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (contact: Contact) => {
    setEditing(contact);
    setName(contact.name);
    setPhone(contact.phone);
    setError('');
    setDialogOpen(true);
  };

  const openDelete = (contact: Contact) => {
    setTarget(contact);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    if (!phone.trim()) {
      setError('O telefone é obrigatório.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateContact(editing.id, name.trim(), phone.trim());
      } else {
        await createContact(user!.uid, connectionId!, name.trim(), phone.trim());
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
      await deleteContact(target.id);
    } finally {
      setDeleteDialogOpen(false);
      setTarget(null);
    }
  };

  return (
    <Box>
      <Box className="flex items-center gap-3 mb-2">
        <IconButton onClick={() => navigate('/connections')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Box className="flex-1">
          <Typography variant="h5" fontWeight={700}>
            Contatos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os contatos desta conexão
          </Typography>
        </Box>
      </Box>

      <Tabs value="contacts" sx={{ mb: 3 }}>
        <Tab label="Contatos" value="contacts" />
        <Tab
          label="Mensagens"
          value="messages"
          onClick={() => navigate(`/connections/${connectionId}/messages`)}
          icon={<MessageIcon fontSize="small" />}
          iconPosition="start"
        />
      </Tabs>

      <Box className="flex justify-end mb-4">
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Novo contato
        </Button>
      </Box>

      {loading ? (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      ) : contacts.length === 0 ? (
        <Box className="flex flex-col items-center justify-center py-24 text-center">
          <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum contato encontrado
          </Typography>
          <Typography variant="body2" color="text.disabled" className="mb-4">
            Adicione contatos para enviar mensagens
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Novo contato
          </Button>
        </Box>
      ) : (
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id} variant="outlined">
              <CardContent>
                <Box className="flex items-start justify-between">
                  <Box className="flex items-center gap-3">
                    <Box className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50">
                      <PersonIcon sx={{ color: '#16a34a' }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {contact.name}
                      </Typography>
                      <Box className="flex items-center gap-1">
                        <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {contact.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box className="flex">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => openEdit(contact)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" onClick={() => openDelete(contact)}>
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Editar contato' : 'Novo contato'}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 pt-2">
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            autoFocus
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            margin="dense"
            placeholder="+55 11 99999-9999"
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
        <DialogTitle>Excluir contato</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o contato <strong>{target?.name}</strong>?
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
