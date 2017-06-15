import React      from 'react'
import {
    connect
} from 'react-redux'
import {
    Scrollbars
} from 'react-custom-scrollbars'
import request from 'request-promise'

import * as url from 'url'

import {
    setCourses
} from '../../actions'
import {
    domain
} from '../../../static'

import CoursePanel from '../panels/CoursePanel'

const UPDATE_OFFSET = 500;
const LIMIT         = 25;
const STEP_LIMIT    = 10;

class MainView extends React.PureComponent {
    constructor (props) {
        super(props);
        this.doUpdate = false;
        this.index = 0;
        this.renderCourses = this.renderCourses.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }
    componentDidMount () {
        (async () => {
            const courses = JSON.parse(await request({
                url: url.resolve(domain, `/api/getcourses?limit=${LIMIT}`)
            }));
            this.props.dispatch(setCourses(courses, false));
        })();
    }
    componentWillUpdate (nextProps, nextState, nextContext) {
        if (this.props.courses === nextProps.courses) return;
        this.doUpdate = false;
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
                const courses = JSON.parse(await request({
                    url: url.resolve(domain, `/api/getcourses?limit=${STEP_LIMIT}&start=${this.index}`)
                }));
                this.props.dispatch(setCourses(courses, true));
            })();
        }
    }
    render () {
        console.log('render');
        const styles = {
            main: {
                marginTop: '40px',
                width: 'calc(100% - 240px)',
                height: 'calc(100% - 40px)',
                overflow: 'hidden',
                position: 'relative',
                zIndex: '10'
            },
            flex: {
                color: '#fff',
                overflow: 'hidden',
                display: 'flex'
            }
        };
        return (
            <div style={styles.main}>
                <div style={styles.flex}>
                    <Scrollbars style={{height: '100%'}} onScroll={this.handleScroll} ref={input => { this.scrollBar = input; }}>
                        {
                            this.renderCourses(this.props.courses)
                        }
                    </Scrollbars>
                </div>
            </div>
        )
    }
}
export default connect(state => {
    const courses = state.get('courseData').toJS();
    return {
        courses
    }
})(MainView);