import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Route, withRouter } from 'react-router-dom'

import {
  BlogView,
  CoursesView,
  Courses64View,
  FAQView,
  PrivacyPolicyView,
  ProfileView,
  LegalNoticeView,
  MainView,
  SocialView,
  UploadView,
  Upload64View
} from './RouteLoading'

import { ScreenSize } from '../../reducers/mediaQuery'

class View extends React.PureComponent<any, any> {
  public componentDidUpdate (prevProps: any): void {
    if (this.props.location !== prevProps.location) {
      this.props.global.scrollTop = 0
    }
  }

  public render (): JSX.Element {
    const { screenSize } = this.props
    const styles: any = {
      content: {
        backgroundColor: '#24997e',
        height: screenSize >= ScreenSize.MEDIUM ? '0%' : 'auto',
        textAlign: 'center',
        flex: screenSize >= ScreenSize.MEDIUM ? '1 0 auto' : '1 0 0%'
      }
    }
    return (
      <div style={styles.content}>
        <Helmet>
          <title>SMMDB</title>
          <meta name="description" content="Super Mario Maker and Super Mario 64 Maker course database for consoles Wii U, 3DS and emulators Cemu, Citra and decaf. Net64/SM64O/Super Mario 64 Online official server list." />
        </Helmet>
        <Route exact path='/' component={MainView} />
        <Route path='/courses' render={(): JSX.Element => (
          <CoursesView
            shouldUpdate={this.props.shouldUpdate}
            setFetchCourses={this.props.setFetchCourses}
            isServer={this.props.isServer}
          />
        )} />
        <Route path='/courses64' render={(): JSX.Element => (
          <Courses64View
            shouldUpdate={this.props.shouldUpdate}
            setFetchCourses={this.props.setFetchCourses}
            isServer={this.props.isServer}
          />
        )} />
        <Route path='/upload' render={(): JSX.Element => (
          <UploadView
            shouldUpdate={this.props.shouldUpdate}
            setFetchCourses={this.props.setFetchCourses}
            isServer={this.props.isServer}
          />
        )} />
        <Route path='/upload64' render={(): JSX.Element => (
          <Upload64View
            shouldUpdate={this.props.shouldUpdate}
            setFetchCourses={this.props.setFetchCourses}
            isServer={this.props.isServer}
          />
        )} />
        <Route path='/blog' render={(): JSX.Element => (
          <BlogView isServer={this.props.isServer} />
        )} />
        <Route path='/profile' component={ProfileView} />
        <Route path='/faq' component={FAQView} />
        <Route path='/social' component={SocialView} />
        <Route path='/privacy' component={PrivacyPolicyView} />
        <Route path='/legal' component={LegalNoticeView} />
      </div>
    )
  }
}
export const ContentView = withRouter(connect((state: any): any => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(View) as any) as any
