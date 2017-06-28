import React from 'react'
import {
    connect
} from 'react-redux'
import {
    Route
} from 'react-router-dom'
import { forceCheck } from 'react-lazyload'

import { stringify } from 'querystring'

import TopBarArea  from '../areas/TopBarArea'
import FilterArea  from '../areas/FilterArea'
import ContentView from './ContentView'

import {
    ScreenSize
} from '../../reducers/mediaQuery'
import {
    setVideoId, mediaQuery, setCourses
} from '../../actions'
import {
    getJson
} from '../../../shared/renderer'

const UPDATE_OFFSET = 500;
const LIMIT         = 10;
const STEP_LIMIT    = 10;

class AppView extends React.PureComponent {
    constructor (props) {
        super(props);
        this.doUpdate = false;
        this.index = props.courses.toJS().length;
        this.queryString = stringify(props.filter.toJS());
        this.fetchCourses = this.fetchCourses.bind(this);
        this.onVideoHide = this.onVideoHide.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.shouldUpdate = this.shouldUpdate.bind(this);
    }
    componentWillMount () {
        if (!!this.props.isServer) return;
        const listener = (size, query) => {
            if (query.matches) {
                this.props.dispatch(mediaQuery(size));
            }
        };
        const queryLarge = window.matchMedia('(min-width: 1000px)');
        queryLarge.addListener(listener.bind(this, ScreenSize.LARGE));
        const queryMedium = window.matchMedia('(max-width: 999px) and (min-width: 700px)');
        queryMedium.addListener(listener.bind(this, ScreenSize.MEDIUM));
        const querySmall = window.matchMedia('(max-width: 699px)');
        querySmall.addListener(listener.bind(this, ScreenSize.SMALL));

        if (queryLarge.matches) {
            this.props.dispatch(mediaQuery(ScreenSize.LARGE));
        } else if (queryMedium.matches) {
            this.props.dispatch(mediaQuery(ScreenSize.MEDIUM));
        } else if (querySmall.matches) {
            this.props.dispatch(mediaQuery(ScreenSize.SMALL));
        }
    }
    componentWillReceiveProps (nextProps, nextContext) {
        if (nextProps.filter === this.props.filter) return;
        this.queryString = stringify(nextProps.filter.toJS());
        this.index = 0;
        //this.scrollBar.scrollToTop(); // TODO for mobile
        (async () => {
            await this.fetchCourses();
        })();
    }
    componentWillUpdate (nextProps, nextState, nextContext) {
        this.screenSize = 0;
        if (this.props.courses !== nextProps.courses) {
            this.doUpdate = false;
        }
    }
    async fetchCourses (shouldConcat = false, limit = LIMIT, start = 0) {
        const courses = await getJson('GET', `/api/getcourses?limit=${limit}&start=${start}${!!this.queryString ? `&${this.queryString}` : ''}`);
        if (!courses.err) {
            this.props.dispatch(setCourses(courses, shouldConcat));
        }
    }
    onVideoHide () {
        this.props.dispatch(setVideoId(''));
    }
    handleScroll (e) {
        forceCheck();
        if (this.props.screenSize === ScreenSize.LARGE) return;
        this.shouldUpdate(e.target);
    }
    shouldUpdate (values) {
        if (this.doUpdate) return;
        const shouldUpdate = values.scrollHeight - values.scrollTop - values.clientHeight < UPDATE_OFFSET;
        if (shouldUpdate) {
            this.doUpdate = true;
            (async () => {
                this.index += STEP_LIMIT;
                await this.fetchCourses(true, STEP_LIMIT, this.index);
            })();
        }
    }
    render () {
        const screenSize = this.props.screenSize;
        const styles = {
            global: {
                width: '100%',
                maxWidth: '100%',
                height: '100%',
                maxHeight: '100%',
                overflow: screenSize === ScreenSize.LARGE ? 'hidden' : 'scroll',
                display: screenSize === ScreenSize.LARGE ? 'flex' : 'block',
                flexDirection: 'column'
            },
            logo: {
                height: 'auto',
                fontSize: '44px',
                textAlign: 'center',
                boxShadow: '0px 10px 20px 0px rgba(0,0,0,0.3)',
                zIndex: '1',
                flex: '0 0'
            },
            logoFont: {
                display: 'inline-block',
                color: '#000'
            },
            logoImage: {
                display: 'inline-block',
                position: 'absolute',
                top: '200px',
                right: '10px',
                float: 'right',
                height: '200px',
                width: '174px',
                zIndex: '2'
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
                top: '0', left: '0',
                width: '100%',
                height: '100%',
                alignItems: 'center'
            },
            video: {
                width: '720px',
                height: '480px',
                margin: '0 auto'
            }
        };
        const isLoggedIn = !!this.props.userName;
        return (
            <div>
                <div style={styles.global} onScroll={this.handleScroll}>
                    <TopBarArea isLoggedIn={isLoggedIn} />
                    <div style={styles.logo}>
                        <div style={styles.logoFont}>SUPER MARIO MAKER DATABASE</div>
                        <div style={styles.logoImage}>
                            <img src="/img/Construction_Mario.png" />
                        </div>
                    </div>
                    <Route path="/" render={() => (
                        <ContentView shouldUpdate={this.shouldUpdate} />
                    )} />
                    <div style={styles.footer}>
                        Super Mario Maker Database (in short SMMDB) is not affiliated or associated with any other company.<br/>
                        All logos, trademarks, and trade names used herein are the property of their respective owners.
                    </div>
                </div>
                {
                    !!this.props.videoId && (
                        <div style={styles.overflow} onClick={this.onVideoHide}>
                            <iframe style={styles.video} src={`http://www.youtube.com/embed/${this.props.videoId}?disablekb=1&iv_load_policy=3&rel=0&showinfo=0`} frameBorder='0' allowFullScreen />
                        </div>
                    )
                }
                {
                    this.props.showFilter && (
                        <div style={styles.overflow}>
                            <FilterArea />
                        </div>
                    )
                }
            </div>
        );
    }
}
export default connect(state => {
    const screenSize = state.getIn(['mediaQuery', 'screenSize']);
    const userName = state.getIn(['userData', 'userName']);
    const videoId = state.getIn(['userData', 'videoId']);
    const courses = state.get('courseData');
    const showFilter = state.get('showFilter');
    const filter = state.getIn(['filter', 'currentFilter']);
    return {
        screenSize,
        userName: !!userName ? userName : '',
        videoId: !!videoId ? videoId : '',
        courses,
        showFilter,
        filter
    }
})(AppView);