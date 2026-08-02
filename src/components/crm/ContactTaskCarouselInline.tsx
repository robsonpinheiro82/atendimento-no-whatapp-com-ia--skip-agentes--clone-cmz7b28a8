import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, ListTodo, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Task } from '@/types/models'
import { getTasks } from '@/services/tasks'
import { getStatusMeta, getPriorityMeta } from '@/lib/task-meta'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ContactTaskCarouselInlineProps {
  contactId: string
}

export function ContactTaskCarouselInline({ contactId }: ContactTaskCarouselInlineProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTasks(`crm_contact_id = "${contactId}"`)
      setTasks(data)
      setCurrentIndex(0)
    } catch {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [contactId])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? tasks.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === tasks.length - 1 ? 0 : prev + 1))
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2 bg-muted/40 rounded-lg border border-border/40 min-w-[180px] max-w-[280px]">
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        <span className="truncate">Carregando tarefas...</span>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground/70 px-3 py-2 bg-muted/30 rounded-lg border border-border/30 border-dashed min-w-[180px] max-w-[280px]">
        <ListTodo className="w-3.5 h-3.5 shrink-0 opacity-50" />
        <span className="truncate">Nenhuma tarefa para este contato.</span>
      </div>
    )
  }

  const task = tasks[currentIndex]
  const statusMeta = getStatusMeta(task.status)
  const priorityMeta = getPriorityMeta(task.priority)
  const StatusIcon = statusMeta.icon

  return (
    <div
      className="flex items-center gap-1.5 bg-muted/30 rounded-lg border border-border/40 min-w-[200px] max-w-[320px] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      onDragStart={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-6 shrink-0 rounded-none hover:bg-muted/60"
        onClick={goToPrev}
        disabled={tasks.length <= 1}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </Button>

      <div className="flex-1 min-w-0 py-1.5 flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn('text-[9px] px-1 py-0 border-0 h-4 leading-none', statusMeta.color)}
          >
            <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
            {statusMeta.label}
          </Badge>
          <Badge
            variant="outline"
            className={cn('text-[9px] px-1 py-0 border-0 h-4 leading-none', priorityMeta.color)}
          >
            {priorityMeta.label}
          </Badge>
        </div>
        <p
          className="text-xs font-medium text-foreground truncate leading-tight"
          title={task.title}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          {task.due_date ? (
            <>
              <CalendarDays className="w-3 h-3 shrink-0" />
              <span>{format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </>
          ) : (
            <span className="italic opacity-60">Sem data</span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-0.5 pr-1 shrink-0">
        {tasks.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-6 rounded-none hover:bg-muted/60"
            onClick={goToNext}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
        {tasks.length > 1 && (
          <span className="text-[9px] text-muted-foreground font-medium tabular-nums">
            {currentIndex + 1}/{tasks.length}
          </span>
        )}
      </div>
    </div>
  )
}
