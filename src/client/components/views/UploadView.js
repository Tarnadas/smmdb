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
    setCoursesSelf
} from '../../actions'
import {
    getJson
} from '../../../shared/renderer'
import CoursePanel from '../panels/CoursePanel'

const UPDATE_OFFSET = 500;
const LIMIT         = 10;
const STEP_LIMIT    = 10;

class UploadView extends React.PureComponent {
    constructor (props) {
        super(props);
        this.doUpdate = false;
        this.index = 0;
        this.fetchCourses = this.fetchCourses.bind(this);
        this.renderCourses = this.renderCourses.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }
    componentWillMount () {
        if (!this.props.accountData.get('id')) return;
        (async () => {
            await this.fetchCourses(this.props.accountData.get('apikey'));
        })();
    }
    componentWillReceiveProps (nextProps, nextContext) {
        if (nextProps.accountData === this.props.accountData || !nextProps.accountData.get('id')) return;
        this.doUpdate = false;
        this.index = 0;
        (async () => {
            await this.fetchCourses(this.props.accountData.get('apikey'));
        })();
    }
    async fetchCourses (apiKey, shouldConcat = false, limit = LIMIT, start = 0) {
        const courses = await getJson('GET', `/api/getcourses?limit=${limit}&start=${start}&apikey=${apiKey}`);
        console.log(courses);
        if (!courses.err) {
            this.props.dispatch(setCoursesSelf(courses, shouldConcat));
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
        forceCheck();
        if (this.doUpdate) return;
        const values = this.scrollBar.getValues();
        const shouldUpdate = values.scrollHeight - values.scrollTop - values.clientHeight < UPDATE_OFFSET;
        if (shouldUpdate) {
            this.doUpdate = true;
            (async () => {
                this.index += STEP_LIMIT;
                await this.fetchCourses(this.props.accountData.get('apikey'), true, STEP_LIMIT, this.index);
            })();
        }
    }
    render () {
        const screenSize = this.props.screenSize;
        const accountData = this.props.accountData.toJS();
        const courses = this.props.courses.toJS();
        const styles = {
            upload: {
                width: screenSize === ScreenSize.LARGE ? 'calc(100% - 260px)' : '100%',
                height: screenSize === ScreenSize.LARGE ? 'calc(100% - 40px)' : 'auto',
                overflow: 'hidden',
                position: screenSize === ScreenSize.LARGE ? 'absolute' : '',
                zIndex: '10',
                top: screenSize === ScreenSize.LARGE ? '40px' : '',
                left: screenSize === ScreenSize.LARGE ? '140px' : '',
                marginTop: screenSize === ScreenSize.LARGE ? '' : '30px',
                color: '#fff',
                cursor: 'pointer'
            },
            flex: {
                overflow: 'hidden',
                display: screenSize === ScreenSize.LARGE ? 'flex' : 'block',
                flexDirection: screenSize === ScreenSize.LARGE ? 'column' : ''
            },
            drag: {
                height: 'auto',
                width: 'auto',
                padding: '40px 20px',
                marginBottom: '10px',
                background: '#fff',
                color: '#000',
                fontSize: '20px',
                border: ' 4px dashed #000000',
                borderRadius: '20px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }
        };
        return (
            <div style={styles.upload}>
                {
                    !!accountData.id ? (
                        <div style={styles.flex}>
                            <div style={styles.drag}>
                                Drag and drop or click here to upload a course (not working)
                            </div>
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
                    ) : (
                        <div style={styles.flex}>You are not logged in</div>
                    )
                }
            </div>
        )
    }
}
export default connect(state => ({
    screenSize: state.getIn(['mediaQuery', 'screenSize']),
    accountData: state.getIn(['userData', 'accountData']),
    courses: state.get('courseDataSelf')
}))(UploadView)