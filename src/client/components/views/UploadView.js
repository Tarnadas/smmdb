import React from 'react'
import {
  connect
} from 'react-redux'
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

const LIMIT = 10

class UploadView extends React.PureComponent {
  constructor (props) {
    super(props)
    this.fetchCourses = this.fetchCourses.bind(this)
    this.renderCourses = this.renderCourses.bind(this)
    this.onCourseDelete = this.onCourseDelete.bind(this)
    this.onCourseDeleteRecent = this.onCourseDeleteRecent.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }
  componentWillMount () {
    if (!this.props.accountData.get('id')) return;
    (async () => {
      await this.fetchCourses()
    })()
  }
  componentWillReceiveProps (nextProps, nextContext) {
    if (nextProps.accountData === this.props.accountData || !nextProps.accountData.get('id')) return;
    (async () => {
      await this.fetchCourses(false, LIMIT, 0, nextProps)
    })()
  }
  async fetchCourses (shouldConcat = false, limit = LIMIT, start = 0, props = this.props) {
    const accountData = props.accountData
    if (!accountData.get('id')) return
    try {
      const apiKey = accountData.get('apikey')
      const courses = (await got(resolve(domain, `/api/getcourses?uploader=${accountData.get('username')}&limit=${limit}&start=${start}`), {
        headers: {
          'Authorization': `APIKEY ${apiKey}`
        },
        json: true,
        useElectronNet: false
      })).body
      if (courses && courses.length > 0) {
        props.dispatch(setCoursesSelf(courses, shouldConcat))
      }
    } catch (err) {
      if (!err.response) {
        console.error(err.response.body)
      }
    }
  }
  renderCourses (courses, uploaded) {
    const accountData = this.props.accountData
    const onCourseDelete = uploaded ? this.onCourseDeleteRecent : this.onCourseDelete
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
            <CoursePanel key={course.id} canEdit isSelf uploaded={uploaded} course={course} downloadedCourse={downloadedCourse} progress={progress} saveId={saveId} apiKey={accountData.get('apikey')} id={i} onCourseDelete={onCourseDelete} />
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
  handleScroll (e) {
    this.props.shouldUpdate(e.target, this.fetchCourses)
  }
  render () {
    const screenSize = this.props.screenSize
    const accountData = this.props.accountData.toJS()
    const courses = this.props.courses.toJS()
    const uploads = this.props.uploads.toList().toJS()
    const uploadedCourses = this.props.uploadedCourses.toJS()
    const styles = {
      main: {
        display: screenSize >= ScreenSize.MEDIUM ? 'flex' : 'flex',
        flexDirection: screenSize >= ScreenSize.MEDIUM ? 'column' : 'column',
        alignItems: screenSize >= ScreenSize.MEDIUM ? 'center' : 'center'
      },
      upload: {
        maxWidth: '926px',
        overflowY: screenSize >= ScreenSize.MEDIUM ? 'scroll' : '',
        zIndex: '10',
        flex: '1',
        color: '#fff'
      },
      flex: {
        overflow: 'hidden',
        display: screenSize >= ScreenSize.MEDIUM ? 'flex' : 'block',
        flexDirection: screenSize >= ScreenSize.MEDIUM ? 'column' : '',
        height: 'auto'
      },
      line: {
        height: '5px',
        backgroundColor: '#000',
        margin: '10px 0'
      },
      text: {
        height: 'auto',
        display: 'block',
        top: '50%',
        transform: 'translateY(-50%)'
      }
    }
    const content =
      <div style={{height: 'auto'}}>
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
        <div style={styles.upload} id='scroll' onScroll={this.handleScroll}>
          {
            accountData.id ? (
              <div style={styles.flex}>
                <UploadArea />
                <div style={{height: 'auto'}}>
                  { content }
                </div>
              </div>
            ) : (
              process.env.ELECTRON ? (
                <EnterAPIKeyArea />
              ) : (
                <div style={styles.text}>You are not logged in</div>
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
