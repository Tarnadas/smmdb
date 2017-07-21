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
  setCoursesSelf, deleteCourseSelf, deleteCourseUploaded
} from '../../actions'
import {
  domain
} from '../../../static'
import CoursePanel from '../panels/CoursePanel'
import ProgressPanel from '../panels/ProgressPanel'
import UploadArea from '../areas/UploadArea'

const EnterAPIKeyArea = process.env.ELECTRON && require('../../../electron/components/areas/EnterAPIKeyArea').default

const UPDATE_OFFSET = 500
const LIMIT = 10
const STEP_LIMIT = 10

class UploadView extends React.PureComponent {
  constructor (props) {
    super(props)
    this.doUpdate = false
    this.fetchCourses = this.fetchCourses.bind(this)
    this.renderCourses = this.renderCourses.bind(this)
    this.onCourseDelete = this.onCourseDelete.bind(this)
    this.onCourseDeleteRecent = this.onCourseDeleteRecent.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }
  componentWillMount () {
    if (!this.props.accountData.get('id')) return;
    (async () => {
      await this.fetchCourses(this.props.accountData.get('apikey'))
    })()
  }
  componentWillReceiveProps (nextProps, nextContext) {
    if (nextProps.courses !== this.props.courses) this.doUpdate = false
    if (nextProps.accountData === this.props.accountData || !nextProps.accountData.get('id')) return
    this.doUpdate = false;
    (async () => {
      await this.fetchCourses(nextProps.accountData.get('apikey'))
    })()
  }
  async fetchCourses (apiKey, shouldConcat = false, limit = LIMIT, start = 0) {
    try {
      const courses = (await got(resolve(domain, `/api/getcourses?limit=${limit}&start=${start}`), {
        headers: {
          'Authorization': `APIKEY ${apiKey}`
        },
        json: true,
        useElectronNet: false
      })).body
      this.props.dispatch(setCoursesSelf(courses, shouldConcat))
    } catch (err) {
      console.error(err.response.body)
    }
  }
  /* renderCourses (courses, uploaded = false) {
    let self = this
    return Array.from((function * () {
      for (let i in courses) {
        const course = courses[i]
        if (course.eta != null) {
          yield (
            <ProgressPanel course={course} key={course.id} />
          )
        } else {
          yield (
            <CoursePanel canEdit isSelf uploaded={uploaded} course={course} apiKey={self.props.accountData.get('apikey')} id={i} key={course.id} onCourseDelete={uploaded ? self.onCourseDeleteRecent : self.onCourseDelete} />
          )
        }
      }
    })())
  } */
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
        if (course.eta != null) {
          yield (
            <ProgressPanel course={course} key={course.id} />
          )
        } else {
          let downloadedCourse
          let progress
          let saveId
          if (process.env.ELECTRON) {
            downloadedCourse = downloads.get(String(course.id))
            progress = currentDownloads.get(String(course.id))
            saveId = smmdb.getIn([String(course.id), 'saveId'])
          }
          yield (
            <CoursePanel key={course.id} canEdit isSelf course={course} downloadedCourse={downloadedCourse} progress={progress} saveId={saveId} apiKey={accountData.get('apikey')} id={i} onCourseDelete={onCourseDelete} />
          )
        }
      }
    })())
  }
  onCourseDelete (courseId) {
    this.props.dispatch(deleteCourseSelf(courseId))
  }
  onCourseDeleteRecent (courseId) {
    this.props.dispatch(deleteCourseUploaded(courseId))
  }
  handleScroll () {
    forceCheck()
    if (this.doUpdate) return
    const values = this.scrollBar.getValues()
    const shouldUpdate = values.scrollHeight - values.scrollTop - values.clientHeight < UPDATE_OFFSET
    if (shouldUpdate) {
      this.doUpdate = true;
      (async () => {
        await this.fetchCourses(this.props.accountData.get('apikey'), true, STEP_LIMIT, this.props.courses.size)
      })()
    }
  }
  render () {
    const screenSize = this.props.screenSize
    const accountData = this.props.accountData.toJS()
    const courses = this.props.courses.toJS()
    const uploads = this.props.uploads.toList().toJS()
    const uploadedCourses = this.props.uploadedCourses.toJS()
    const styles = {
      main: {
        display: screenSize === ScreenSize.LARGE ? 'flex' : 'flex',
        flexDirection: screenSize === ScreenSize.LARGE ? 'column' : 'column',
        alignItems: screenSize === ScreenSize.LARGE ? 'center' : 'center'
      },
      upload: {
        width: screenSize === ScreenSize.LARGE ? 'calc(100% - 260px)' : '100%',
        maxWidth: '926px',
        height: screenSize === ScreenSize.LARGE ? 'calc(100% - 40px)' : 'auto',
        overflow: 'hidden',
        zIndex: '10',
        marginTop: '40px',
        color: '#fff'
      },
      flex: {
        overflow: 'hidden',
        display: screenSize === ScreenSize.LARGE ? 'flex' : 'block',
        flexDirection: screenSize === ScreenSize.LARGE ? 'column' : ''
      },
      line: {
        height: '5px',
        backgroundColor: '#000',
        margin: '10px 0'
      }
    }
    const content =
      <div>
        {
          (uploadedCourses.length > 0 || uploads.length > 0) && (
          <div style={{height: 'auto', color: '#000', fontSize: '15px'}}>
            Recently uploaded:
            {
              this.renderCourses([...uploads, ...uploadedCourses], true)
            }
            <div style={styles.line} />
            All uploads:
          </div>
        )}
        {
          this.renderCourses(courses)
        }
      </div>
    return (
      <div style={styles.main}>
        <div style={styles.upload}>
          {
            accountData.id ? (
              <div style={styles.flex}>
                <UploadArea />
                {
                  screenSize === ScreenSize.LARGE ? (
                    <Scrollbars universal style={{height: '100%'}} onScroll={this.handleScroll} ref={input => { this.scrollBar = input }}>
                      { content }
                    </Scrollbars>
                  ) : (
                    content
                  )
                }
              </div>
            ) : (
              process.env.ELECTRON ? (
                <EnterAPIKeyArea />
              ) : (
                <div style={styles.flex}>You are not logged in</div>
              )
            )
          }
        </div>
      </div>
    )
  }
}
export default connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize']),
  accountData: state.getIn(['userData', 'accountData']),
  courses: state.getIn(['courseData', 'self']),
  uploads: state.get('uploads'),
  uploadedCourses: state.getIn(['courseData', 'uploaded']),
  downloads: state.getIn(['electron', 'appSaveData', 'downloads']),
  currentDownloads: state.getIn(['electron', 'currentDownloads']),
  smmdb: state.getIn(['electron', 'appSaveData', 'cemuSaveData', state.getIn(['electron', 'currentSave']), 'smmdb'])
}))(UploadView)
