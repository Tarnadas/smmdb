import React from 'react'
import {
  connect
} from 'react-redux'
import {
  Route
} from 'react-router-dom'
import { forceCheck } from 'react-lazyload'
import got from 'got'

import { stringify } from 'querystring'
import { resolve } from 'url'

import TopBarArea from '../areas/TopBarArea'
import FilterArea from '../areas/FilterArea'
import ContentView from './ContentView'

import {
  ScreenSize
} from '../../reducers/mediaQuery'
import {
  setVideoId, mediaQuery, setCourses
} from '../../actions'
import {
  domain
} from '../../../static'

const UPDATE_OFFSET = 500
const LIMIT = 10
const STEP_LIMIT = 10

class AppView extends React.PureComponent {
  constructor (props) {
    super(props)
    this.doUpdate = false
    this.queryString = stringify(props.filter.toJS())
    this.fetchCourses = this.fetchCourses.bind(this)
    this.onVideoHide = this.onVideoHide.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.shouldUpdate = this.shouldUpdate.bind(this)
  }
  componentWillMount () {
    if (this.props.isServer) return
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
    } else if (querySmall.matches) {
      this.props.dispatch(mediaQuery(ScreenSize.SMALL))
    } else if (queryMobile.matches) {
      this.props.dispatch(mediaQuery(ScreenSize.SUPER_SMALL))
    }
  }
  componentWillReceiveProps (nextProps, nextContext) {
    if (nextProps.filter === this.props.filter) return
    this.queryString = stringify(nextProps.filter.toJS());
    // this.scrollBar.scrollToTop(); // TODO
    (async () => {
      await this.fetchCourses()
    })()
  }
  componentWillUpdate (nextProps, nextState, nextContext) {
    this.screenSize = 0
    if (this.props.courses !== nextProps.courses) {
      this.doUpdate = false
    }
  }
  async fetchCourses (shouldConcat = false, limit = LIMIT, start = 0) {
    try {
      const courses = (await got(resolve(domain, `/api/getcourses?limit=${limit}&start=${start}${this.queryString ? `&${this.queryString}` : ''}`), Object.assign({
        json: true,
        useElectronNet: false
      }, this.props.apiKey ? {
        headers: {
          'Authorization': `APIKEY ${this.props.apiKey}`
        }
      } : null))).body
      if (courses && courses.length > 0) {
        this.props.dispatch(setCourses(courses, shouldConcat))
      }
    } catch (err) {
      if (!err.response) {
        console.error(err.response.body)
      }
    }
  }
  onVideoHide () {
    this.props.dispatch(setVideoId(''))
  }
  handleScroll (e) {
    if (this.props.screenSize >= ScreenSize.MEDIUM) return
    this.shouldUpdate(e.target)
  }
  shouldUpdate (values, fetchCourses) {
    forceCheck()
    if (this.doUpdate) return
    const shouldUpdate = values.scrollHeight - values.scrollTop - values.clientHeight < UPDATE_OFFSET
    if (shouldUpdate) {
      this.doUpdate = true;
      (async () => {
        await fetchCourses ? fetchCourses(true, STEP_LIMIT, this.props.coursesSelf.size) : this.fetchCourses(true, STEP_LIMIT, this.props.courses.size)
      })()
    }
  }
  render () {
    const screenSize = this.props.screenSize
    const styles = {
      global: {
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        maxHeight: '100%',
        overflowY: screenSize >= ScreenSize.MEDIUM ? 'hidden' : 'scroll',
        display: 'flex',
        flexDirection: 'column'
      },
      logo: {
        height: 'auto',
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
        paddingTop: '13px',
        fontSize: '11px',
        textAlign: 'center',
        background: 'rgba(44, 44, 44, 0.3)',
        fontFamily: 'Consolas, "courier new", serif',
        fontWeight: 'bold',
        color: '#000',
        flex: '0 0',
        height: 'auto'
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
      }
    }
    const isLoggedIn = !!this.props.userName
    return (
      <div>
        <TopBarArea isLoggedIn={isLoggedIn} />
        <div style={styles.global} onScroll={this.handleScroll}>
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
          <Route path='/' render={() => (
            <ContentView shouldUpdate={this.shouldUpdate} />
          )} />
          <div style={styles.footer}>
              Super Mario Maker Database (in short SMMDB) is not affiliated or associated with any other company.<br />
              All logos, trademarks, and trade names used herein are the property of their respective owners.
          </div>
        </div>
        {
          !!this.props.videoId && (
          <div style={styles.overflow} onClick={this.onVideoHide}>
            <iframe style={styles.video} src={`http://www.youtube.com/embed/${this.props.videoId}?disablekb=1&iv_load_policy=3&rel=0&showinfo=0`} frameBorder='0' allowFullScreen />
          </div>
        )}
        {
          this.props.showFilter && (
          <div style={styles.overflow}>
            <FilterArea />
          </div>
        )}
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
  showFilter: state.get('showFilter'),
  filter: state.getIn(['filter', 'currentFilter']),
  apiKey: state.getIn(['userData', 'accountData', 'apikey'])
}))(AppView)
