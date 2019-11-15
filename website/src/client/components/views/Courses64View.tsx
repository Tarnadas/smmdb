import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Route, withRouter } from 'react-router-dom'

import { resolve } from 'url'
import { stringify } from 'querystring'

import { ScreenSize } from '../../reducers/mediaQuery'
import {
  setCourses64,
  deleteCourse64,
  resetFilter,
  resetOrder
} from '../../actions'

import { Course64Panel } from '../panels/Course64Panel'
import SideBarArea from '../areas/SideBarArea'
import { FilterArea } from '../areas/FilterArea'

const LIMIT = 16

class Courses64View extends React.PureComponent<any, any> {
  public queryString: string
  public scroll: any

  public constructor (props: any) {
    super(props)
    this.queryString = stringify(props.filter.toJS())
    this.fetchCourses = this.fetchCourses.bind(this)
    this.renderCourses = this.renderCourses.bind(this)
    this.onCourseDelete = this.onCourseDelete.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }

  // eslint-disable-next-line
  public UNSAFE_componentWillMount(): void {
    if (process.env.IS_SERVER) return
    this.props.dispatch(resetFilter())
    this.props.dispatch(resetOrder())
    this.props.setFetchCourses(this.fetchCourses)
    this.fetchCourses()
  }

  // eslint-disable-next-line
  public UNSAFE_componentWillReceiveProps(nextProps: any): void {
    if (
      nextProps.filter === this.props.filter &&
      nextProps.order === this.props.order
    ) { return }
    if (this.scroll) this.scroll.scrollTop = 0
    const order = nextProps.order.toJS()
    this.queryString = stringify(
      Object.assign({}, nextProps.filter.toJS(), {
        order: order.order,
        dir: order.dir ? 'asc' : 'desc'
      })
    )
    // this.scrollBar.scrollToTop(); // TODO
    this.fetchCourses()
  }

  private async fetchCourses (
    shouldConcat = false,
    limit = LIMIT
  ): Promise<void> {
    try {
      const { apiKey } = this.props
      const url = `/api/getcourses64?limit=${limit}&start=${
        shouldConcat ? this.props.courses.size : 0
      }${this.queryString ? `&${this.queryString}` : ''}`
      const response = await fetch(resolve(process.env.DOMAIN || '', url), {
        headers: apiKey
          ? {
            Authorization: `APIKEY ${this.props.apiKey}`
          }
          : undefined
      })
      if (!response.ok) throw new Error(response.statusText)
      const courses = await response.json()
      if (!courses) return
      this.props.dispatch(setCourses64(courses, shouldConcat))
    } catch (err) {
      console.error(err)
    }
  }

  private renderCourses (): JSX.Element[] {
    const accountData = this.props.accountData
    const courses = this.props.courses
    const onCourseDelete = this.onCourseDelete
    return Array.from(
      (function * (): IterableIterator<JSX.Element> {
        let i = 0
        for (let course of courses) {
          yield (accountData.get('id') &&
            course.get('owner') === accountData.get('id')) ||
          accountData.get('permissions') === 1 ? (
            <Course64Panel
              key={course.get('id')}
              canEdit
              course={course}
              apiKey={accountData.get('apikey')}
              id={i}
              onCourseDelete={onCourseDelete}
            />
          ) : (
            <Course64Panel
              key={course.get('id')}
              course={course}
              apiKey={accountData.get('apikey')}
              id={i}
            />
          )
          i++
        }
      })()
    )
  }

  private onCourseDelete (courseId: any): void {
    this.props.dispatch(deleteCourse64(courseId))
  }

  private handleScroll (e: any): void {
    this.props.shouldUpdate(e.target)
  }

  public render (): JSX.Element {
    const { screenSize } = this.props
    const styles: any = {
      main: {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap'
      },
      content: {
        maxHeight: 'calc(100% - 34px)',
        overflowY: screenSize >= ScreenSize.MEDIUM ? 'auto' : '',
        zIndex: '10',
        flex: '1',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'flex-start'
      }
    }
    return (
      <div style={styles.main}>
        <Helmet>
          <title>SMMDB - Courses64</title>
          <meta
            name="description"
            content="Super Mario 64 Maker courses list for Nintendo 64 emulators. SMMDB is the official platform to share Super Mario 64 Maker courses."
          />
        </Helmet>
        {screenSize >= ScreenSize.MEDIUM && <SideBarArea is64 />}
        <div
          style={styles.content}
          id="scroll"
          onScroll={this.handleScroll}
          ref={(scroll): void => {
            this.scroll = scroll
          }}
        >
          {this.renderCourses()}
        </div>
        <Route path="/courses64/filter" component={FilterArea} />
      </div>
    )
  }
}
export default withRouter(connect(
  (state: any): any => ({
    screenSize: state.getIn(['mediaQuery', 'screenSize']),
    courses: state.getIn(['courseData', 'main64']),
    accountData: state.getIn(['userData', 'accountData']),
    filter: state.getIn(['filter', 'currentFilter']),
    order: state.get('order'),
    apiKey: state.getIn(['userData', 'accountData', 'apikey'])
  })
)(Courses64View) as any) as any
