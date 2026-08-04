import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Task } from '@/types/models'
import { getStatusMeta, getPriorityMeta, TASK_PRIORITIES } from '@/lib/task-meta'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CalendarIcon,
  MessageCircle,
  Paperclip,
  CheckCircle,
  Trash2,
  UserCircle2,
  Loader2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { updateTask, deleteTask } from '@/services/tasks'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTeamMembers } from '@/hooks/use-team-members'
import pb from '@/lib/pocketbase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'

interface Props {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskViewDialog({ task, open, onOpenChange }: Props) {
  const navigate = useNavigate()
  const { members, loading: loadingMembers } = useTeamMembers()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('media')
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [assignedTo, setAssignedTo] = useState<string>('unassigned')
  const [isSaving, setIsSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (task && open) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setPriority(task.priority || 'media')
      setDueDate(task.due_date ? new Date(task.due_date) : undefined)
      setAssignedTo(task.assigned_to || 'unassigned')
      setFieldErrors({})
    }
  }, [task, open])

  if (!task) return null

  const statusMeta = getStatusMeta(task.status)
  const linkedCount = task.linked_message_ids
    ? Array.isArray(task.linked_message_ids)
      ? task.linked_message_ids.length
      : 1
    : 0

  const handleComplete = async () => {
    await updateTask(task.id, { status: 'concluida', completed_at: new Date().toISOString() })
    onOpenChange(false)
  }

  const handleDelete = async () => {
    await deleteTask(task.id)
    onOpenChange(false)
  }

  const handleNavigate = () => {
    onOpenChange(false)
    if (task.conversation_id) {
      const msgParam =
        task.linked_message_ids &&
        Array.isArray(task.linked_message_ids) &&
        task.linked_message_ids.length > 0
          ? `&msg=${task.linked_message_ids[0]}`
          : ''
      navigate(`/conversas?chat=${task.conversation_id}${msgParam}`)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setFieldErrors({ title: 'O título da tarefa é obrigatório' })
      return
    }

    setIsSaving(true)
    setFieldErrors({})

    try {
      let formattedDate: string | undefined = undefined
      if (dueDate) {
        formattedDate = dueDate.toISOString().replace('T', ' ')
      }

      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        priority: priority as any,
        due_date: formattedDate,
        assigned_to: assignedTo === 'unassigned' ? '' : assignedTo,
      })

      toast.success('Tarefa atualizada com sucesso!')
      onOpenChange(false)
    } catch (error) {
      setFieldErrors(extractFieldErrors(error))
      toast.error('Erro ao salvar: ' + getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isSaving && onOpenChange(val)}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className={statusMeta.color}>
              {statusMeta.label}
            </Badge>
            <Badge variant="outline" className={getPriorityMeta(task.priority).color}>
              {getPriorityMeta(task.priority).label}
            </Badge>
          </div>
          <DialogTitle className="text-xl">Editar Tarefa</DialogTitle>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
            {task.due_date && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                Vencimento: {format(new Date(task.due_date), 'PPP', { locale: ptBR })}
              </span>
            )}
            {linkedCount > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="w-4 h-4" />
                {linkedCount} mensagem(ns) vinculada(s)
              </span>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da tarefa"
                disabled={isSaving}
                maxLength={100}
                className="bg-background"
              />
              {fieldErrors.title && <p className="text-sm text-destructive">{fieldErrors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Responsável
                </Label>
                <Select
                  value={assignedTo}
                  onValueChange={setAssignedTo}
                  disabled={isSaving || loadingMembers}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Sem responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <UserCircle2 className="w-4 h-4" />
                        <span>Ninguém</span>
                      </div>
                    </SelectItem>
                    {members.map((member) => {
                      const user = member.expand?.user_id
                      if (!user) return null
                      return (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5">
                              <AvatarImage
                                src={
                                  user.avatar
                                    ? pb.files.getUrl(user, user.avatar, { thumb: '100x100' })
                                    : undefined
                                }
                              />
                              <AvatarFallback className="text-[9px]">
                                {user.name?.charAt(0) || user.email?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[150px]">
                              {user.name || user.email}
                            </span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {fieldErrors.assigned_to && (
                  <p className="text-sm text-destructive">{fieldErrors.assigned_to}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Prioridade
                </Label>
                <Select value={priority} onValueChange={setPriority} disabled={isSaving}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.priority && (
                  <p className="text-sm text-destructive">{fieldErrors.priority}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Prazo (Opcional)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal bg-background hover:bg-background/80',
                      !dueDate && 'text-muted-foreground',
                    )}
                    disabled={isSaving}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? (
                      format(dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    locale={ptBR}
                  />
                  {dueDate && (
                    <div className="p-2 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setDueDate(undefined)}
                      >
                        Limpar Data
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              {fieldErrors.due_date && (
                <p className="text-sm text-destructive">{fieldErrors.due_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Descrição
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição da tarefa..."
                disabled={isSaving}
                className="min-h-[140px] resize-y bg-background"
              />
              {fieldErrors.description && (
                <p className="text-sm text-destructive">{fieldErrors.description}</p>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {task.conversation_id && (
              <Button variant="outline" onClick={handleNavigate} className="flex-1 sm:flex-none">
                <MessageCircle className="w-4 h-4 mr-2" />
                Ver na conversa
              </Button>
            )}
            {task.status !== 'concluida' && (
              <Button
                variant="default"
                onClick={handleComplete}
                className="flex-1 sm:flex-none"
                disabled={isSaving}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Concluir
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive flex-1 sm:flex-none"
              onClick={handleDelete}
              disabled={isSaving}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
            <DialogClose asChild>
              <Button variant="secondary" className="flex-1 sm:flex-none" disabled={isSaving}>
                Fechar
              </Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
