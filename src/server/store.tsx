import { initReducer } from '@/client/reducers'
import { setCourses, setCourses64, setStats } from '@/client/actions'
import { API } from './scripts/api'
import { Course } from './Course'
import { Account } from './Account'
import { Database } from './Database'

export async function generateStore () {
  await Database.initialize()
  const courses = await API.filterCourses(undefined, { limit: 10 })
  const courses64 = await API.filterCourses64(undefined, { limit: 16 })
  const stats = {
    courses: await Course.getCourseAmount(),
    accounts: await Account.getAccountAmount()
  }
  const store = initReducer(null, null)
  store.dispatch(
    setCourses(courses.map((course: any): any => course.toJSON()), false)
  )
  store.dispatch(
    setCourses64(courses64.map((course: any): any => course.toJSON()), false)
  )
  store.dispatch(setStats(stats))

  require('fs').writeFileSync('./store.js', 'export default store = ' + JSON.stringify(store.getState()), {
    encoding: 'utf8'
  })
}

generateStore()
