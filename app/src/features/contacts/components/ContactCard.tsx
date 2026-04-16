import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ContactForm } from './ContactForm'
import { useUpdateContact, useDeleteContact } from '../api/mutations'
import { usePermissions } from '@/hooks/usePermissions'
import type { Contact, ContactFormValues } from '../types'
import { Pencil, Trash2 } from 'lucide-react'

interface Props {
  contact: Contact | null
  open: boolean
  onClose: () => void
}

interface InfoRowProps {
  label: string
  value?: string | number | null
}

function InfoRow({ label, value }: InfoRowProps) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 min-w-36 shrink-0">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  )
}

export function ContactCard({ contact, open, onClose }: Props) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { can } = usePermissions()
  const update = useUpdateContact()
  const del = useDeleteContact()

  if (!contact) return null

  async function handleUpdate(values: ContactFormValues) {
    await update.mutateAsync({ id: contact!.id, values })
    setEditing(false)
  }

  async function handleDelete() {
    await del.mutateAsync(contact!.id)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { onClose(); setEditing(false) } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex-row items-start justify-between gap-2">
          <DialogTitle className="text-base">
            {contact.last_name} {contact.first_name}
          </DialogTitle>
          <div className="flex gap-1 shrink-0">
            {can('contacts', 'write') && (
              <Button variant="ghost" size="icon" onClick={() => setEditing(e => !e)} title="Редагувати">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {can('contacts', 'delete') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmDelete(true)}
                title="Видалити"
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {confirmDelete ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Видалити контакт <strong>{contact.last_name} {contact.first_name}</strong>? Це незворотна дія.
            </p>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDelete} disabled={del.isPending}>
                {del.isPending ? 'Видалення…' : 'Видалити'}
              </Button>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>Скасувати</Button>
            </div>
          </div>
        ) : editing ? (
          <ContactForm
            defaultValues={contact}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div className="space-y-5 pt-1">
            <section className="space-y-1.5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Контакти</h3>
              <InfoRow label="Телефон" value={contact.phone} />
              <InfoRow label="Viber" value={contact.viber} />
              <InfoRow label="Telegram" value={contact.telegram} />
              <InfoRow label="Закордонний тел." value={contact.foreign_phone} />
              <InfoRow label="Email" value={contact.email} />
            </section>

            <section className="space-y-1.5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Особисті дані</h3>
              <InfoRow label="Дата народження" value={contact.birthdate} />
              <InfoRow label="Вік" value={contact.age} />
              <InfoRow label="Країна" value={contact.candidate_country} />
              <InfoRow label="Сімейний стан" value={contact.civil_status} />
            </section>

            <section className="space-y-1.5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Документи</h3>
              <InfoRow label="Тип паспорта" value={contact.passport_type} />
              <InfoRow label="Номер паспорта" value={contact.passport_number} />
              <InfoRow label="Паспорт дійсний до" value={contact.passport_valid_to} />
              <InfoRow label="PESEL" value={contact.pesel} />
            </section>

            <section className="space-y-1.5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Адреса</h3>
              <InfoRow label="Країна" value={contact.addr_country} />
              <InfoRow label="Регіон" value={contact.addr_region} />
              <InfoRow label="Місто" value={contact.addr_city} />
              <InfoRow label="Вулиця" value={contact.addr_street} />
              <InfoRow label="Індекс" value={contact.addr_zip} />
            </section>

            <section className="space-y-1.5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Розміри</h3>
              <InfoRow label="Футболка" value={contact.size_shirt} />
              <InfoRow label="Штани" value={contact.size_pants} />
              <InfoRow label="Взуття" value={contact.size_shoes} />
              <InfoRow label="Зріст" value={contact.height ? `${contact.height} см` : null} />
            </section>

            {(contact.emergency_name || contact.emergency_phone) && (
              <section className="space-y-1.5">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Екстрений контакт</h3>
                <InfoRow label="ПІБ" value={contact.emergency_name} />
                <InfoRow label="Телефон" value={contact.emergency_phone} />
              </section>
            )}

            <p className="text-xs text-gray-600 pt-2">
              Додано: {new Date(contact.created_at).toLocaleString('uk-UA')}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
