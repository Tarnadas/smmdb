import * as React from 'react'
import { connect } from 'react-redux'
import { Route, withRouter } from 'react-router'
import Helmet from 'react-helmet'
import { stringify } from 'querystring'

import { ScreenSize } from '@/client/reducers/mediaQuery'

import { Course2, Filter2, Difficulty2, GameStyle2, CourseTheme2, AutoScroll2 } from '../../models/Course2'
import Course2Panel from '../panels/Course2Panel'
import { ProgressSpinner } from '../shared/ProgressSpinner'
import SideBarArea from '../areas/SideBarArea'
import Filter2Area from '../areas/Filter2Area'

interface Courses2ViewProps {
  setScrollCallback: any
  screenSize: number
  order: any
}

interface Courses2ViewState {
  courses: Course2[]
  filter: Filter2
  loading: boolean
  fetching: boolean
  skip: number
  reachedEnd: boolean
  err?: Error
}

class Courses2View extends React.PureComponent<
  Courses2ViewProps,
  Courses2ViewState
> {
  private scrollDiv?: HTMLDivElement | null = null;

  private queryString = '';

  public constructor (props: Courses2ViewProps) {
    super(props)
    this.state = {
      courses: [],
      filter: {
        title: '',
        uploader: '',
        lastmodifiedfrom: null,
        lastmodifiedto: null,
        uploadedfrom: null,
        uploadedto: null,
        difficulty: '' as any,
        gamestyle: '' as any,
        coursetheme: '' as any,
        coursethemesub: '' as any,
        autoscroll: '' as any
      },
      loading: true,
      fetching: false,
      skip: 0,
      reachedEnd: false
    }
    this.onScroll = this.onScroll.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.applyFilter = this.applyFilter.bind(this)
    props.setScrollCallback(this.handleScroll)
  }

  public async componentDidMount (): Promise<void> {
    const courses = await this.fetchCourses()
    this.setState({ loading: false })
    if (!courses) return
    this.setState({
      courses
    })
  }

  public async componentDidUpdate (prevProps: Courses2ViewProps, prevState: Courses2ViewState): Promise<void> {
    if (prevProps.order === this.props.order && prevState.filter === this.state.filter) return
    this.setState({
      courses: [],
      skip: 0
    })
    const order = this.props.order.toJS()
    if (order.order === 'lastmodified') {
      order.order = 'last_modified'
    }
    const sort = []
    sort.push({
      val: order.order,
      dir: order.dir ? 1 : -1
    })
    this.queryString = ''
    sort.forEach((query, index) => {
      this.queryString += `sort[${index}][val]=${query.val}&sort[${index}][dir]=${query.dir}`
    })

    const filterString = stringify((
      () => {
        const filter = { ...this.state.filter }
        Object.entries(filter).forEach(([key, val]) => {
          if (val != null && val !== '') return
          delete (filter as any)[key]
        })
        return filter
      })())
    if (filterString) {
      this.queryString += '&'
      this.queryString += filterString
    }

    const courses = await this.fetchCourses()
    if (!courses) return
    this.setState({
      courses: [...this.state.courses, ...courses]
    })
  }

  private async fetchCourses (limit = 10): Promise<Course2[] | undefined> {
    const { skip, err } = this.state
    if (err) return
    try {
      const url = `courses2?limit=${limit}&skip=${skip}${
        this.queryString ? `&${this.queryString}` : ''
      }`
      this.setState({
        fetching: true
      })
      const response = await fetch(`${process.env.API_DOMAIN || ''}${url}`)
      if (!response.ok) throw new Error(response.statusText)
      const courses = await response.json()
      if (!courses) return
      this.setState(prevState => ({
        skip: prevState.skip + courses.length
      }))
      if (courses.length === 0) {
        this.setState({
          reachedEnd: true
        })
      }
      setTimeout(() => this.handleScroll())
      return courses
    } catch (err) {
      this.setState({
        err
      })
      console.error(err)
    } finally {
      this.setState({
        fetching: false
      })
    }
  }

  private renderCourses (): JSX.Element | JSX.Element[] {
    const { courses } = this.state
    return courses.length > 0 ? (
      courses.map((course, index) => (
        <Course2Panel
          key={course.id}
          index={index}
          onDelete={this.onDelete}
          courseId={course.id}
          course={course}
        />
      ))
    ) : (
      <span style={{ fontSize: '1.2rem', margin: 'auto 0' }}>
        No course has been uploaded so far
      </span>
    )
  }

  private onScroll (): void {
    if (this.props.screenSize < ScreenSize.MEDIUM) return
    this.handleScroll()
  }

  private async handleScroll (
    event?: React.UIEvent<HTMLDivElement>
  ): Promise<void> {
    if (this.props.screenSize < ScreenSize.MEDIUM && !event) return
    const { fetching, reachedEnd } = this.state
    if (fetching || reachedEnd || !this.scrollDiv) return
    const { target }: { target: HTMLDivElement } = event
      ? (event as any)
      : { target: this.scrollDiv }
    const shouldUpdate =
      target.scrollHeight - target.scrollTop - target.clientHeight < 200
    if (!shouldUpdate) return
    const courses = await this.fetchCourses()
    if (!courses) return
    this.setState({
      courses: [...this.state.courses, ...courses]
    })
  }

  private onDelete (index: number): void {
    this.state.courses.splice(index, 1)
    const courses = [...this.state.courses]
    this.setState({
      courses
    })
  }

  private applyFilter (filter: Filter2): void {
    this.setState({
      filter
    })
  }

  public render () {
    const { screenSize } = this.props
    const { courses, filter, loading, fetching } = this.state
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%'
        }}
      >
        <Helmet>
          <title>SMMDB - Courses 2</title>
          <meta
            name="description"
            content="Super Mario Maker 2 courses list for Yuzu and Switch. SMMDB is the only cross-sharing platform for Super Mario Maker 2 courses."
          />
        </Helmet>
        <div
          style={{
            display: 'flex',
            flexDirection: screenSize >= ScreenSize.MEDIUM ? 'row' : 'column',
            alignItems: 'center',
            height: '100%'
          }}
        >
          <SideBarArea />
          {loading || (fetching && courses.length === 0) ? (
            <div style={{
              width: '700px'
            }}>
              <ProgressSpinner inline={true} />
            </div>
          ) : (
            <div
              ref={div => (this.scrollDiv = div)}
              id="scroll"
              style={{
                width: '700px',
                maxWidth: '100vw',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowY: 'auto'
              }}
              onScroll={this.onScroll}
            >
              {this.renderCourses()}
            </div>
          )}
        </div>
        <Route path="/courses2/filter"
          render={(): JSX.Element => (
            <Filter2Area
              filter={filter}
              applyFilter={this.applyFilter}
            />
          )} />
      </div>
    )
  }
}
export default withRouter(connect((state: any): any => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize']) as number,
  order: state.get('order') as Order
}))(Courses2View) as any) as any

enum Order {
  LastModified = 'lastmodified',
  Uploaded = 'uploaded',
  Stars = 'stars'
}
