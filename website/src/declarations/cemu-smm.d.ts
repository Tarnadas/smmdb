declare module 'cemu-smm' {
  export const loadSave: (...args: any[]) => any
  export const decompress: (...args: any[]) => any
  export const deserialize: (...args: any[]) => any
  export const loadCourse: (...args: any[]) => any
}
