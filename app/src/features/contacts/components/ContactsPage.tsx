import { useState } from 'react'
import { useContacts } from '../api/queries'
import { useCreateContact } from '../api/mutations'
import { ContactsTable } from './ContactsTable'
import { ContactCard } from './ContactCard'
import { ContactForm } from './ContactForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProtectedField } from '@/components/protected/ProtectedField'
import type { Contact } from '../types'
import { Plus, Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

const PAGE_SIZE = 50

export function ContactsPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [creating, setCreating] = useState(false)

  const { data, isLoading } = useContacts({ search: debouncedSearch, page, pageSize: PAGE_SIZE })
  const createContact = useCreateContact()

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="Пошук за ПІБ або телефоном…"
            className="pl-8"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {data?.count ?? 0} контактів
          </span>
          <ProtectedField resource="contacts" action="write">
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Новий контакт
            </Button>
          </ProtectedField>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <ContactsTable
          data={data?.data ?? []}
          count={data?.count ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          loading={isLoading}
          onPageChange={setPage}
          onRowClick={setSelected}
        />
      </div>

      {/* Contact detail card */}
      <ContactCard
        contact={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />

      {/* Create contact dialog */}
      <Dialog open={creating} onOpenChange={v => { if (!v) setCreating(false) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Новий контакт</DialogTitle>
          </DialogHeader>
          <ContactForm
            onSubmit={async values => {
              await createContact.mutateAsync(values)
              setCreating(false)
            }}
            onCancel={() => setCreating(false)}
            submitLabel="Створити контакт"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
