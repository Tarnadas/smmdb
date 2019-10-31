import * as React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'

import { ScreenSize } from '@/client/reducers/mediaQuery'

import { Course2 } from '../../models/Course2'
import Course2Panel from '../panels/Course2Panel'
import { ProgressSpinner } from '../shared/ProgressSpinner'

interface Courses2ViewProps {
  setScrollCallback: any
  screenSize: number
}

interface Courses2ViewState {
  courses: Course2[]
  loading: boolean
  fetching: boolean
  skip: number
  reachedEnd: boolean
}

class Courses2View extends React.PureComponent<
  Courses2ViewProps,
  Courses2ViewState
> {
  private scrollDiv?: HTMLDivElement | null = null

  public constructor (props: Courses2ViewProps) {
    super(props)
    this.state = {
      courses: [],
      loading: true,
      fetching: false,
      skip: 0,
      reachedEnd: false
    }
    this.onScroll = this.onScroll.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
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

  private async fetchCourses (limit = 10): Promise<Course2[] | undefined> {
    const { skip } = this.state
    try {
      const url = `courses2?limit=${limit}&skip=${skip}`
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
      return courses
    } catch (err) {
      console.error(err)
    } finally {
      this.setState({
        fetching: false
      })
      setTimeout(() => this.handleScroll())
    }
  }

  private renderCourses (): JSX.Element | JSX.Element[] {
    const { courses } = this.state
    return courses.length > 0 ? (
      courses.map(course => (
        <Course2Panel key={course.id} courseId={course.id} course={course} />
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

  public render () {
    const { loading } = this.state
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
        </Helmet>
        {loading ? (
          <ProgressSpinner inline={true} />
        ) : (
          <div
            ref={div => (this.scrollDiv = div)}
            id="scroll"
            style={{
              width: '100%',
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
    )
  }
}
export default connect(
  (state: any): any => ({
    screenSize: state.getIn(['mediaQuery', 'screenSize']) as number
  })
)(Courses2View) as any
