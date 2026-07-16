export class TimeoutError extends Error {
  constructor(message = 'timeout') {
    super(message)
    this.name = 'TimeoutError'
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new TimeoutError()), ms)
    }),
  ])
}

export function isTimeoutError(error: unknown): boolean {
  return error instanceof TimeoutError
}
