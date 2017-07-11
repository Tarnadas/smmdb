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
      const courses = (await got(resolve(domain, `/api/getcourses?limit=10`), {
        json: true,
        useElectronNet: false
      })).body
      this.props.dispatch(setCourses(courses, false))
    } catch (err) {
      console.error(err.response.body)
    }
  }
  renderCourses (courses) {
    const self = this
    return Array.from((function * () {
      for (let i in courses) {
        yield (
          self.props.accountData.get('id') && courses[i].owner === self.props.accountData.get('id') ? (
            <CoursePanel canEdit course={courses[i]} apiKey={self.props.accountData.get('apikey')} id={i} key={courses[i].id} onCourseDelete={self.onCourseDelete} />
          ) : (
            <CoursePanel course={courses[i]} key={courses[i].id} />
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
      },
      flex: {
        // color: '#fff',
        // overflow: 'hidden',
        // display: screenSize === ScreenSize.LARGE ? 'flex' : 'block'
      }
    }
    return (
      <div style={styles.main}>
        <StatsPanel />
        {
          screenSize === ScreenSize.LARGE && <SideBarArea />
        }
        <div style={styles.content}>
          <div style={styles.flex}>
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
  accountData: state.getIn(['userData', 'accountData'])
}))(MainView)
