import { Minhash, LshIndex } from 'minhash'
import difflib from 'difflib'
import { deserialize } from 'cemu-smm'
import * as ProgressBar from 'progress'

import { Database } from '../server/Database'
import { Course, CourseMap, CourseData, Matches } from '../models/Match'
import { Course as ServerCourse } from '../server/Course';

async function start () {
  const similarCourses: Matches = {}
  const lshIndex = new LshIndex()

  await Database.initialize()

  const courses: CourseMap = {}
  const courseList: Course[] = (await Database.filterCourses({}, { lastmodified: -1 }, 0, 1000000).toArray())

  for (const course of courseList) {
    courses[course._id] = course
  }

  await calculateHashes(courseList, courses, lshIndex)

  await compareCourses(courseList, courses, similarCourses, lshIndex)
  
  const matchesFound = countMatches(similarCourses)

  const canDelete: Course[] = []
  findDeletableCourses(canDelete, courses, similarCourses)

  deleteCourses(canDelete, courses, similarCourses, matchesFound)

  const matchesRemaining = await updateDatabase(similarCourses)

  console.log(`${matchesRemaining} similar courses remaining`)
}

async function calculateHashes (courseList: Course[], courses: CourseMap, lshIndex: LshIndex): Promise<void> {
  const progressBar = new ProgressBar('Calculating hashes (:current/:total) [:bar] :percent', { total: courseList.length })
  for (const course of courseList) {
    try {
      let hash: Minhash
      if (course.hash) {
        hash = course.hash
      } else {
        hash = await calculateHash(course, courses)
      }
      lshIndex.insert(course._id, hash)
    } catch (err) {
      console.error(err)
    } finally {
      progressBar.tick()
    }
  }
}

async function calculateHash (course: Course, courses: CourseMap): Promise<Minhash> {
  const hash = new Minhash()
  const courseData: CourseData = await deserialize((await Database.getCourseData(course._id))[0])
  for (const tile of courseData.tiles) {
    const tileString = tile.tileData.toString()
    hash.update(tileString)
  }
  courses[course._id].hash = hash
  Database.updateCourse(course._id, { hash })
  return hash
}

async function compareCourses(courseList: Course[], courses: CourseMap, similarCourses: Matches, lshIndex: LshIndex): Promise<void> {
  for (const courseId in courses) {
    similarCourses[courseId] = []
  }
  const alreadyAssignedCourseIds: string[] = []
  const progressBar = new ProgressBar('Comparing courses (:current/:total) [:bar] :percent', { total: courseList.length })
  for (const courseId in courses) {
    const course = courses[courseId]
    if (!course.hash) {
      throw new Error(`Hash for course with ID ${course._id} was not defined`)
    }
    const matches = lshIndex.query(course.hash)
    const sequenceMatcher = new difflib.SequenceMatcher(null, null, course.hash.hashbands)
    for (const matchId of matches) {
      if (courseId === matchId) continue
      if (alreadyAssignedCourseIds.includes(matchId)) continue
      const matchedCourse = courses[matchId]
      if (!matchedCourse.hash) {
        throw new Error(`Hash for course with ID ${course._id} was not defined`)
      }
      sequenceMatcher.setSeq1(matchedCourse.hash.hashbands)
      const sim = sequenceMatcher.ratio();
      if (sim < 0.1) continue
      similarCourses[courseId].push({ sim, courseId: matchedCourse._id })
      similarCourses[matchId].push({ sim, courseId: course._id })
    }
    alreadyAssignedCourseIds.push(courseId)
    progressBar.tick();
  }
}

function countMatches (similarCourses: Matches): number {
  let matchesFound = 0
  for (const courseId in similarCourses) {
    const similarCourse = similarCourses[courseId]
    if (similarCourse.length > 0) {
      matchesFound++
    }
  }
  console.log(`Found ${matchesFound} similar courses`)
  return matchesFound
}

function findDeletableCourses (canDelete: Course[], courses: CourseMap, similarCourses: Matches): void {
  for (const courseId in similarCourses) {
    const course = courses[courseId]
    for (const match of similarCourses[courseId]) {
      if (match.sim !== 1) continue
      const similarCourse = courses[match.courseId]
      if (course.uploaded > similarCourse.uploaded && course.lastmodified <= similarCourse.lastmodified) {
        canDelete.push(course)
        similarCourses[match.courseId] = similarCourses[match.courseId].filter(({ courseId }) => course._id !== courseId)
      }
    }
  }
}

function deleteCourses (canDelete: Course[], courses: CourseMap, similarCourses: Matches, matchesFound: number): void {
  const progressBar = new ProgressBar('Deleting duplicates (:current/:total) [:bar] :percent', { total: canDelete.length })
  for (const course of canDelete) {
    ServerCourse.delete(course._id)
    delete courses[course._id]
    delete similarCourses[course._id]
    progressBar.tick()
  }
  let matchesAfterDelete = 0
  for (const courseId in similarCourses) {
    const similarCourse = similarCourses[courseId]
    if (similarCourse.length > 0) {
      matchesAfterDelete++
    }
  }
  console.log(`Resolved ${matchesFound - matchesAfterDelete} conflicting courses by removing ${canDelete.length} duplicates`)
}

async function updateDatabase (similarCourses: Matches): Promise<number> {
  const dbProgressBar = new ProgressBar('Updating database (:current/:total) [:bar] :percent', { total: Object.keys(similarCourses).length })
  let matchesRemaining = 0
  for (const courseId in similarCourses) {
    const similarCourse = similarCourses[courseId]
    if (similarCourse.length > 0) {
      await Database.updateSimilarity(courseId, similarCourse)
      matchesRemaining++
    } else {
      await Database.deleteSimilarity(courseId)
    }
    dbProgressBar.tick()
  }
  return matchesRemaining
}

start()
