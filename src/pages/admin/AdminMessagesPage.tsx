import { CheckCircle2, Mail, MailOpen, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ADMIN_PAGE_SIZE, useClientPagination } from '@/hooks/useClientPagination'
import { useTranslation } from '@/i18n/LanguageProvider'
import { cn } from '@/lib/utils'
import {
  deleteContactMessage,
  fetchContactMessages,
  updateContactMessageStatus,
} from '@/services/adminMessages'
import type { ContactMessage, ContactMessageStatus } from '@/types/admin'

const filters: Array<ContactMessageStatus | 'all'> = ['all', 'new', 'read', 'replied', 'spam']

export function AdminMessagesPage() {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [filter, setFilter] = useState<ContactMessageStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    document.title = `${t.admin.nav.messages} — ${t.admin.title}`
  }, [t])

  const loadMessages = async (status?: ContactMessageStatus) => {
    setIsLoading(true)
    const data = await fetchContactMessages(status)
    setMessages(data)
    setIsLoading(false)
  }

  useEffect(() => {
    void loadMessages(filter === 'all' ? undefined : filter)
  }, [filter])

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return messages
    return messages.filter(
      (message) =>
        message.name.toLowerCase().includes(query) ||
        message.email.toLowerCase().includes(query) ||
        message.message.toLowerCase().includes(query),
    )
  }, [messages, search])

  const { page, setPage, pageCount, pageItems, total, pageSize } = useClientPagination(
    filteredMessages,
    ADMIN_PAGE_SIZE,
  )

  const selected =
    filteredMessages.find((message) => message.id === selectedId) ??
    pageItems[0] ??
    null

  const handleStatusChange = async (id: string, status: ContactMessageStatus) => {
    const ok = await updateContactMessageStatus(id, status)
    if (!ok) {
      toast.error(t.admin.messages.updateError)
      return
    }
    toast.success(t.admin.messages.updateSuccess)
    await loadMessages(filter === 'all' ? undefined : filter)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return
    setIsDeleting(true)
    const ok = await deleteContactMessage(pendingDeleteId)
    setIsDeleting(false)

    if (!ok) {
      toast.error(t.admin.messages.deleteError)
      return
    }
    toast.success(t.admin.messages.deleteSuccess)
    if (selectedId === pendingDeleteId) setSelectedId(null)
    setPendingDeleteId(null)
    await loadMessages(filter === 'all' ? undefined : filter)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold sm:text-2xl">{t.admin.nav.messages}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.admin.messages.subtitle}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                filter === item
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {item === 'all' ? t.admin.messages.filters.all : t.admin.messages.status[item]}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.admin.messages.searchPlaceholder}
            className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : total === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          {t.admin.messages.empty}
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <Card className="overflow-hidden">
            <ul className="divide-y divide-border">
              {pageItems.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(message.id)}
                    className={cn(
                      'w-full px-4 py-4 text-left transition-colors hover:bg-muted/50',
                      selected?.id === message.id && 'bg-muted/70',
                    )}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{message.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{message.email}</p>
                      </div>
                      <StatusBadge status={message.status} />
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{message.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
            <AdminPagination
              page={page}
              pageCount={pageCount}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </Card>

          {selected && (
            <Card className="p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold">{selected.name}</h2>
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${t.admin.nav.messages}`)}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {selected.email}
                  </a>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <p className="mb-4 text-xs text-muted-foreground">
                {new Date(selected.createdAt).toLocaleString()} · {selected.locale.toUpperCase()}
              </p>

              <div className="mb-6 rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={`mailto:${selected.email}`}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border-2 border-primary/50 bg-transparent px-3 text-sm font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {t.admin.messages.actions.reply}
                </a>
                {selected.status !== 'read' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                    onClick={() => void handleStatusChange(selected.id, 'read')}
                  >
                    <MailOpen className="h-4 w-4" aria-hidden="true" />
                    {t.admin.messages.actions.markRead}
                  </Button>
                )}
                {selected.status !== 'replied' && (
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => void handleStatusChange(selected.id, 'replied')}
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    {t.admin.messages.actions.markReplied}
                  </Button>
                )}
                {selected.status !== 'spam' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleStatusChange(selected.id, 'spam')}
                  >
                    {t.admin.messages.actions.markSpam}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingDeleteId(selected.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  {t.admin.messages.delete}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      <ConfirmDeleteDialog
        open={Boolean(pendingDeleteId)}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
        description={t.admin.messages.confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
