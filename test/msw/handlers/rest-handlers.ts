import { http } from 'msw'

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const defaultPostMswHandler = http.post('http://127.0.0.1:8555/', () => {})