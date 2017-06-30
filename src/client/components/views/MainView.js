import React from 'react'
import {
    connect
} from 'react-redux'
import {
    Scrollbars
} from 'react-custom-scrollbars'
import { forceCheck } from 'react-lazyload'

import {
    ScreenSize
} from '../../reducers/mediaQuery'
import {
    setCourses
} from '../../actions'
import {
    getJson
} from '../../../shared/renderer'
import StatsPanel  from '../panels/StatsPanel'
import CoursePanel from '../panels/CoursePanel'
import SideBarArea from '../areas/SideBarArea'

class MainView extends React.PureComponent {
    constructor (props) {
        super(props);
        this.fetchCourses = this.fetchCourses.bind(this);
        this.renderCourses = this.renderCourses.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }
    componentWillMount () {
        (async () => {
            await this.fetchCourses();
        })();
    }
    componentWillReceiveProps (nextProps, nextContext) {
        if (nextProps.filter === this.props.filter) return;
        this.scrollBar.scrollToTop();
    }
    async fetchCourses () {
        const courses = await getJson('GET', `/api/getcourses?limit=10`);
        if (!courses.err) {
            this.props.dispatch(setCourses(courses, false));
        }
    }
    renderCourses (courses) {
        const self = this;
        return Array.from((function * () {
            for (let i in courses) {
                yield (
                    self.props.accountData.get('id') && courses[i].owner === self.props.accountData.get('id') ? (
                        <CoursePanel canEdit course={courses[i]} apiKey={self.props.accountData.get('apikey')} id={i} key={i} />
                    ) : (
                        <CoursePanel course={courses[i]} key={i} />
                    )
                )
            }
        })());
    }
    handleScroll () {
        forceCheck();
        this.props.shouldUpdate(this.scrollBar.getValues());
    }
    render () {
        const screenSize = this.props.screenSize;
        const courses = this.props.courses.toJS();
        const styles = {
            main: {
                width: screenSize === ScreenSize.LARGE ? 'calc(100% - 260px)' : '100%',
                height: screenSize === ScreenSize.LARGE ? 'calc(100% - 40px)' : 'auto',
                overflow: 'hidden',
                position: screenSize === ScreenSize.LARGE ? 'absolute' : '',
                zIndex: '10',
                top: screenSize === ScreenSize.LARGE ? '40px' : '',
                left: screenSize === ScreenSize.LARGE ? '140px' : '',
                marginTop: screenSize === ScreenSize.LARGE ? '' : '30px'
            },
            flex: {
                color: '#fff',
                overflow: 'hidden',
                display: screenSize === ScreenSize.LARGE ? 'flex' : 'block'
            }
        };
        return (
            <div>
                <StatsPanel />
                {
                    screenSize === ScreenSize.LARGE && <SideBarArea />
                }
                <div style={styles.main}>
                    <div style={styles.flex}>
                        {
                            screenSize === ScreenSize.LARGE ? (
                                <Scrollbars universal style={{height: '100%'}} onScroll={this.handleScroll} ref={input => { this.scrollBar = input; }}>
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
    courses: state.get('courseData'),
    filter: state.getIn(['filter', 'currentFilter']),
    accountData: state.getIn(['userData', 'accountData'])
}))(MainView);