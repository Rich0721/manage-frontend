export interface RegisterFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export type RegisterFieldName = keyof RegisterFormValues

export type RegisterValidationErrors = Partial<
  Record<RegisterFieldName, string>
>

export interface RegisterRequestBody {
  header: {
    'Content-Type': 'application/json'
  }
  body: {
    info: {
      email: string
      username: string
      password: string
      confirmPassword: string
    }
  }
}

export interface RegisterSuccessResponse {
  header: {
    'Content-Type': string
    status: 'success'
    message: string
  }
  body: {
    info: {
      uid: string
      email: string
      username: string
    }
  }
}

export interface RegisterFailedResponse {
  header: {
    'Content-Type'?: string
    status: 'failed'
    message: string
  }
}

export type RegisterResult =
  | { status: 'success'; message: string }
  | { status: 'failed'; message: string }
