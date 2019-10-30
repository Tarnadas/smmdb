import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'

import { ScreenSize } from '@/client/reducers/mediaQuery'

import { Course2 } from '../../models/Course2'
import Course2Panel from '../panels/Course2Panel'
import Upload2Panel from '../panels/Upload2Panel'
import { ProgressSpinner } from '../shared/ProgressSpinner'

interface Upload2ViewProps {
  setScrollCallback: any
  screenSize: number
  accountData: any
}

interface Upload2ViewState {
  courses: Course2[]
  loading: boolean
  fetching: boolean
  skip: number
  reachedEnd: boolean
}

class Upload2View extends React.PureComponent<
  Upload2ViewProps,
  Upload2ViewState
> {
  public constructor (props: Upload2ViewProps) {
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
    this.refresh = this.refresh.bind(this)
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

  public async componentDidUpdate (prevProps: Upload2ViewProps): Promise<void> {
    const { accountData } = this.props
    const performedLogin =
      prevProps.accountData.get('id') == null && accountData.get('id') != null
    if (performedLogin) {
      this.setState({ loading: true })
      const courses = await this.fetchCourses()
      this.setState({ loading: false })
      if (!courses) return
      this.setState({
        courses
      })
    }
  }

  private async fetchCourses (limit = 10): Promise<Course2[] | undefined> {
    const { accountData } = this.props
    const { skip } = this.state
    if (!accountData.get('id')) return
    try {
      const owner = accountData.get('id')
      const url = `courses2?limit=${limit}&skip=${skip}&owner=${owner}`
      this.setState({
        fetching: true
      })
      const response = await fetch(`${process.env.API_DOMAIN || ''}${url}`, {
        credentials: 'include'
      })
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

  private onScroll (event?: React.UIEvent<HTMLDivElement>): void {
    if (this.props.screenSize < ScreenSize.MEDIUM) return
    this.handleScroll(event)
  }

  private async handleScroll (
    event?: React.UIEvent<HTMLDivElement>
  ): Promise<void> {
    const { fetching, reachedEnd } = this.state
    if (fetching || reachedEnd || !event) return
    const { target }: { target: HTMLDivElement } = event as any
    const shouldUpdate =
      target.scrollHeight - target.scrollTop - target.clientHeight < 200
    if (!shouldUpdate) return
    const courses = await this.fetchCourses()
    if (!courses) return
    this.setState({
      courses: [...this.state.courses, ...courses]
    })
  }

  private async refresh (): Promise<void> {
    this.setState({ loading: true, skip: 0 })
    return new Promise<void>(resolve => {
      setTimeout(async () => {
        const courses = await this.fetchCourses()
        this.setState({ loading: false })
        if (!courses) return
        this.setState({
          courses
        })
        resolve()
      })
    })
  }

  public render () {
    const { loading } = this.state
    const { accountData } = this.props
    const isLoggedIn = !!accountData.get('id')
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
          <title>SMMDB - Uploads 2</title>
        </Helmet>
        {isLoggedIn ? (
          loading ? (
            <ProgressSpinner inline={true} />
          ) : (
            <div
              id="scroll"
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowY: 'auto'
              }}
              onScroll={this.handleScroll}
            >
              <Upload2Panel refresh={this.refresh} />
              {this.renderCourses()}
            </div>
          )
        ) : (
          <span style={{ fontSize: '1.2rem', margin: 'auto 0' }}>
            You are not logged in
          </span>
        )}
      </div>
    )
  }
}
export default connect(
  (state: any): any => ({
    screenSize: state.getIn(['mediaQuery', 'screenSize']) as number,
    accountData: state.getIn(['userData', 'accountData'])
  })
)(Upload2View) as any
