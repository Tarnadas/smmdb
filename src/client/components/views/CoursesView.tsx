import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Route, withRouter } from 'react-router-dom'

import { resolve } from 'url'
import { stringify } from 'querystring'

import { ScreenSize } from '../../reducers/mediaQuery'
import { setCourses, deleteCourse, resetFilter, resetOrder } from '../../actions'

import { StatsPanel } from '../panels/StatsPanel'
import { CoursePanel } from '../panels/CoursePanel'
import { SideBarArea } from '../areas/SideBarArea'
import { FilterArea } from '../areas/FilterArea'

const LIMIT = 10

class CoursesView extends React.PureComponent<any, any> {
  public queryString: string
  public scroll: any

  constructor (props: any) {
    super(props)
    this.queryString = stringify(props.filter.toJS())
    this.fetchCourses = this.fetchCourses.bind(this)
    this.renderCourses = this.renderCourses.bind(this)
    this.onCourseDelete = this.onCourseDelete.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }
  componentWillMount () {
    if (process.env.IS_SERVER) return
    this.props.dispatch(resetFilter())
    this.props.dispatch(resetOrder())
    this.props.setFetchCourses(this.fetchCourses)
    this.fetchCourses()
  }
  componentWillReceiveProps (nextProps: any) {
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
      const { apiKey } = this.props
      const url = `/api/getcourses?limit=${limit}&start=${shouldConcat ? this.props.courses.size : 0}${this.queryString ? `&${this.queryString}` : ''}`
      const response = await fetch(resolve(process.env.DOMAIN!, url), {
        headers: apiKey
          ? {
            'Authorization': `APIKEY ${this.props.apiKey}`
          }
          : undefined
      })
      if (!response.ok) throw new Error(response.statusText)
      const courses = await response.json()
      if (!courses) return
      this.props.dispatch(setCourses(courses, shouldConcat))
    } catch (err) {
      console.error(err)
    }
  }
  renderCourses () {
    const accountData = this.props.accountData
    const courses = this.props.courses
    const reuploads = this.props.reuploads
    const imageFull = this.props.imageFull
    const imagePrev = this.props.imagePrev
    const onCourseDelete = this.onCourseDelete
    return Array.from((function * () {
      let i = 0
      for (let course of courses) {
        const courseId = course.get('id')
        yield (
          (accountData.get('id') && course.owner === accountData.get('id')) || accountData.get('permissions') === 1 ? (
            <CoursePanel
              key={courseId}
              canEdit
              course={course}
              reupload={reuploads.get(courseId)}
              imageFull={imageFull.get(courseId)}
              imagePrev={imagePrev.get(courseId)}
              apiKey={accountData.get('apikey')}
              id={i}
              onCourseDelete={onCourseDelete}
            />
          ) : (
            <CoursePanel
              key={courseId}
              course={course}
              reupload={reuploads.get(courseId)}
              imageFull={imageFull.get(courseId)}
              imagePrev={imagePrev.get(courseId)}
              apiKey={accountData.get('apikey')}
              id={i}
            />
          )
        )
        i++
      }
    })())
  }
  onCourseDelete (courseId: any) {
    this.props.dispatch(deleteCourse(courseId))
  }
  handleScroll (e: any) {
    this.props.shouldUpdate(e.target)
  }
  render () {
    const screenSize = this.props.screenSize
    const styles: any = {
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
        <Helmet>
          <title>SMMDB - Courses</title>
          <meta name="description" content="Super Mario Maker courses list for Cemu and consoles. SMMDB is the only cross-sharing platform for Super Mario Maker courses." />
        </Helmet>
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
export default withRouter(connect((state: any) => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize']),
  courses: state.getIn(['courseData', 'main']),
  accountData: state.getIn(['userData', 'accountData']),
  filter: state.getIn(['filter', 'currentFilter']),
  order: state.get('order'),
  apiKey: state.getIn(['userData', 'accountData', 'apikey']),
  imageFull: state.getIn(['image', 'full']),
  imagePrev: state.getIn(['image', 'prev']),
  reuploads: state.get('reuploads')
}))(CoursesView) as any) as any
