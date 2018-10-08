declare module 'minhash' {
  export class Minhash {
    update: (val: string) => void
    hashbands: string
  }
  export class LshIndex {
    insert: (id: string, hash: Minhash) => void
    query: (hash: Minhash) => string[]
  }
}
