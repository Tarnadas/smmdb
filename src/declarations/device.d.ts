declare module 'device' {
  const device: (arg: any) => {
    is: (arg: string) => boolean
  }
  export default device
}
