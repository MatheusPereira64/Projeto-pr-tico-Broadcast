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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MessageIcon from '@mui/icons-material/Message';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
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

  const getContactName = (id: string) => contacts.find((c) => c.id === id)?.name ?? id;

  const openCreate = () => {
    setEditing(null);
    setContent('');
    setSelectedContacts([]);
    setScheduledAt('');
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (msg: Message) => {
    setEditing(msg);
    setContent(msg.content);
    setSelectedContacts(msg.contactIds);
    const dt = new Date(msg.scheduledAt);
    setScheduledAt(toDatetimeLocalValue(dt));
    setFormError('');
    setDialogOpen(true);
  };

  const openDelete = (msg: Message) => {
    setTarget(msg);
    setDeleteDialogOpen(true);
  };

  const toDatetimeLocalValue = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setFormError('A mensagem é obrigatória.');
      return;
    }
    if (selectedContacts.length === 0) {
      setFormError('Selecione ao menos um contato.');
      return;
    }
    if (!scheduledAt) {
      setFormError('A data/hora de disparo é obrigatória.');
      return;
    }

    const ts = new Date(scheduledAt).getTime();
    setSaving(true);
    try {
      if (editing) {
        await updateMessage(editing.id, selectedContacts, content.trim(), ts);
      } else {
        await createMessage(user!.uid, connectionId!, selectedContacts, content.trim(), ts);
      }
      setDialogOpen(false);
    } catch {
      setFormError('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!target) return;
    try {
      await deleteMessage(target.id);
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
            Mensagens
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie e agende mensagens para esta conexão
          </Typography>
        </Box>
      </Box>

      <Tabs value="messages" sx={{ mb: 3 }}>
        <Tab
          label="Contatos"
          value="contacts"
          onClick={() => navigate(`/connections/${connectionId}/contacts`)}
          icon={<PersonIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab label="Mensagens" value="messages" icon={<MessageIcon fontSize="small" />} iconPosition="start" />
      </Tabs>

      <Box className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, v) => v && setFilter(v)}
          size="small"
        >
          <ToggleButton value="all">Todas</ToggleButton>
          <ToggleButton value="sent">
            <SendIcon fontSize="small" sx={{ mr: 0.5 }} />
            Enviadas
          </ToggleButton>
          <ToggleButton value="scheduled">
            <ScheduleIcon fontSize="small" sx={{ mr: 0.5 }} />
            Agendadas
          </ToggleButton>
        </ToggleButtonGroup>

        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nova mensagem
        </Button>
      </Box>

      {loading ? (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Box className="flex flex-col items-center justify-center py-24 text-center">
          <MessageIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma mensagem encontrada
          </Typography>
          <Typography variant="body2" color="text.disabled" className="mb-4">
            {filter === 'all'
              ? 'Crie sua primeira mensagem'
              : filter === 'sent'
              ? 'Nenhuma mensagem enviada ainda'
              : 'Nenhuma mensagem agendada'}
          </Typography>
          {filter === 'all' && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Nova mensagem
            </Button>
          )}
        </Box>
      ) : (
        <Box className="flex flex-col gap-3">
          {filtered.map((msg) => (
            <Card key={msg.id} variant="outlined">
              <CardContent>
                <Box className="flex items-start justify-between gap-2">
                  <Box className="flex-1 min-w-0">
                    <Box className="flex items-center gap-2 mb-2 flex-wrap">
                      <Chip
                        size="small"
                        label={msg.status === 'sent' ? 'Enviada' : 'Agendada'}
                        color={msg.status === 'sent' ? 'success' : 'warning'}
                        icon={msg.status === 'sent' ? <SendIcon /> : <ScheduleIcon />}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {msg.status === 'sent'
                          ? `Enviada em ${format(msg.sentAt ?? msg.scheduledAt)}`
                          : `Agendada para ${format(msg.scheduledAt)}`}
                      </Typography>
                    </Box>
                    <Typography variant="body1" className="mb-2 break-words">
                      {msg.content}
                    </Typography>
                    <Box className="flex flex-wrap gap-1">
                      {msg.contactIds.map((id) => (
                        <Chip
                          key={id}
                          size="small"
                          label={getContactName(id)}
                          icon={<PersonIcon />}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                  <Box className="flex flex-shrink-0">
                    <Tooltip title="Editar">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => openEdit(msg)}
                          disabled={msg.status === 'sent'}
                        >
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar mensagem' : 'Nova mensagem'}</DialogTitle>
        <DialogContent className="flex flex-col gap-4 pt-2">
          {formError && <Alert severity="error">{formError}</Alert>}

          <FormControl fullWidth margin="dense">
            <InputLabel>Contatos</InputLabel>
            <Select
              multiple
              value={selectedContacts}
              onChange={(e) => setSelectedContacts(e.target.value as string[])}
              input={<OutlinedInput label="Contatos" />}
              renderValue={(selected) =>
                selected.map((id) => getContactName(id)).join(', ')
              }
            >
              {contacts.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  <Checkbox checked={selectedContacts.includes(c.id)} />
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
            margin="dense"
            placeholder="Digite a mensagem que será enviada..."
          />

          <TextField
            label="Data e hora do disparo"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            helperText="Se a data/hora for no passado ou agora, a mensagem será marcada como enviada imediatamente."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Excluir mensagem</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.</Typography>
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
