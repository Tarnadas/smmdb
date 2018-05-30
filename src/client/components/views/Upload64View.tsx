import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'

import { resolve } from 'url'

import { ScreenSize } from '../../reducers/mediaQuery'
import { setCoursesSelf64, deleteCourseSelf64, deleteCourseUploaded64 } from '../../actions'
import { Course64Panel } from '../panels/Course64Panel'
import { ProgressPanel } from '../panels/ProgressPanel'
import { UploadArea } from '../areas/UploadArea'

const LIMIT = 10

class Upload64View extends React.PureComponent<any, any> {
  constructor (props: any) {
    super(props)
    this.fetchCourses = this.fetchCourses.bind(this)
    this.renderCourses = this.renderCourses.bind(this)
    this.onCourseDelete = this.onCourseDelete.bind(this)
    this.onCourseDeleteRecent = this.onCourseDeleteRecent.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }
  componentWillMount () {
    if (process.env.IS_SERVER) return
    this.props.setFetchCourses(this.fetchCourses)
    if (this.props.accountData.get('id')) {
      this.fetchCourses()
    }
  }
  componentWillReceiveProps (nextProps: any) {
    if (nextProps.accountData === this.props.accountData || !nextProps.accountData.get('id')) return
    this.fetchCourses(false, LIMIT, nextProps)
  }
  async fetchCourses (shouldConcat = false, limit = LIMIT, props = this.props) {
    const accountData = props.accountData
    if (!accountData.get('id')) return
    try {
      const apiKey = accountData.get('apikey')
      const response = await fetch(resolve(process.env.DOMAIN!, `/api/getcourses64?uploader=${accountData.get('username')}&limit=${limit}&start=${shouldConcat ? this.props.courses.size : 0}`), {
        headers: {
          'Authorization': `APIKEY ${apiKey}`
        }
      })
      if (!response.ok) throw new Error(response.statusText)
      const courses = await response.json()
      if (courses && courses.length > 0) {
        props.dispatch(setCoursesSelf64(courses, shouldConcat))
      }
    } catch (err) {
      console.error(err)
    }
  }
  renderCourses (uploaded = false) {
    const courses = uploaded ? this.props.uploads.toList().merge(this.props.uploadedCourses) : this.props.courses
    const accountData = this.props.accountData
    const onCourseDelete = uploaded ? this.onCourseDeleteRecent : this.onCourseDelete
    return Array.from((function * () {
      let i = 0
      for (let course of courses) {
        const courseId = course.get('id')
        if (course.get('eta') != null) {
          yield (
            <ProgressPanel course={course} key={courseId} />
          )
        } else {
          yield (
            <Course64Panel
              key={courseId}
              canEdit isSelf uploaded={uploaded} course={course}
              apiKey={accountData.get('apikey')} id={i} onCourseDelete={onCourseDelete}
            />
          )
        }
        i++
      }
    })())
  }
  onCourseDelete (courseId: any) {
    this.props.dispatch(deleteCourseSelf64(courseId))
  }
  onCourseDeleteRecent (courseId: any) {
    this.props.dispatch(deleteCourseUploaded64(courseId))
  }
  handleScroll (e: any) {
    this.props.shouldUpdate(e.target)
  }
  render () {
    const screenSize = this.props.screenSize
    const accountData = this.props.accountData.toJS()
    const uploads = this.props.uploads.toList().toJS()
    const uploadedCourses = this.props.uploadedCourses.toJS()
    const styles: any = {
      main: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      },
      upload: {
        maxWidth: screenSize < ScreenSize.MEDIUM ? '100%' : 'calc(100% - 120px)',
        overflowY: screenSize >= ScreenSize.MEDIUM ? 'auto' : '',
        zIndex: '10',
        flex: '1',
        color: '#fff'
      },
      flex: {
        overflow: 'hidden',
        display: screenSize >= ScreenSize.MEDIUM ? 'flex' : 'block',
        flexDirection: screenSize >= ScreenSize.MEDIUM ? 'column' : '',
        height: 'auto',
        alignItems: 'center'
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
      },
      content: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        color: '#000',
        fontSize: '15px',
        height: 'auto'
      }
    }
    const content =
      <div style={styles.content}>
        {
          (uploadedCourses.length > 0 || uploads.length > 0) &&
          <div style={styles.content}>
            <div style={{display: 'block', height: 'auto'}}>Recently uploaded:</div>
            {
              this.renderCourses(true)
            }
            <div style={styles.line} />
            All uploads:
          </div>
        }
        {
          this.renderCourses()
        }
      </div>
    return (
      <div style={styles.main}>
        <Helmet>
          <title>SMMDB - Uploads 64</title>
        </Helmet>
        <div style={styles.upload} id='scroll' onScroll={this.handleScroll}>
          {
            accountData.id ? (
              <div style={styles.flex}>
                <UploadArea is64 />
                <div>
                  { content }
                </div>
              </div>
            ) : (
              <div style={styles.text}>You are not logged in</div>
            )
          }
        </div>
      </div>
    )
  }
}
export default connect((state: any) => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize']),
  accountData: state.getIn(['userData', 'accountData']),
  courses: state.getIn(['courseData', 'self64']),
  uploads: state.get('uploads64'),
  uploadedCourses: state.getIn(['courseData', 'uploaded64'])
}))(Upload64View) as any
