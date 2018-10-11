declare module 'minhash' {
  export class Minhash {
    public update: (val: string) => void
    public hashbands: string
  }
  export class LshIndex {
    public insert: (id: string, hash: Minhash) => void
    public query: (hash: Minhash) => string[]
  }
}
