import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { contactSchema, type ContactFormValues } from '../types'

interface Props {
  defaultValues?: Partial<ContactFormValues>
  onSubmit: (values: ContactFormValues) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

interface FieldProps {
  label: string
  name: keyof ContactFormValues
  type?: string
  register: ReturnType<typeof useForm<ContactFormValues>>['register']
  error?: string
}

function Field({ label, name, type = 'text', register, error }: FieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={type} {...register(name)} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function ContactForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Зберегти' }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: defaultValues ?? {},
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Основне */}
      <section>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Основне</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Прізвище *" name="last_name" register={register} error={errors.last_name?.message} />
          <Field label="Ім'я *" name="first_name" register={register} error={errors.first_name?.message} />
          <Field label="Телефон" name="phone" register={register} error={errors.phone?.message} />
          <Field label="Viber" name="viber" register={register} />
          <Field label="Telegram" name="telegram" register={register} />
          <Field label="Закордонний тел." name="foreign_phone" register={register} />
          <Field label="Email" name="email" type="email" register={register} error={errors.email?.message} />
          <Field label="Країна кандидата" name="candidate_country" register={register} />
        </div>
      </section>

      {/* Документи */}
      <section>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Документи</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Тип паспорта" name="passport_type" register={register} />
          <Field label="Номер паспорта" name="passport_number" register={register} />
          <Field label="Паспорт дійсний до" name="passport_valid_to" type="date" register={register} />
          <Field label="PESEL" name="pesel" register={register} />
          <Field label="Дата народження" name="birthdate" type="date" register={register} />
          <Field label="Вік" name="age" type="number" register={register} error={errors.age?.message} />
        </div>
      </section>

      {/* Адреса */}
      <section>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Адреса</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Країна" name="addr_country" register={register} />
          <Field label="Регіон" name="addr_region" register={register} />
          <Field label="Місто" name="addr_city" register={register} />
          <Field label="Вулиця" name="addr_street" register={register} />
          <Field label="Індекс" name="addr_zip" register={register} />
        </div>
      </section>

      {/* Розміри */}
      <section>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Розміри одягу</h3>
        <div className="grid grid-cols-4 gap-3">
          <Field label="Футболка" name="size_shirt" register={register} />
          <Field label="Штани" name="size_pants" register={register} />
          <Field label="Взуття" name="size_shoes" register={register} />
          <Field label="Зріст (см)" name="height" type="number" register={register} />
        </div>
      </section>

      {/* Екстрений контакт */}
      <section>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Екстрений контакт</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ПІБ" name="emergency_name" register={register} />
          <Field label="Телефон" name="emergency_phone" register={register} />
        </div>
      </section>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Скасувати
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Збереження…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
