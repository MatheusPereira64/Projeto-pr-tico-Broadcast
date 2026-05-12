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
  Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MessageIcon from '@mui/icons-material/Message';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../contexts/AuthContext';
import { useContacts } from '../hooks/useContacts';
import { createContact, updateContact, deleteContact } from '../services/contacts';
import type { Contact } from '../types';

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

const avatarColors = [
  '#3B82F6', '#8B5CF6', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899',
];
const getAvatarColor = (id: string) => avatarColors[id.charCodeAt(0) % avatarColors.length];

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

  const openCreate = () => { setEditing(null); setName(''); setPhone(''); setError(''); setDialogOpen(true); };
  const openEdit = (c: Contact) => { setEditing(c); setName(c.name); setPhone(c.phone); setError(''); setDialogOpen(true); };
  const openDelete = (c: Contact) => { setTarget(c); setDeleteDialogOpen(true); };

  const handleSave = async () => {
    if (!name.trim()) { setError('O nome é obrigatório.'); return; }
    if (!phone.trim()) { setError('O telefone é obrigatório.'); return; }
    setSaving(true);
    try {
      if (editing) await updateContact(editing.id, name.trim(), phone.trim());
      else await createContact(user!.uid, connectionId!, name.trim(), phone.trim());
      setDialogOpen(false);
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!target) return;
    try { await deleteContact(target.id); }
    finally { setDeleteDialogOpen(false); setTarget(null); }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <IconButton
          onClick={() => navigate('/connections')}
          size="small"
          sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Contatos</Typography>
          <Typography variant="body2" color="text.secondary">
            {contacts.length > 0 ? `${contacts.length} contato${contacts.length !== 1 ? 's' : ''}` : 'Gerencie os contatos desta conexão'}
          </Typography>
        </Box>
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: 2.5, flexShrink: 0, px: { xs: 1.5, sm: 2.5 } }}>
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Novo contato</Box>
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value="contacts"
        sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'grey.200' }}
      >
        <Tab label="Contatos" value="contacts" icon={<PersonIcon fontSize="small" />} iconPosition="start" />
        <Tab
          label="Mensagens"
          value="messages"
          icon={<MessageIcon fontSize="small" />}
          iconPosition="start"
          onClick={() => navigate(`/connections/${connectionId}/messages`)}
        />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress />
        </Box>
      ) : contacts.length === 0 ? (
        <Card elevation={0} sx={{ border: '2px dashed', borderColor: 'grey.200', borderRadius: 4, textAlign: 'center', py: 10, px: 4, bgcolor: 'transparent' }}>
          <Box sx={{ width: 72, height: 72, borderRadius: 4, background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <PeopleAltIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>Nenhum contato ainda</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 280, mx: 'auto' }}>
            Adicione contatos para começar a enviar mensagens
          </Typography>
          <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: 2.5 }}>
            Adicionar contato
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
          {contacts.map((contact) => (
            <Card key={contact.id} elevation={0} sx={{ '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' } }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 46, height: 46, bgcolor: getAvatarColor(contact.id), fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                    {getInitials(contact.name)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>{contact.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                      <PhoneIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>{contact.phone}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexShrink: 0 }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => openEdit(contact)} sx={{ color: '#0EA5E9', '&:hover': { bgcolor: 'rgba(14,165,233,0.1)' } }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" onClick={() => openDelete(contact)} sx={{ color: '#EF4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs" disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Editar contato' : 'Novo contato'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          <TextField autoFocus label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth placeholder="+55 11 99999-9999" />
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
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir contato</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Tem certeza que deseja excluir <strong>{target?.name}</strong>? Esta ação não pode ser desfeita.
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
