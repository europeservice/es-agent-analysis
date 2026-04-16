import { ProtectedField } from '@/components/protected/ProtectedField'

export function PaymentsPage() {
  return (
    <ProtectedField resource="payments" action="read" fallback={
      <div className="p-6">
        <p className="text-red-400 text-sm">Доступ заборонено</p>
      </div>
    }>
      <div className="p-6">
        <h1 className="text-lg font-semibold text-white mb-4">Фінанси</h1>
        <p className="text-gray-500 text-sm">В розробці…</p>
      </div>
    </ProtectedField>
  )
}
