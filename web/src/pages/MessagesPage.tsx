import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
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
import MessageIcon from '@mui/icons-material/Message';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuth } from '../contexts/AuthContext';
import { useMessages } from '../hooks/useMessages';
import { useContacts } from '../hooks/useContacts';
import { createMessage, updateMessage, deleteMessage } from '../services/messages';
import type { Message, MessageStatus } from '../types';
import { format } from '../lib/dateUtils';

type FilterType = 'all' | MessageStatus;

export const MessagesPage = () => {
  const { connectionId } = useParams<{ connectionId: string }>();
  const { user } = useAuth();
  const { messages, loading } = useMessages(user?.uid, connectionId);
  const { contacts } = useContacts(user?.uid, connectionId);
  const navigate = useNavigate();

  const [filter, setFilter] = useState<FilterType>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Message | null>(null);
  const [target, setTarget] = useState<Message | null>(null);
  const [content, setContent] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const filtered = messages.filter((m) => filter === 'all' || m.status === filter);
  const sentCount = messages.filter((m) => m.status === 'sent').length;
  const scheduledCount = messages.filter((m) => m.status === 'scheduled').length;

  const getContactName = (id: string) => contacts.find((c) => c.id === id)?.name ?? id;

  const openCreate = () => {
    setEditing(null); setContent(''); setSelectedContacts([]); setScheduledAt(''); setFormError(''); setDialogOpen(true);
  };

  const openEdit = (msg: Message) => {
    setEditing(msg); setContent(msg.content); setSelectedContacts(msg.contactIds);
    const dt = new Date(msg.scheduledAt);
    const pad = (n: number) => String(n).padStart(2, '0');
    setScheduledAt(`${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
    setFormError(''); setDialogOpen(true);
  };

  const openDelete = (msg: Message) => { setTarget(msg); setDeleteDialogOpen(true); };

  const handleSave = async () => {
    if (!content.trim()) { setFormError('A mensagem é obrigatória.'); return; }
    if (selectedContacts.length === 0) { setFormError('Selecione ao menos um contato.'); return; }
    if (!scheduledAt) { setFormError('A data/hora de disparo é obrigatória.'); return; }
    const ts = new Date(scheduledAt).getTime();
    setSaving(true);
    try {
      if (editing) await updateMessage(editing.id, selectedContacts, content.trim(), ts);
      else await createMessage(user!.uid, connectionId!, selectedContacts, content.trim(), ts);
      setDialogOpen(false);
    } catch {
      setFormError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!target) return;
    try { await deleteMessage(target.id); }
    finally { setDeleteDialogOpen(false); setTarget(null); }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <IconButton onClick={() => navigate('/connections')} size="small" sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Mensagens</Typography>
          <Typography variant="body2" color="text.secondary">
            {messages.length > 0 ? `${messages.length} mensagem${messages.length !== 1 ? 's' : ''}` : 'Gerencie e agende mensagens'}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: 2.5 }}>
          Nova mensagem
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs value="messages" sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'grey.200' }}>
        <Tab label="Contatos" value="contacts" icon={<PersonIcon fontSize="small" />} iconPosition="start" onClick={() => navigate(`/connections/${connectionId}/contacts`)} />
        <Tab label="Mensagens" value="messages" icon={<MessageIcon fontSize="small" />} iconPosition="start" />
      </Tabs>

      {/* Stats */}
      {messages.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
          {[
            { label: 'Total', value: messages.length, icon: <MessageIcon />, color: '#4F46E5', bg: 'rgba(79,70,229,0.08)' },
            { label: 'Enviadas', value: sentCount, icon: <CheckCircleIcon />, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
            { label: 'Agendadas', value: scheduledCount, icon: <AccessTimeIcon />, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
          ].map((stat) => (
            <Card key={stat.label} elevation={0} sx={{ textAlign: 'center', py: 2, px: 1 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1, color: stat.color }}>
                {stat.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: stat.color }}>{stat.value}</Typography>
              <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
            </Card>
          ))}
        </Box>
      )}

      {/* Filtros */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {(['all', 'sent', 'scheduled'] as const).map((f) => (
          <Chip
            key={f}
            label={f === 'all' ? 'Todas' : f === 'sent' ? 'Enviadas' : 'Agendadas'}
            icon={f === 'sent' ? <SendIcon /> : f === 'scheduled' ? <ScheduleIcon /> : undefined}
            onClick={() => setFilter(f)}
            variant={filter === f ? 'filled' : 'outlined'}
            color={filter === f ? (f === 'sent' ? 'success' : f === 'scheduled' ? 'warning' : 'primary') : 'default'}
            sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
        ))}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Card elevation={0} sx={{ border: '2px dashed', borderColor: 'grey.200', borderRadius: 4, textAlign: 'center', py: 10, px: 4, bgcolor: 'transparent' }}>
          <Box sx={{ width: 72, height: 72, borderRadius: 4, background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(124,58,237,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <MessageIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>Nenhuma mensagem</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 280, mx: 'auto' }}>
            {filter === 'all' ? 'Crie sua primeira mensagem para começar' : filter === 'sent' ? 'Nenhuma mensagem enviada ainda' : 'Nenhuma mensagem agendada'}
          </Typography>
          {filter === 'all' && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: 2.5 }}>
              Nova mensagem
            </Button>
          )}
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map((msg) => (
            <Card key={msg.id} elevation={0} sx={{ '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Status + data */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        icon={msg.status === 'sent' ? <CheckCircleIcon /> : <AccessTimeIcon />}
                        label={msg.status === 'sent' ? 'Enviada' : 'Agendada'}
                        sx={{
                          fontWeight: 700,
                          bgcolor: msg.status === 'sent' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                          color: msg.status === 'sent' ? 'success.main' : 'warning.dark',
                          '& .MuiChip-icon': { color: 'inherit' },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {msg.status === 'sent'
                          ? `Enviada em ${format(msg.sentAt ?? msg.scheduledAt)}`
                          : `Agendada para ${format(msg.scheduledAt)}`}
                      </Typography>
                    </Box>

                    {/* Conteúdo */}
                    <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.6, color: 'text.primary' }}>
                      {msg.content}
                    </Typography>

                    {/* Contatos */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {msg.contactIds.map((id) => (
                        <Box key={id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'grey.100', borderRadius: 5, px: 1.5, py: 0.4 }}>
                          <Avatar sx={{ width: 18, height: 18, fontSize: 9, bgcolor: 'primary.main' }}>
                            {getContactName(id)[0]?.toUpperCase()}
                          </Avatar>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>{getContactName(id)}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Ações */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title={msg.status === 'sent' ? 'Mensagem já enviada' : 'Editar'}>
                      <span>
                        <IconButton size="small" onClick={() => openEdit(msg)} disabled={msg.status === 'sent'}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" onClick={() => openDelete(msg)}>
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

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm" disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Editar mensagem' : 'Nova mensagem'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '8px !important' }}>
          {formError && <Alert severity="error" sx={{ borderRadius: 2 }}>{formError}</Alert>}

          <FormControl fullWidth>
            <InputLabel>Contatos destinatários</InputLabel>
            <Select
              multiple
              value={selectedContacts}
              onChange={(e) => setSelectedContacts(e.target.value as string[])}
              input={<OutlinedInput label="Contatos destinatários" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => (
                    <Chip key={id} label={getContactName(id)} size="small" sx={{ borderRadius: 1.5 }} />
                  ))}
                </Box>
              )}
            >
              {contacts.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  <Checkbox checked={selectedContacts.includes(c.id)} size="small" />
                  <ListItemText primary={c.name} secondary={c.phone} />
                </MenuItem>
              ))}
            </Select>
            {contacts.length === 0 && (
              <FormHelperText error>Não há contatos cadastrados nesta conexão.</FormHelperText>
            )}
          </FormControl>

          <TextField
            label="Mensagem"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            placeholder="Digite a mensagem que será enviada..."
          />

          <TextField
            label="Data e hora do disparo"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Datas no passado disparam imediatamente ao salvar."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={<SendIcon />} sx={{ borderRadius: 2 }}>
            {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog excluir */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth disableRestoreFocus>
        <DialogTitle sx={{ fontWeight: 700 }}>Excluir mensagem</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: 2 }}>Excluir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
