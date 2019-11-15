export interface Course2 {
  id: string
  owner: string
  uploader: string
  difficulty?: Difficulty
  lastModified: number
  uploaded: number
  course: {
    header: {
      title: string
      description: string
      game_style: GameStyle //eslint-disable-line
    }
  }
}

export interface Course2Duplicate {
  jaccard: number
  similarCourseId: string
  title: string
}

export enum Difficulty {
  Easy = 'easy',
  Normal = 'normal',
  Expert = 'expert',
  SuperExpert = 'superexpert'
}

export enum GameStyle {
  M1 = 'M1',
  M3 = 'M3',
  MW = 'MW',
  WU = 'WU'
}
