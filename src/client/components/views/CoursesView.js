import React from 'react'
import {
  connect
} from 'react-redux'
import {
  Route, withRouter
} from 'react-router-dom'
import got from 'got'

import { resolve } from 'url'
import { stringify } from 'querystring'

import {
  ScreenSize
} from '../../reducers/mediaQuery'
import {
  setCourses, deleteCourse, resetFilter, resetOrder
} from '../../actions'
import {
  domain
} from '../../../static'

import AmazonPanel from '../panels/AmazonPanel'
import StatsPanel from '../panels/StatsPanel'
import CoursePanel from '../panels/CoursePanel'
import SideBarArea from '../areas/SideBarArea'
import FilterArea from '../areas/FilterArea'

const LIMIT = 10

class CoursesView extends React.PureComponent {
  constructor (props) {
    super(props)
    this.queryString = stringify(props.filter.toJS())
    this.fetchCourses = this.fetchCourses.bind(this)
    this.renderCourses = this.renderCourses.bind(this)
    this.onCourseDelete = this.onCourseDelete.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }
  componentWillMount () {
    this.props.dispatch(resetFilter())
    this.props.dispatch(resetOrder())
    if (!this.props.isServer) this.props.setFetchCourses(this.fetchCourses)
    this.fetchCourses()
  }
  componentWillReceiveProps (nextProps, nextContext) {
    if (nextProps.filter === this.props.filter && nextProps.order === this.props.order) return
    if (this.scroll) this.scroll.scrollTop = 0
    const order = nextProps.order.toJS()
    this.queryString = stringify(Object.assign({}, nextProps.filter.toJS(), {
      order: order.order,
      dir: order.dir ? 'asc' : 'desc'
    }))
    // this.scrollBar.scrollToTop(); // TODO
    this.fetchCourses()
  }
  async fetchCourses (shouldConcat = false, limit = LIMIT) {
    try {
      const apiKey = this.props.apiKey
      const courses = (await got(resolve(domain, `/api/getcourses?limit=${limit}&start=${shouldConcat ? this.props.courses.size : 0}${this.queryString ? `&${this.queryString}` : ''}`), Object.assign({
        json: true,
        rejectUnauthorized: false
      }, this.props.apiKey ? {
        headers: {
          'Authorization': `APIKEY ${this.props.apiKey}`
        }
      } : null))).body
      if (courses != null && apiKey === this.props.apiKey) {
        this.props.dispatch(setCourses(courses, shouldConcat))
      }
    } catch (err) {
      if (err.response) {
        console.error(err.response.body)
      } else {
        console.error(err)
      }
    }
  }
  renderCourses () {
    const accountData = this.props.accountData
    const courses = this.props.courses
    const reuploads = this.props.reuploads
    const imageFull = this.props.imageFull
    const imagePrev = this.props.imagePrev
    const onCourseDelete = this.onCourseDelete
    let downloads
    let currentDownloads
    let smmdb
    if (process.env.ELECTRON) {
      downloads = this.props.downloads
      currentDownloads = this.props.currentDownloads
      smmdb = this.props.smmdb
    }
    return Array.from((function * () {
      let i = 0
      for (let course of courses) {
        if ((i - 3) % 9 === 0) {
          yield (
            <AmazonPanel key={i} />
          )
        }
        const courseId = course.get('id')
        let downloadedCourse
        let progress
        let saveId
        if (process.env.ELECTRON) {
          downloadedCourse = downloads.get(String(course.get('id')))
          progress = currentDownloads.get(String(course.get('id')))
          saveId = smmdb.getIn([String(course.get('id')), 'saveId'])
        }
        yield (
          (accountData.get('id') && course.owner === accountData.get('id')) || accountData.get('permissions') === 1 ? (
            <CoursePanel key={courseId} canEdit course={course} downloadedCourse={downloadedCourse} progress={progress} reupload={reuploads.get(courseId)} imageFull={imageFull.get(courseId)} imagePrev={imagePrev.get(courseId)} saveId={saveId} apiKey={accountData.get('apikey')} id={i} onCourseDelete={onCourseDelete} />
          ) : (
            <CoursePanel key={courseId} course={course} downloadedCourse={downloadedCourse} progress={progress} reupload={reuploads.get(courseId)} imageFull={imageFull.get(courseId)} imagePrev={imagePrev.get(courseId)} saveId={saveId} apiKey={accountData.get('apikey')} id={i} />
          )
        )
        i++
      }
    })())
  }
  onCourseDelete (courseId) {
    this.props.dispatch(deleteCourse(courseId))
  }
  handleScroll (e) {
    this.props.shouldUpdate(e.target)
  }
  render () {
    const screenSize = this.props.screenSize
    const styles = {
      main: {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap'
      },
      content: {
        maxWidth: screenSize < ScreenSize.MEDIUM ? '100%' : '926px',
        maxHeight: 'calc(100% - 34px)',
        overflowY: screenSize >= ScreenSize.MEDIUM ? 'auto' : '',
        zIndex: '10',
        flex: '1'
      }
    }
    return (
      <div style={styles.main}>
        <StatsPanel />
        {
          screenSize >= ScreenSize.MEDIUM &&
          <SideBarArea />
        }
        <div style={styles.content} id='scroll' onScroll={this.handleScroll} ref={scroll => { this.scroll = scroll }}>
          {
            this.renderCourses()
          }
        </div>
        <Route path='/courses/filter' component={FilterArea} />
      </div>
    )
  }
}
export default withRouter(connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize']),
  courses: state.getIn(['courseData', 'main']),
  accountData: state.getIn(['userData', 'accountData']),
  downloads: state.getIn(['electron', 'appSaveData', 'downloads']),
  currentDownloads: state.getIn(['electron', 'currentDownloads']),
  filter: state.getIn(['filter', 'currentFilter']),
  order: state.get('order'),
  smmdb: state.getIn(['electron', 'appSaveData', 'cemuSaveData', state.getIn(['electron', 'currentSave']), 'smmdb']),
  apiKey: state.getIn(['userData', 'accountData', 'apikey']),
  imageFull: state.getIn(['image', 'full']),
  imagePrev: state.getIn(['image', 'prev']),
  reuploads: state.get('reuploads')
}))(CoursesView))
