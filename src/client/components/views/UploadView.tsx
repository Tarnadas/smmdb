import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'

import { resolve } from 'url'

import { ScreenSize } from '../../reducers/mediaQuery'
import { setCoursesSelf, deleteCourseSelf, deleteCourseUploaded } from '../../actions'
import { CoursePanel } from '../panels/CoursePanel'
import { ProgressPanel } from '../panels/ProgressPanel'
import { UploadArea } from '../areas/UploadArea'

const LIMIT = 10

class UploadView extends React.PureComponent<any, any> {
  public constructor (props: any) {
    super(props)
    this.fetchCourses = this.fetchCourses.bind(this)
    this.renderCourses = this.renderCourses.bind(this)
    this.onCourseDelete = this.onCourseDelete.bind(this)
    this.onCourseDeleteRecent = this.onCourseDeleteRecent.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }

  // eslint-disable-next-line
  public UNSAFE_componentWillMount (): void {
    if (process.env.IS_SERVER) return
    this.props.setFetchCourses(this.fetchCourses)
    if (this.props.accountData.get('id')) {
      this.fetchCourses()
    }
  }

  // eslint-disable-next-line
  public UNSAFE_componentWillReceiveProps (nextProps: any): void {
    if (nextProps.accountData === this.props.accountData || !nextProps.accountData.get('id')) return
    this.fetchCourses(false, LIMIT, nextProps)
  }

  private async fetchCourses (shouldConcat = false, limit = LIMIT, props = this.props): Promise<void> {
    const accountData = props.accountData
    if (!accountData.get('id')) return
    try {
      const apiKey = accountData.get('apikey')
      const response = await fetch(resolve(process.env.DOMAIN || '', `/api/getcourses?uploader=${accountData.get('username')}&limit=${limit}&start=${shouldConcat ? this.props.courses.size : 0}`), {
        headers: {
          'Authorization': `APIKEY ${apiKey}`
        }
      })
      if (!response.ok) throw new Error(response.statusText)
      const courses = await response.json()
      if (courses && courses.length > 0) {
        props.dispatch(setCoursesSelf(courses, shouldConcat))
      }
    } catch (err) {
      console.error(err)
    }
  }

  private renderCourses (uploaded?: any): JSX.Element[] {
    const courses = uploaded ? this.props.uploads.toList().merge(this.props.uploadedCourses) : this.props.courses
    const reuploads = this.props.reuploads
    const imageFull = this.props.imageFull
    const imagePrev = this.props.imagePrev
    const accountData = this.props.accountData
    const onCourseDelete = uploaded ? this.onCourseDeleteRecent : this.onCourseDelete
    return Array.from((function * (): IterableIterator<JSX.Element> {
      let i = 0
      for (let course of courses) {
        const courseId = course.get('id')
        if (course.get('eta') != null) {
          yield (
            <ProgressPanel course={course} key={courseId} />
          )
        } else {
          yield (
            <CoursePanel
              key={courseId} canEdit isSelf
              uploaded={uploaded} course={course}
              reupload={reuploads.get(courseId)}
              imageFull={imageFull.get(courseId)} imagePrev={imagePrev.get(courseId)}
              apiKey={accountData.get('apikey')}
              id={i} onCourseDelete={onCourseDelete}
            />
          )
        }
        i++
      }
    })())
  }

  private onCourseDelete (courseId: any): void {
    this.props.dispatch(deleteCourseSelf(courseId))
  }

  private onCourseDeleteRecent (courseId: any): void {
    this.props.dispatch(deleteCourseUploaded(courseId))
  }

  private handleScroll (e: any): void {
    this.props.shouldUpdate(e.target)
  }

  public render (): JSX.Element {
    const { screenSize } = this.props
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
        <Helmet>
          <title>SMMDB - Uploads</title>
        </Helmet>
        <div style={styles.upload} id='scroll' onScroll={this.handleScroll}>
          {
            accountData.id
              ? <div style={styles.flex}>
                <UploadArea />
                <div style={{width: '100%'}}>
                  { content }
                </div>
              </div>
              : <div style={styles.text}>You are not logged in</div>
          }
        </div>
      </div>
    )
  }
}
export default connect((state: any): any => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize']),
  accountData: state.getIn(['userData', 'accountData']),
  courses: state.getIn(['courseData', 'self']),
  uploads: state.get('uploads'),
  uploadedCourses: state.getIn(['courseData', 'uploaded']),
  imageFull: state.getIn(['image', 'full']),
  imagePrev: state.getIn(['image', 'prev']),
  reuploads: state.get('reuploads')
}))(UploadView) as any
