import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, CalendarDays, ListTodo } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Task } from '@/types/models'
import { getTasks } from '@/services/tasks'
import { getStatusMeta, getPriorityMeta } from '@/lib/task-meta'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ContactTaskCarouselProps {
  contactId: string
}

export function ContactTaskCarousel({ contactId }: ContactTaskCarouselProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTasks(`crm_contact_id = "${contactId}"`)
      setTasks(data)
      setCurrentIndex(0)
    } catch (err) {
      console.error('Failed to fetch contact tasks', err)
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
            Tarefas do Contato
          </h3>
        </div>
        <div className="bg-white/40 border border-border/50 rounded-2xl p-4">
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
          Tarefas do Contato
        </h3>
        <div className="bg-white/40 border border-border/50 rounded-2xl p-4">
          <div className="py-6 flex flex-col items-center justify-center text-center gap-2">
            <ListTodo className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhuma tarefa para este contato.</p>
          </div>
        </div>
      </div>
    )
  }

  const currentTask = tasks[currentIndex]
  const statusMeta = getStatusMeta(currentTask.status)
  const priorityMeta = getPriorityMeta(currentTask.priority)
  const StatusIcon = statusMeta.icon

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
          Tarefas do Contato
        </h3>
        <span className="text-xs text-muted-foreground">
          {currentIndex + 1} / {tasks.length}
        </span>
      </div>

      <div className="relative bg-white/40 border border-border/50 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={cn('text-[10px] border-0', statusMeta.color)}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusMeta.label}
              </Badge>
              <Badge variant="outline" className={cn('text-[10px] border-0', priorityMeta.color)}>
                {priorityMeta.label}
              </Badge>
            </div>

            <h4 className="font-medium text-sm text-foreground line-clamp-2 mb-2">
              {currentTask.title}
            </h4>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {currentTask.due_date ? (
                <>
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{format(new Date(currentTask.due_date), 'PPP', { locale: ptBR })}</span>
                </>
              ) : (
                <>
                  <CalendarDays className="w-3.5 h-3.5 opacity-50" />
                  <span className="italic opacity-70">Sem data</span>
                </>
              )}
            </div>

            {currentTask.status === 'concluida' && (
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Concluída</span>
              </div>
            )}
          </div>
        </div>

        {tasks.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={goToPrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              {tasks.map((_, idx) => (
                <button
                  key={idx}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all',
                    idx === currentIndex
                      ? 'bg-primary w-4'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50',
                  )}
                  onClick={() => setCurrentIndex(idx)}
                />
              ))}
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={goToNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
