export interface LoginFormValues {
  email: string
  password: string
}

export type LoginFieldName = keyof LoginFormValues
export type LoginValidationErrors = Partial<Record<LoginFieldName, string>>

export interface AuthSession {
  uid: string
  authorization: string
  userName: string
}

export interface LoginRequestBody {
  body: {
    info: {
      email: string
      password: string
      isForceLogin: boolean
    }
  }
}

export interface Product {
  id: string
  name: string
  label_names: string
  cost: number
  price: number
}
