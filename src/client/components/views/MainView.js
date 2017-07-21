import React from 'react'
import {
  connect
} from 'react-redux'
import {
  Scrollbars
} from 'react-custom-scrollbars'
import { forceCheck } from 'react-lazyload'
import got from 'got'

import { resolve } from 'url'

import {
  ScreenSize
} from '../../reducers/mediaQuery'
import {
  setCourses, deleteCourse
} from '../../actions'
import {
  domain
} from '../../../static'
import StatsPanel from '../panels/StatsPanel'
import CoursePanel from '../panels/CoursePanel'
import SideBarArea from '../areas/SideBarArea'

class MainView extends React.PureComponent {
  constructor (props) {
    super(props)
    this.fetchCourses = this.fetchCourses.bind(this)
    this.renderCourses = this.renderCourses.bind(this)
    this.onCourseDelete = this.onCourseDelete.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }
  componentWillMount () {
    (async () => {
      await this.fetchCourses()
    })()
  }
  componentWillReceiveProps (nextProps, nextContext) {
    if (nextProps.filter === this.props.filter) return
    this.scrollBar.scrollToTop()
  }
  async fetchCourses () {
    try {
      const apiKey = this.props.accountData.get('apikey')
      const courses = (await got(resolve(domain, `/api/getcourses?limit=10`), Object.assign({
        json: true,
        useElectronNet: false
      }, apiKey ? {
        headers: {
          'Authorization': `APIKEY ${apiKey}`
        }
      } : null))).body
      this.props.dispatch(setCourses(courses, false))
    } catch (err) {
      if (err.response) {
        console.error(err.response.body)
      } else {
        console.error(err)
      }
    }
  }
  renderCourses (courses) {
    const accountData = this.props.accountData
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
      for (let i in courses) {
        const course = courses[i]
        let downloadedCourse
        let progress
        let saveId
        if (process.env.ELECTRON) {
          downloadedCourse = downloads.get(String(course.id))
          progress = currentDownloads.get(String(course.id))
          saveId = smmdb.getIn([String(course.id), 'saveId'])
        }
        yield (
          accountData.get('id') && course.owner === accountData.get('id') ? (
            <CoursePanel key={course.id} canEdit course={course} downloadedCourse={downloadedCourse} progress={progress} saveId={saveId} apiKey={accountData.get('apikey')} id={i} onCourseDelete={onCourseDelete} />
          ) : (
            <CoursePanel key={course.id} course={course} downloadedCourse={downloadedCourse} progress={progress} saveId={saveId} />
          )
        )
      }
    })())
  }
  onCourseDelete (courseId) {
    this.props.dispatch(deleteCourse(courseId))
  }
  handleScroll () {
    forceCheck()
    this.props.shouldUpdate(this.scrollBar.getValues())
  }
  render () {
    const screenSize = this.props.screenSize
    const courses = this.props.courses.toJS()
    const styles = {
      main: {
        display: screenSize === ScreenSize.LARGE ? 'flex' : 'flex',
        flexDirection: screenSize === ScreenSize.LARGE ? 'column' : 'column',
        alignItems: screenSize === ScreenSize.LARGE ? 'center' : 'center'
      },
      content: {
        width: screenSize === ScreenSize.LARGE ? 'calc(100% - 260px)' : '100%',
        maxWidth: '926px',
        height: screenSize === ScreenSize.LARGE ? 'calc(100% - 40px)' : 'auto',
        overflow: 'hidden',
        zIndex: '10',
        marginTop: '40px'
      }
    }
    return (
      <div style={styles.main}>
        <StatsPanel />
        {
          screenSize === ScreenSize.LARGE && <SideBarArea />
        }
        <div style={styles.content}>
          <div>
            {
              screenSize === ScreenSize.LARGE ? (
                <Scrollbars universal style={{height: '100%'}} onScroll={this.handleScroll} ref={input => { this.scrollBar = input }}>
                  {
                    this.renderCourses(courses)
                  }
                </Scrollbars>
              ) : (
                this.renderCourses(courses)
              )
            }
          </div>
        </div>
      </div>
    )
  }
}
export default connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize']),
  courses: state.getIn(['courseData', 'main']),
  filter: state.getIn(['filter', 'currentFilter']),
  accountData: state.getIn(['userData', 'accountData']),
  downloads: state.getIn(['electron', 'appSaveData', 'downloads']),
  currentDownloads: state.getIn(['electron', 'currentDownloads']),
  smmdb: state.getIn(['electron', 'appSaveData', 'cemuSaveData', state.getIn(['electron', 'currentSave']), 'smmdb'])
}))(MainView)
