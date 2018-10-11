import { Minhash } from 'minhash'

export type Course = {
  _id: string
  title: string
  maker: string
  nintendoid: string | null
  difficulty: number
  gameStyle: number
  courseTheme: number
  courseThemeSub: number
  time: number
  autoScroll: number
  autoScrollSub: number
  width: number
  widthSub: number
  uploaded: number
  lastmodified: number
  hash?: Minhash
}

export type CourseMap = { [key: string]: Course }

export type CourseData = {
  tiles: Array<{ tileData: Buffer }>
}

export type Match = {
  courseId: string
  sim: number
}

export type Matches = { [key: string]: Match[]}
