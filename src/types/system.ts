// Shared low-level types live here.
// Rule: if a type pattern is cross-cutting and not tied to one domain entity,
// define it here first and re-export it through src/types/index.ts.
export type EntityId = string
export type ISODateString = string

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | JsonArray
export interface JsonObject {
  [key: string]: JsonValue
}
export type JsonArray = JsonValue[]

// External JSON-like values must be normalized at boundaries before entering domain code.
export function isJsonObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & unknown

export type ApiSuccess<T> = {
  ok: true
  data: T
}

export type ApiFailure<E extends string = string> = {
  ok: false
  error: E
}

export type ApiResult<T, E extends string = string> = ApiSuccess<T> | ApiFailure<E>

export interface AppAsyncState {
  isLoading: boolean
  error: Nullable<string>
}

export interface FormActionState {
  error: Nullable<string>
}
