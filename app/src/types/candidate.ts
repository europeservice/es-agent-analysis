export interface Candidate {
  id: string
  branch: string | null
  responsible: string | null
  payment_type: string | null
  registration_date: string | null
  first_name: string
  last_name: string
  phone: string | null
  age: number | null
  candidate_country: string | null
  vacancy_country: string | null
  project_name: string | null
  partner_number: string | null
  arrival_date: string | null
  transport: string | null
  synchronizer: string | null
  status_adm: string
  quality_submission: boolean | null
  payment_amount: number | null
  payment_status: string
  bitrix_deal_id: string | null
  created_at: string
  updated_at: string
}

export type CandidateInsert = Omit<Candidate, 'id' | 'created_at' | 'updated_at'>
export type CandidateUpdate = Partial<CandidateInsert>
