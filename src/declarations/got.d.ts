declare module 'got' {
  const got: (url: string, options: any) => any
  export default got
  export const stream: { post: typeof got, get: typeof got }
}
