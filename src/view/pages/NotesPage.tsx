import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { TextField } from '../components/TextField'
import { AddIcon, DeleteIcon, EditIcon, FolderIcon, NoteIcon } from '../icons'
import { useNotesVM } from '../viewmodels/notesVM'
import { usePreferencesVM } from '../viewmodels/preferencesVM'
import type { NoteDocument } from '../../domain/entities/Note'

function formatDateLabel(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function NotesPage() {
  const focusMode = usePreferencesVM((s) => s.preferences.focusMode)
  const {
    folders,
    documents,
    loading,
    saving,
    error,
    init,
    createFolder,
    renameFolder,
    removeFolder,
    createDocument,
    updateDocument,
    removeDocument,
  } = useNotesVM()

  const [selectedFolderId, setSelectedFolderId] = useState<string>('')
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('')
  const [newFolderName, setNewFolderName] = useState('')
  const [newDocumentTitle, setNewDocumentTitle] = useState('')
  const [draftTitle, setDraftTitle] = useState('')
  const [draftContent, setDraftContent] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  useEffect(() => {
    void init()
  }, [init])

  useEffect(() => {
    if (!folders.length) {
      setSelectedFolderId('')
      return
    }
    if (!selectedFolderId || !folders.some((folder) => folder.id === selectedFolderId)) {
      setSelectedFolderId(folders[0].id)
    }
  }, [folders, selectedFolderId])

  const visibleDocuments = useMemo(() => {
    if (!selectedFolderId) return []
    return documents.filter((document) => document.folderId === selectedFolderId)
  }, [documents, selectedFolderId])

  useEffect(() => {
    if (!visibleDocuments.length) {
      setSelectedDocumentId('')
      setDraftTitle('')
      setDraftContent('')
      return
    }
    if (
      !selectedDocumentId ||
      !visibleDocuments.some((document) => document.id === selectedDocumentId)
    ) {
      const first = visibleDocuments[0]
      setSelectedDocumentId(first.id)
      setDraftTitle(first.title)
      setDraftContent(first.content)
    }
  }, [selectedDocumentId, visibleDocuments])

  const selectedDocument = useMemo(
    () => visibleDocuments.find((document) => document.id === selectedDocumentId) ?? null,
    [selectedDocumentId, visibleDocuments]
  )

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.id === selectedFolderId) ?? null,
    [folders, selectedFolderId]
  )

  const hasUnsavedChanges = Boolean(
    selectedDocument &&
    (draftTitle !== selectedDocument.title || draftContent !== selectedDocument.content)
  )

  const isFocusEditorOnly = focusMode

  const handleCreateFolder = async () => {
    if (newFolderName.trim().length < 2) return
    try {
      const created = await createFolder(newFolderName)
      setSelectedFolderId(created.id)
      setNewFolderName('')
      setFeedback({ type: 'success', message: 'Pasta criada com sucesso.' })
    } catch (e) {
      setFeedback({
        type: 'error',
        message: (e as Error).message || 'Não foi possível criar a pasta.',
      })
    }
  }

  const handleRenameFolder = async () => {
    if (!selectedFolder) return
    const nextName = window.prompt('Novo nome da pasta', selectedFolder.name)
    if (!nextName || nextName.trim().length < 2) return
    try {
      await renameFolder(selectedFolder.id, nextName)
      setFeedback({ type: 'success', message: 'Pasta renomeada.' })
    } catch (e) {
      setFeedback({
        type: 'error',
        message: (e as Error).message || 'Não foi possível renomear a pasta.',
      })
    }
  }

  const handleRemoveFolder = async () => {
    if (!selectedFolder) return
    const confirmed = window.confirm(
      `Excluir a pasta \"${selectedFolder.name}\" e todas as anotações dela?`
    )
    if (!confirmed) return
    try {
      await removeFolder(selectedFolder.id)
      setFeedback({ type: 'success', message: 'Pasta e anotações removidas.' })
    } catch (e) {
      setFeedback({
        type: 'error',
        message: (e as Error).message || 'Não foi possível remover a pasta.',
      })
    }
  }

  const handleCreateDocument = async () => {
    if (!selectedFolderId || newDocumentTitle.trim().length < 2) return
    try {
      const created = await createDocument(selectedFolderId, newDocumentTitle)
      setSelectedDocumentId(created.id)
      setDraftTitle(created.title)
      setDraftContent(created.content)
      setNewDocumentTitle('')
      setFeedback({ type: 'success', message: 'Documento criado com sucesso.' })
    } catch (e) {
      setFeedback({
        type: 'error',
        message: (e as Error).message || 'Não foi possível criar o documento.',
      })
    }
  }

  const handleSelectDocument = (document: NoteDocument) => {
    setSelectedDocumentId(document.id)
    setDraftTitle(document.title)
    setDraftContent(document.content)
  }

  const handleSaveDocument = async () => {
    if (!selectedDocument) return
    if (draftTitle.trim().length < 2) {
      setFeedback({ type: 'error', message: 'Dê um título válido para a anotação.' })
      return
    }
    try {
      const updated = await updateDocument({
        ...selectedDocument,
        title: draftTitle,
        content: draftContent,
      })
      setDraftTitle(updated.title)
      setDraftContent(updated.content)
      setFeedback({ type: 'success', message: 'Anotação salva.' })
    } catch (e) {
      setFeedback({
        type: 'error',
        message: (e as Error).message || 'Não foi possível salvar a anotação.',
      })
    }
  }

  const handleRemoveDocument = async () => {
    if (!selectedDocument) return
    const confirmed = window.confirm(`Excluir a anotação \"${selectedDocument.title}\"?`)
    if (!confirmed) return
    try {
      await removeDocument(selectedDocument.id)
      setFeedback({ type: 'success', message: 'Anotação removida.' })
    } catch (e) {
      setFeedback({
        type: 'error',
        message: (e as Error).message || 'Não foi possível remover a anotação.',
      })
    }
  }

  if (isFocusEditorOnly) {
    return (
      <Stack spacing={2}>
        <Card className="me-card me-anim" sx={{ p: 2.5, minHeight: 'calc(100vh - 130px)' }}>
          {!selectedDocument ? (
            <Stack
              spacing={1.5}
              justifyContent="center"
              alignItems="center"
              sx={{ minHeight: 'calc(100vh - 220px)', textAlign: 'center' }}
            >
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                Nenhuma anotação aberta no modo foco
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 460 }}>
                Abra ou crie uma anotação antes de entrar no modo foco para usar o editor em tela
                cheia.
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.5}
                alignItems={{ md: 'center' }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    Editor de anotações
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.25 }}>
                    Pasta: {selectedFolder?.name ?? 'Sem pasta'}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleRemoveDocument}
                    disabled={saving}
                  >
                    Excluir
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSaveDocument}
                    disabled={!hasUnsavedChanges || saving}
                  >
                    Salvar alterações
                  </Button>
                </Stack>
              </Stack>

              <TextField
                label="Título"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
              />
              <TextField
                label="Conteúdo"
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                multiline
                minRows={28}
                placeholder="Escreva sua anotação aqui..."
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: 'calc(100vh - 340px)',
                    alignItems: 'flex-start',
                  },
                }}
              />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ sm: 'center' }}
              >
                <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                  Última atualização: {formatDateLabel(selectedDocument.updatedAtISO)}
                </Typography>
                {hasUnsavedChanges ? (
                  <Chip label="Há alterações não salvas" color="warning" variant="outlined" />
                ) : (
                  <Chip label="Tudo salvo" color="success" variant="outlined" />
                )}
              </Stack>
            </Stack>
          )}
        </Card>

        <Snackbar
          open={Boolean(feedback)}
          autoHideDuration={3500}
          onClose={() => setFeedback(null)}
        >
          {feedback ? <Alert severity={feedback.type}>{feedback.message}</Alert> : <span />}
        </Snackbar>

        {loading ? (
          <Alert severity="info" icon={false}>
            Carregando anotações...
          </Alert>
        ) : null}
      </Stack>
    )
  }

  return (
    <Stack spacing={2}>
      {!isFocusEditorOnly ? (
        <Card className="me-card me-anim" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              alignItems={{ md: 'center' }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  Anotações
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.4 }}>
                  Organize suas matérias em pastas e documentos, mantendo cada aula separada.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip
                  icon={<FolderIcon />}
                  label={`${folders.length} pasta(s)`}
                  variant="outlined"
                />
                <Chip
                  icon={<NoteIcon />}
                  label={`${documents.length} documento(s)`}
                  variant="outlined"
                />
                {saving ? <Chip label="Salvando..." color="secondary" variant="outlined" /> : null}
              </Stack>
            </Stack>

            {error ? <Alert severity="error">{error}</Alert> : null}
          </Stack>
        </Card>
      ) : null}

      <Grid container spacing={2}>
        {!isFocusEditorOnly ? (
          <Grid item xs={12} md={4} lg={3.5}>
            <Stack spacing={2}>
              <Card className="me-card me-anim" sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Pastas
                  </Typography>
                  <TextField
                    label="Nova pasta"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Ex: Matemática"
                  />
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateFolder}
                    disabled={newFolderName.trim().length < 2 || saving}
                  >
                    Criar pasta
                  </Button>

                  <Divider />

                  <List disablePadding sx={{ display: 'grid', gap: 1 }}>
                    {folders.map((folder) => {
                      const count = documents.filter(
                        (document) => document.folderId === folder.id
                      ).length
                      const isSelected = folder.id === selectedFolderId
                      return (
                        <ListItemButton
                          key={folder.id}
                          selected={isSelected}
                          onClick={() => setSelectedFolderId(folder.id)}
                          sx={{
                            borderRadius: 2.5,
                            border: '1px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            alignItems: 'flex-start',
                          }}
                        >
                          <ListItemText
                            primary={folder.name}
                            secondary={`${count} documento(s)`}
                            primaryTypographyProps={{ fontWeight: 700 }}
                          />
                        </ListItemButton>
                      )
                    })}
                    {!folders.length ? (
                      <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                        Crie sua primeira pasta para começar.
                      </Typography>
                    ) : null}
                  </List>
                </Stack>
              </Card>

              <Card className="me-card me-anim" sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      Documentos
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Renomear pasta">
                        <span>
                          <IconButton
                            size="small"
                            onClick={handleRenameFolder}
                            disabled={!selectedFolder || saving}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Excluir pasta">
                        <span>
                          <IconButton
                            size="small"
                            onClick={handleRemoveFolder}
                            disabled={!selectedFolder || saving}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <TextField
                    label="Novo documento"
                    value={newDocumentTitle}
                    onChange={(e) => setNewDocumentTitle(e.target.value)}
                    placeholder={
                      selectedFolder ? `Ex: Aula de ${selectedFolder.name}` : 'Selecione uma pasta'
                    }
                    disabled={!selectedFolder}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleCreateDocument}
                    disabled={!selectedFolder || newDocumentTitle.trim().length < 2 || saving}
                  >
                    Criar documento
                  </Button>

                  <Divider />

                  <List disablePadding sx={{ display: 'grid', gap: 1 }}>
                    {visibleDocuments.map((document) => {
                      const isSelected = document.id === selectedDocumentId
                      return (
                        <ListItemButton
                          key={document.id}
                          selected={isSelected}
                          onClick={() => handleSelectDocument(document)}
                          sx={{
                            borderRadius: 2.5,
                            border: '1px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            alignItems: 'flex-start',
                          }}
                        >
                          <ListItemText
                            primary={document.title}
                            secondary={`Atualizado em ${formatDateLabel(document.updatedAtISO)}`}
                            primaryTypographyProps={{ fontWeight: 700 }}
                          />
                        </ListItemButton>
                      )
                    })}
                    {selectedFolder && !visibleDocuments.length ? (
                      <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                        Essa pasta ainda não tem documentos.
                      </Typography>
                    ) : null}
                  </List>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        ) : null}

        <Grid item xs={12} md={isFocusEditorOnly ? 12 : 8} lg={isFocusEditorOnly ? 12 : 8.5}>
          <Card
            className="me-card me-anim"
            sx={{ p: 2, minHeight: isFocusEditorOnly ? 'calc(100vh - 220px)' : 620 }}
          >
            {!selectedDocument ? (
              <Stack
                spacing={1.5}
                justifyContent="center"
                alignItems="center"
                sx={{
                  minHeight: isFocusEditorOnly ? 'calc(100vh - 300px)' : 520,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  {isFocusEditorOnly
                    ? 'Nenhuma anotação aberta no modo foco'
                    : 'Selecione um documento'}
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 460 }}>
                  {isFocusEditorOnly
                    ? 'Abra ou crie uma anotação antes de entrar no modo foco para usar o editor em tela cheia.'
                    : 'Escolha um documento existente ou crie uma nova anotação dentro da pasta selecionada.'}
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={2} sx={{ height: '100%' }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.5}
                  alignItems={{ md: 'center' }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant={isFocusEditorOnly ? 'h5' : 'h6'} sx={{ fontWeight: 900 }}>
                      Editor de anotações
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.25 }}>
                      Pasta: {selectedFolder?.name ?? 'Sem pasta'}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleRemoveDocument}
                      disabled={saving}
                    >
                      Excluir
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSaveDocument}
                      disabled={!hasUnsavedChanges || saving}
                    >
                      Salvar alterações
                    </Button>
                  </Stack>
                </Stack>

                <TextField
                  label="Título"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                />
                <TextField
                  label="Conteúdo"
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  multiline
                  minRows={isFocusEditorOnly ? 24 : 18}
                  placeholder="Escreva sua anotação aqui..."
                  sx={
                    isFocusEditorOnly
                      ? {
                          '& .MuiInputBase-root': {
                            minHeight: 'calc(100vh - 430px)',
                            alignItems: 'flex-start',
                          },
                        }
                      : undefined
                  }
                />

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ sm: 'center' }}
                >
                  <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                    Última atualização: {formatDateLabel(selectedDocument.updatedAtISO)}
                  </Typography>
                  {hasUnsavedChanges ? (
                    <Chip label="Há alterações não salvas" color="warning" variant="outlined" />
                  ) : (
                    <Chip label="Tudo salvo" color="success" variant="outlined" />
                  )}
                </Stack>
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={Boolean(feedback)} autoHideDuration={3500} onClose={() => setFeedback(null)}>
        {feedback ? <Alert severity={feedback.type}>{feedback.message}</Alert> : <span />}
      </Snackbar>

      {loading ? (
        <Alert severity="info" icon={false}>
          Carregando anotações...
        </Alert>
      ) : null}
    </Stack>
  )
}
