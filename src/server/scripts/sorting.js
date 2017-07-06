import {
  courses
} from '../Course'

const coursesSorted = {}

let properties;
(() => {
  let sortDescDiff = (a, b) => {
    return b[1] - a[1]
  }
  let sortAscDiff = (a, b) => {
    return a[1] - b[1]
  }
  let sortDescCp = (a, b) => {
    if (a < b) {
      return -1
    }
    if (a > b) {
      return 1
    }
    return 0
  }
  let sortAscCp = (a, b) => {
    if (a > b) {
      return -1
    }
    if (a < b) {
      return 1
    }
    return 0
  }

  properties = [
    {
      name: 'lastmodified',
      sortDesc: sortDescDiff,
      sortAsc: sortAscDiff
    },
    {
      name: 'uploaded',
      sortDesc: sortDescDiff,
      sortAsc: sortAscDiff
    },
    {
      name: 'title',
      sortDesc: sortDescCp,
      sortAsc: sortAscCp
    },
    {
      name: 'stars',
      sortDesc: sortDescDiff,
      sortAsc: sortAscDiff
    },
    {
      name: 'downloads',
      sortDesc: sortDescDiff,
      sortAsc: sortAscDiff
    },
    {
      name: 'completed',
      sortDesc: sortDescDiff,
      sortAsc: sortAscDiff
    }
  ]
})()

export default class Sorting {
  static getCoursesBySorting (sorting, direction) {
    return coursesSorted[sorting][direction]
  }

  static sortCourses () {
    for (let i = 0; i < properties.length; i++) {
      let property = properties[i]
      let sortable = []
      for (let key in courses) {
        if (courses.hasOwnProperty(key)) {
          sortable.push([courses[key], courses[key][property.name]])
        }
      }
      coursesSorted[property.name] = {
        desc: [],
        asc: []
      }

      sortable.sort(property.sortDesc)
      for (let i = 0; i < sortable.length; i++) {
        coursesSorted[property.name].desc.push(sortable[i][0])
      }

      sortable.sort(property.sortAsc)
      for (let i = 0; i < sortable.length; i++) {
        coursesSorted[property.name].asc.push(sortable[i][0])
      }
    }
  }

  static insertCourse (course) {
    let index = 0
    let upper = []
    let lower = []
    let current = coursesSorted.title.desc
    let iterations = 0
    const maxIterations = 1000
    while (iterations < maxIterations) {
      iterations++
      if (current.length === 1) {
        if (course.title > current[0].title) {
          index++
        }
        break
      }
      let middle = Math.trunc((current.length - 1) / 2) + 1
      upper = current.slice(0, middle)
      lower = current.slice(middle, current.length)
      if (course.title < current[middle].title) {
        current = upper
      } else {
        current = lower
        index += middle
      }
    }
    coursesSorted.title.desc.splice(index, 0, course)

    index = 0
    current = coursesSorted.title.asc
    iterations = 0
    while (iterations < maxIterations) {
      iterations++
      if (current.length === 1) {
        if (course.title < current[0].title) {
          index++
        }
        break
      }
      let middle = Math.trunc((current.length - 1) / 2) + 1
      upper = current.slice(0, middle)
      lower = current.slice(middle, current.length)
      if (course.title > current[middle].title) {
        current = upper
      } else {
        current = lower
        index += middle
      }
    }
    coursesSorted.title.asc.splice(index, 0, course)

    index = 0
    current = coursesSorted.lastmodified.desc
    iterations = 0
    while (iterations < maxIterations) {
      iterations++
      if (current.length === 1) {
        if (course.lastmodified < current[0].lastmodified) {
          index++
        }
        break
      }
      let middle = Math.trunc((current.length - 1) / 2) + 1
      upper = current.slice(0, middle)
      lower = current.slice(middle, current.length)
      if (course.lastmodified > current[middle].lastmodified) {
        current = upper
      } else {
        current = lower
        index += middle
      }
    }
    coursesSorted.lastmodified.desc.splice(index, 0, course)

    index = 0
    current = coursesSorted.lastmodified.asc
    iterations = 0
    while (iterations < maxIterations) {
      iterations++
      if (current.length === 1) {
        if (course.lastmodified < current[0].lastmodified) {
          index++
        }
        break
      }
      let middle = Math.trunc((current.length - 1) / 2) + 1
      upper = current.slice(0, middle)
      lower = current.slice(middle, current.length)
      if (course.lastmodified > current[middle].lastmodified) {
        current = upper
      } else {
        current = lower
        index += middle
      }
    }
    coursesSorted.lastmodified.asc.splice(index, 0, course)

    // coursesSorted.lastmodified.desc.splice(0, 0, course);
    // coursesSorted.lastmodified.asc.push(course);

    coursesSorted.uploaded.desc.splice(0, 0, course)
    coursesSorted.uploaded.asc.push(course)

    coursesSorted.stars.desc.push(course)
    coursesSorted.stars.asc.splice(0, 0, course)

    coursesSorted.downloads.desc.push(course)
    coursesSorted.downloads.asc.splice(0, 0, course)

    coursesSorted.completed.desc.push(course)
    coursesSorted.completed.asc.splice(0, 0, course)
  }

  static sortCourse (courseId) {
    let course = courses[courseId]
    let index = 0
    let prevIndex = 0
    let upper = []
    let lower = []
    let current = coursesSorted.title.desc
    for (let i = 0; i < current.length; i++) {
      if (current[i].id === courseId) {
        prevIndex = i
        break
      }
    }
    current.splice(prevIndex, 1)
    let iterations = 0
    let maxIterations = 1000
    while (iterations < maxIterations) {
      iterations++
      if (current.length === 1) {
        if (course.title > current[0].title) {
          index++
        }
        break
      }
      let middle = Math.trunc((current.length - 1) / 2) + 1
      upper = current.slice(0, middle)
      lower = current.slice(middle, current.length)
      if (course.title < current[middle].title) {
        current = upper
      } else {
        current = lower
        index += middle
      }
    }
    coursesSorted.title.desc.splice(index, 0, course)

    index = 0; prevIndex = 0
    current = coursesSorted.title.asc
    for (let i = 0; i < current.length; i++) {
      if (current[i].id === courseId) {
        prevIndex = i
        break
      }
    }
    current.splice(prevIndex, 1)
    iterations = 0
    while (iterations < maxIterations) {
      iterations++
      if (current.length === 1) {
        if (course.title < current[0].title) {
          index++
        }
        break
      }
      let middle = Math.trunc((current.length - 1) / 2) + 1
      upper = current.slice(0, middle)
      lower = current.slice(middle, current.length)
      if (course.title > current[middle].title) {
        current = upper
      } else {
        current = lower
        index += middle
      }
    }
    coursesSorted.title.asc.splice(index, 0, course)

    this.updateCourse(courseId)
  }

  static updateCourse (courseId) {
    let course = courses[courseId]
    let prevIndex = 0
    let current = coursesSorted.lastmodified.desc
    for (let i = 0; i < current.length; i++) {
      if (current[i].id === courseId) {
        prevIndex = i
        break
      }
    }
    current.splice(prevIndex, 1)
    current.splice(0, 0, course)

    prevIndex = 0
    current = coursesSorted.lastmodified.asc
    for (let i = 0; i < current.length; i++) {
      if (current[i].id === courseId) {
        prevIndex = i
        break
      }
    }
    current.splice(prevIndex, 1)
    current.push(course)
  }

  static deleteCourse (courseId) {
    let directions = [ 'desc', 'asc' ]
    for (let i = 0; i < properties.length; i++) {
      let property = properties[i].name
      for (let j = 0; j < directions.length; j++) {
        const direction = directions[j]
        let prevIndex = 0
        let current = coursesSorted[property][direction]
        for (let i = 0; i < current.length; i++) {
          if (current[i]._id === courseId) {
            prevIndex = i
            break
          }
        }
        current.splice(prevIndex, 1)
      }
    }
  }

  static starCourse (courseId) {
    let course = courses[courseId]
    let index = 0
    let prevIndex = 0
    let current = coursesSorted.stars.desc
    for (let i = 0; i < current.length; i++) {
      if (current[i].id === courseId) {
        prevIndex = i
        break
      }
    }
    current.splice(prevIndex, 1)
    for (let i = prevIndex - 1; i > 0; i--) {
      if (current[i].stars >= course.stars) {
        index = i
        break
      }
    }
    current.splice(index, 0, course)

    index = 0; prevIndex = 0
    current = coursesSorted.stars.asc
    for (let i = 0; i < current.length; i++) {
      if (current[i].id === courseId) {
        prevIndex = i
        break
      }
    }
    current.splice(prevIndex, 1)
    for (let i = prevIndex; i < current.length; i++) {
      if (current[i].stars <= course.stars) {
        index = i
        break
      }
    }
    current.splice(index, 0, course)
  }

  static unstarCourse (courseId) {
    let course = courses[courseId]
    let index
    let prevIndex = 0
    let current = coursesSorted.stars.desc
    for (let i = 0; i < current.length; i++) {
      if (current[i].id === courseId) {
        prevIndex = i
        break
      }
    }
    current.splice(prevIndex, 1)
    index = current.length
    for (let i = 0; i < current.length; i++) {
      if (current[i].stars <= course.stars) {
        index = i
        break
      }
    }
    current.splice(index, 0, course)

    index = 0; prevIndex = 0
    current = coursesSorted.stars.asc
    for (let i = 0; i < current.length; i++) {
      if (current[i].id === courseId) {
        prevIndex = i
        break
      }
    }
    current.splice(prevIndex, 1)
    for (let i = prevIndex; i < current.length; i++) {
      if (current[i].stars >= course.stars) {
        index = i
        break
      }
    }
    current.splice(index, 0, course)
  }

  static completeCourse (courseId) {
    let course = courses[courseId]
    let index = 0
    let prevIndex = 0
    let current = coursesSorted.completed.desc
    for (let i = 0; i < current.length; i++) {
      if (current[i].id === courseId) {
        prevIndex = i
        break
      }
    }
    current.splice(prevIndex, 1)
    for (let i = prevIndex - 1; i > 0; i--) {
      if (current[i].completed >= course.completed) {
        index = i
        break
      }
    }
    current.splice(index, 0, course)

    index = 0; prevIndex = 0
    current = coursesSorted.completed.asc
    for (let i = 0; i < current.length; i++) {
      if (current[i].id === courseId) {
        prevIndex = i
        break
      }
    }
    current.splice(prevIndex, 1)
    for (let i = prevIndex; i < current.length; i++) {
      if (current[i].completed <= course.completed) {
        index = i
        break
      }
    }
    current.splice(index, 0, course)
  }

  static uncompleteCourse (courseId) {
    let course = courses[courseId]
    let index
    let prevIndex = 0
    let current = coursesSorted.completed.desc
    for (let i = 0; i < current.length; i++) {
      if (current[i].id === courseId) {
        prevIndex = i
        break
      }
    }
    current.splice(prevIndex, 1)
    index = current.length
    for (let i = 0; i < current.length; i++) {
      if (current[i].completed <= course.completed) {
        index = i
        break
      }
    }
    current.splice(index, 0, course)

    index = 0; prevIndex = 0
    current = coursesSorted.completed.asc
    for (let i = 0; i < current.length; i++) {
      if (current[i].id === courseId) {
        prevIndex = i
        break
      }
    }
    current.splice(prevIndex, 1)
    for (let i = prevIndex; i < current.length; i++) {
      if (current[i].completed >= course.completed) {
        index = i
        break
      }
    }
    current.splice(index, 0, course)
  }

  static downloadCourse (courseId) {
    let course = courses[courseId]
    let index = 0
    let prevIndex = 0
    let current = coursesSorted.downloads.desc
    for (let i = 0; i < current.length; i++) {
      if (current[i].id === courseId) {
        prevIndex = i
        break
      }
    }
    current.splice(prevIndex, 1)
    for (let i = prevIndex - 1; i > 0; i--) {
      if (current[i].downloads >= course.downloads) {
        index = i
        break
      }
    }
    current.splice(index, 0, course)

    index = 0; prevIndex = 0
    current = coursesSorted.downloads.asc
    for (let i = 0; i < current.length; i++) {
      if (current[i].id === courseId) {
        prevIndex = i
        break
      }
    }
    current.splice(prevIndex, 1)
    for (let i = prevIndex; i < current.length; i++) {
      if (current[i].downloads <= course.downloads) {
        index = i
        break
      }
    }
    current.splice(index, 0, course)
  }
}
