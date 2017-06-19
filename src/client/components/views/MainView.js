import React      from 'react'
import {
    connect
} from 'react-redux'
import {
    Scrollbars
} from 'react-custom-scrollbars'
import request from 'request-promise'

import * as url from 'url'
import * as qs  from 'querystring'

import {
    setCourses
} from '../../actions'
import {
    domain
} from '../../../static'

import CoursePanel from '../panels/CoursePanel'
import SideBarArea from '../areas/SideBarArea'

const UPDATE_OFFSET = 500;
const LIMIT         = 25;
const STEP_LIMIT    = 10;

class MainView extends React.PureComponent {
    constructor (props) {
        super(props);
        this.doUpdate = false;
        this.index = 0;
        this.queryString = qs.stringify(props.filter.toJS());
        this.renderCourses = this.renderCourses.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }
    async fetchCourses (shouldConcat = false, limit = LIMIT, start = 0) {
        const courses = JSON.parse(await request({
            url: url.resolve(domain, `/api/getcourses?limit=${limit}&start=${start}${!!this.queryString ? `&${this.queryString}` : ''}`)
        }));
        this.props.dispatch(setCourses(courses, shouldConcat));
    }
    componentDidMount () {
        (async () => {
            await this.fetchCourses();
        })();
    }
    componentWillReceiveProps (nextProps, nextContext) {
        if (nextProps.filter === this.props.filter) return;
        this.queryString = qs.stringify(nextProps.filter.toJS());
        this.index = 0;
        this.scrollBar.scrollToTop();
        (async () => {
            await this.fetchCourses();
        })();
    }
    componentWillUpdate (nextProps, nextState, nextContext) {
        if (this.props.courses !== nextProps.courses) {
            this.doUpdate = false;
        }
    }
    renderCourses (courses) {
        return Array.from((function * () {
            for (let i in courses) {
                yield (
                    <CoursePanel course={courses[i]} key={i} />
                )
            }
        })());
    }
    handleScroll () {
        if (this.doUpdate) return;
        const values = this.scrollBar.getValues();
        const shouldUpdate = values.scrollHeight - values.scrollTop - values.clientHeight < UPDATE_OFFSET;
        if (shouldUpdate) {
            this.doUpdate = true;
            (async () => {
                this.index += STEP_LIMIT;
                await this.fetchCourses(true, STEP_LIMIT, this.index);
                /*const courses = JSON.parse(await request({
                    url: url.resolve(domain, `/api/getcourses?limit=${STEP_LIMIT}&start=${this.index}`)
                }));
                this.props.dispatch(setCourses(courses, true));*/
            })();
        }
    }
    render () {
        const styles = {
            main: {
                width: 'calc(100% - 260px)',
                height: 'calc(100% - 40px)',
                overflow: 'hidden',
                position: 'absolute',
                zIndex: '10',
                top: '40px',
                left: '140px'
            },
            flex: {
                color: '#fff',
                overflow: 'hidden',
                display: 'flex'
            }
        };
        return (
            <div>
                <SideBarArea />
                <div style={styles.main}>
                    <div style={styles.flex}>
                        <Scrollbars style={{height: '100%'}} onScroll={this.handleScroll} ref={input => { this.scrollBar = input; }}>
                            {
                                this.renderCourses(this.props.courses)
                            }
                        </Scrollbars>
                    </div>
                </div>
            </div>
        )
    }
}
export default connect(state => {
    const courses = state.get('courseData').toJS();
    //console.log(courses);
    const filter = state.getIn(['filter', 'currentFilter']);
    return {
        courses,
        filter
    }
})(MainView);