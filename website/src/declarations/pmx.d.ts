declare module 'pmx' {
  const pmx: {
    probe: () => {
      meter: (arg: {}) => {
        mark: () => void
      }
    }
  }
  export default pmx
}
