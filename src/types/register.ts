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
  body: {
    info: {
      email: string
      userName: string
      password: string
      confirmPassword: string
    }
  }
}

export interface RegisterResponseHeaders {
  status?: 'success' | 'failed' | string
  message?: string
  Status?: 'Success' | 'Failed' | string
  Message?: string
  'Content-Type'?: string
}

export interface RegisterSuccessResponse {
  headers?: RegisterResponseHeaders
  header?: RegisterResponseHeaders
  body?: {
    info?: {
      uid?: string
      email?: string
      userName?: string
    }
  }
}

export interface RegisterFailedResponse {
  headers?: RegisterResponseHeaders
  header?: RegisterResponseHeaders
  body?: {
    info?: Record<string, unknown>
  }
}

export type RegisterResult =
  | { status: 'success'; message: string }
  | { status: 'failed'; message: string }
