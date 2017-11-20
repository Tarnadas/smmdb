import React from 'react'
import { connect } from 'react-redux'
import got from 'got'

import { resolve } from 'url'

import { ScreenSize } from '../../reducers/mediaQuery'
import { setCoursesSelf, deleteCourseSelf, deleteCourseUploaded } from '../../actions'
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
    if (!this.props.isServer) this.props.setFetchCourses(this.fetchCourses)
    if (this.props.accountData.get('id')) {
      this.fetchCourses()
    }
  }
  componentWillReceiveProps (nextProps, nextContext) {
    if (nextProps.accountData === this.props.accountData || !nextProps.accountData.get('id')) return;
    (async () => {
      await this.fetchCourses(false, LIMIT, nextProps)
    })()
  }
  async fetchCourses (shouldConcat = false, limit = LIMIT, props = this.props) {
    const accountData = props.accountData
    if (!accountData.get('id')) return
    try {
      const apiKey = accountData.get('apikey')
      const courses = (await got(resolve(process.env.DOMAIN, `/api/getcourses?uploader=${accountData.get('username')}&limit=${limit}&start=${shouldConcat ? this.props.courses.size : 0}`), {
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
      if (err.response) {
        console.error(err.response.body)
      } else {
        console.error(err)
      }
    }
  }
  renderCourses (uploaded) {
    const courses = uploaded ? this.props.uploads.toList().merge(this.props.uploadedCourses) : this.props.courses
    const reuploads = this.props.reuploads
    const imageFull = this.props.imageFull
    const imagePrev = this.props.imagePrev
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
      let i = 0
      for (let course of courses) {
        const courseId = course.get('id')
        if (course.get('eta') != null) {
          yield (
            <ProgressPanel course={course} key={courseId} />
          )
        } else {
          let downloadedCourse
          let progress
          let saveId
          if (process.env.ELECTRON) {
            downloadedCourse = downloads.get(String(courseId))
            progress = currentDownloads.get(String(courseId))
            saveId = smmdb.getIn([String(courseId), 'saveId'])
          }
          yield (
            <CoursePanel
              key={courseId} canEdit isSelf
              uploaded={uploaded} course={course} downloadedCourse={downloadedCourse}
              progress={progress} reupload={reuploads.get(courseId)}
              imageFull={imageFull.get(courseId)} imagePrev={imagePrev.get(courseId)}
              saveId={saveId} apiKey={accountData.get('apikey')}
              id={i} onCourseDelete={onCourseDelete}
            />
          )
        }
        i++
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
    this.props.shouldUpdate(e.target)
  }
  render () {
    const screenSize = this.props.screenSize
    const accountData = this.props.accountData.toJS()
    const uploads = this.props.uploads.toList().toJS()
    const uploadedCourses = this.props.uploadedCourses.toJS()
    const styles = {
      main: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      },
      upload: {
        maxWidth: screenSize < ScreenSize.MEDIUM ? '100%' : '926px',
        overflowY: screenSize >= ScreenSize.MEDIUM ? 'auto' : '',
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
      <div style={{width: '100%'}}>
        {
          (uploadedCourses.length > 0 || uploads.length > 0) && (
          <div style={{color: '#000', fontSize: '15px'}}>
            Recently uploaded:
            {
              this.renderCourses(true)
            }
            <div style={styles.line} />
            All uploads:
          </div>
        )}
        {
          this.renderCourses()
        }
      </div>
    return (
      <div style={styles.main}>
        <div style={styles.upload} id='scroll' onScroll={this.handleScroll}>
          {
            accountData.id ? (
              <div style={styles.flex}>
                <UploadArea />
                <div style={{width: '100%'}}>
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
  smmdb: state.getIn(['electron', 'appSaveData', 'cemuSaveData', state.getIn(['electron', 'currentSave']), 'smmdb']),
  imageFull: state.getIn(['image', 'full']),
  imagePrev: state.getIn(['image', 'prev']),
  reuploads: state.get('reuploads')
}))(UploadView)
