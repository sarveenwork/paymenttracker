export interface Grade {
  id: number
  grade_name: string
  grade_level: string
  created_at: string
}

export interface Class {
  id: number
  class_name: string
  created_at: string
}

export interface Student {
  id: string
  student_id: string
  tm_number: string
  ic_number: string
  name: string
  current_grade_id: number
  class_id: number
  remarks?: string
  is_active: boolean
  created_at: string
  updated_at: string
  grades?: Grade
  classes?: Class
}

export interface PaymentRecord {
  id: string
  student_id: string
  year: number
  month: number // 0 = renewal payment, 1-12 = monthly payments
  payment_date?: string
  created_at: string
  updated_at: string
}

export interface Admin {
  id: string
  username: string
  password_hash: string
  name: string
  created_at: string
}

export interface StudentWithPayments extends Student {
  payment_records: PaymentRecord[]
}

export interface MonthlyPayment {
  month: number
  monthName: string
  payment_date?: string
  isPaid: boolean
}
