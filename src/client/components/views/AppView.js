import React from 'react'
import { connect } from 'react-redux'
import { Route, Link } from 'react-router-dom'
import { forceCheck } from 'react-lazyload'
import got from 'got'
import locale from 'browser-locale'

import { resolve } from 'url'

import ContentView from './ContentView'
import TopBarArea from '../areas/TopBarArea'
import { ScreenSize } from '../../reducers/mediaQuery'
import { setVideoId, mediaQuery, setAmazonProducts } from '../../actions'

const UPDATE_OFFSET = 500
const STEP_LIMIT = 10

class AppView extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      fetchCourses: null
    }
    this.doUpdate = false
    this.setFetchCourses = this.setFetchCourses.bind(this)
    this.onVideoHide = this.onVideoHide.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.shouldUpdate = this.shouldUpdate.bind(this)
  }
  componentWillMount () {
    if (this.props.isServer) return;
    (async () => {
      const l = locale().toLowerCase()
      let country
      if (l.includes('us')) {
        country = 'US'
      } else if (l.includes('ca')) {
        country = 'CA'
      } else if (l.includes('de')) {
        country = 'DE'
      } else if (l.includes('gb')) {
        country = 'UK'
      } else if (l.includes('fr')) {
        country = 'FR'
      } else if (l.includes('es-es')) {
        country = 'ES'
      } else if (l.includes('it')) {
        country = 'IT'
      }
      if (!country) return
      try {
        const res = (await got(resolve(process.env.DOMAIN, `/api/getamazonproducts?country=${country}`), {
          json: true,
          useElectronNet: false
        })).body
        this.props.dispatch(setAmazonProducts(res))
      } catch (err) {
        if (err.response) {
          console.error(err.response.body)
        } else {
          console.error(err)
        }
      }
    })()
    if (process.env.ELECTRON) return
    const listener = (size, query) => {
      if (query.matches) {
        this.props.dispatch(mediaQuery(size))
      }
    }
    const queryLarge = window.matchMedia('(min-width: 1360px)')
    queryLarge.addListener(listener.bind(this, ScreenSize.LARGE))
    const queryMedium = window.matchMedia('(max-width: 1359px) and (min-width: 1000px)')
    queryMedium.addListener(listener.bind(this, ScreenSize.MEDIUM))
    const querySmall = window.matchMedia('(max-width: 999px) and (min-width: 700px)')
    querySmall.addListener(listener.bind(this, ScreenSize.SMALL))
    const queryMobile = window.matchMedia('(max-width: 699px)')
    queryMobile.addListener(listener.bind(this, ScreenSize.SUPER_SMALL))

    if (queryLarge.matches) {
      this.props.dispatch(mediaQuery(ScreenSize.LARGE))
    } else if (queryMedium.matches) {
      this.props.dispatch(mediaQuery(ScreenSize.MEDIUM))
    } else if (querySmall.matches && !process.env.ELECTRON) {
      this.props.dispatch(mediaQuery(ScreenSize.SMALL))
    } else if (queryMobile.matches && !process.env.ELECTRON) {
      this.props.dispatch(mediaQuery(ScreenSize.SUPER_SMALL))
    }
  }
  componentWillUpdate (nextProps, nextState, nextContext) {
    this.screenSize = 0
    if (
      this.props.courses !== nextProps.courses ||
      this.props.courses64 !== nextProps.courses64 ||
      this.props.coursesSelf !== nextProps.coursesSelf ||
      this.props.courses64Self !== nextProps.courses64Self
    ) {
      this.doUpdate = false
    }
  }
  setFetchCourses (fetchCourses) {
    this.setState({
      fetchCourses
    })
  }
  onVideoHide () {
    this.props.dispatch(setVideoId(''))
  }
  handleScroll (e) {
    if (this.props.screenSize >= ScreenSize.MEDIUM) return
    this.shouldUpdate(e.target)
  }
  shouldUpdate (values) {
    forceCheck()
    if (this.doUpdate) return
    const shouldUpdate = values.scrollHeight - values.scrollTop - values.clientHeight < UPDATE_OFFSET
    if (shouldUpdate) {
      this.doUpdate = true
      if (this.state.fetchCourses) this.state.fetchCourses(true, STEP_LIMIT)
    }
  }
  render () {
    const screenSize = this.props.screenSize
    const styles = {
      react: {
        width: '100%',
        height: '100%'
      },
      global: {
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        maxHeight: '100%',
        overflowY: screenSize >= ScreenSize.MEDIUM ? 'visible' : 'auto',
        display: 'flex',
        flexDirection: 'column'
      },
      logo: {
        fontSize: '44px',
        textAlign: 'center',
        boxShadow: '0px 10px 20px 0px rgba(0,0,0,0.3)',
        zIndex: '1',
        flex: '0 0',
        margin: '5px 0'
      },
      logoFont: {
        display: 'inline-block',
        color: '#000',
        whiteSpace: 'nowrap'
      },
      footer: {
        padding: screenSize >= ScreenSize.MEDIUM ? '' : '4px 0',
        fontSize: '11px',
        textAlign: 'center',
        background: 'rgba(44, 44, 44, 0.3)',
        fontFamily: 'Consolas, "courier new", serif',
        fontWeight: 'bold',
        color: '#000',
        height: screenSize >= ScreenSize.MEDIUM ? '39px' : '',
        display: screenSize >= ScreenSize.MEDIUM ? 'flex' : '',
        alignItems: screenSize >= ScreenSize.MEDIUM ? 'center' : ''
      },
      overflow: {
        display: 'flex',
        position: 'absolute',
        zIndex: '100',
        backgroundColor: 'rgba(0,0,0,0.6)',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        overflowY: 'scroll'
      },
      video: {
        width: '720px',
        height: '480px',
        margin: '0 auto'
      },
      disclaimer: {
        flex: '1 0 0%'
      },
      footerLinks: {
        padding: '0 20px'
      },
      footerLink: {
        padding: '0 6px',
        borderRight: '1px solid black',
        borderLeft: '1px solid black',
        color: '#1d31ff'
      }
    }
    const isLoggedIn = !!this.props.userName
    const global = this.global
    return (
      <div style={styles.react}>
        <TopBarArea isLoggedIn={isLoggedIn} />
        <div style={styles.global} onScroll={this.handleScroll} ref={glob => { this.global = glob }}>
          <div style={styles.logo}>
            <div style={styles.logoFont}>
              {
                screenSize === ScreenSize.LARGE ? (
                  'SUPER MARIO MAKER DATABASE'
                ) : (
                  screenSize === ScreenSize.MEDIUM ? (
                    'SMM DATABASE'
                  ) : (
                    'SMMDB'
                  )
                )
              }
            </div>
          </div>
          <Route
            path='/'
            render={
              () => <ContentView
                global={global}
                shouldUpdate={this.shouldUpdate}
                setFetchCourses={this.setFetchCourses}
                isServer={this.props.isServer}
              />}
            />
          <div style={styles.footer}>
            <div style={styles.disclaimer}>
              Super Mario Maker Database (in short SMMDB) is not affiliated or associated with any other company.<br />
              All logos, trademarks, and trade names used herein are the property of their respective owners.
            </div>
            <div style={styles.footerLinks}>
              <Link to='/privacy' style={styles.footerLink}>Privacy Policy</Link>
              <Link to='/legal' style={styles.footerLink}>Legal Notice</Link>
            </div>
          </div>
        </div>
        {
          this.props.videoId &&
          <div style={styles.overflow} onClick={this.onVideoHide}>
            <iframe
              style={styles.video}
              src={`//www.youtube.com/embed/${this.props.videoId}?disablekb=1&iv_load_policy=3&rel=0&showinfo=0`}
              frameBorder='0'
              allowFullScreen
            />
          </div>
        }
        {
          this.props.showFilter &&
          <div />
        }
      </div>
    )
  }
}
export default connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize']),
  userName: state.getIn(['userData', 'userName']) || '',
  videoId: state.getIn(['userData', 'videoId']) || '',
  courses: state.getIn(['courseData', 'main']),
  coursesSelf: state.getIn(['courseData', 'self']),
  courses64: state.getIn(['courseData', 'main64']),
  courses64Self: state.getIn(['courseData', 'self64']),
  showFilter: state.get('showFilter')
}))(AppView)
