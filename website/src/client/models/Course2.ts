export interface Course2 {
  id: string
  owner: string
  uploader: string
  difficulty?: Difficulty2
  lastModified: number
  uploaded: number
  course: {
    header: {
      title: string
      description: string
      game_style: GameStyle2 //eslint-disable-line
    }
    course_area: { //eslint-disable-line
      course_theme: CourseTheme2 //eslint-disable-line
    }
    course_sub_area: { //eslint-disable-line
      course_theme: CourseTheme2 //eslint-disable-line
    }
  }
}

export interface Course2Duplicate {
  jaccard: number
  similarCourseId: string
  title: string
}

export enum Difficulty2 {
  Easy = 'easy',
  Normal = 'normal',
  Expert = 'expert',
  SuperExpert = 'superexpert'
}

export enum GameStyle2 {
  M1 = 'Super Mario Bros',
  M3 = 'Super Mario Bros 3',
  MW = 'Super Mario World',
  WU = 'New Super Mario Bros U',
  W3 = 'Super Mario 3D World'
}

export enum CourseTheme2 {
  GROUND = 'Ground',
  UNDERGROUND = 'Underground',
  CASTLE = 'Castle',
  AIRSHIP = 'Airship',
  UNDERWATER = 'Underwater',
  GHOUST_HOUSE = 'Ghost House',
  SNOW = 'Snow',
  DESERT = 'Desert',
  SKY = 'Sky',
  FOREST = 'Forest'
}

export enum AutoScroll2 {
  NONE = 'None',
  SLOW = 'Slow',
  MEDIUM = 'Medium',
  FAST = 'Fast',
  CUSTOM = 'Custom'
}

export interface Filter2 {
  title: string
  uploader: string
  lastmodifiedfrom: number | null
  lastmodifiedto: number | null
  uploadedfrom: number | null
  uploadedto: number | null
  difficulty: Difficulty2
  gamestyle: GameStyle2
  coursetheme: CourseTheme2
  coursethemesub: CourseTheme2
  autoscroll: AutoScroll2
}
