import React from 'react'
import {
    connect
} from 'react-redux'
import {
    Scrollbars
} from 'react-custom-scrollbars'
import { forceCheck } from 'react-lazyload'
import got from 'got'

import { resolve } from 'url'

import {
    ScreenSize
} from '../../reducers/mediaQuery'
import {
    setCoursesSelf
} from '../../actions'
import {
    domain
} from '../../../static'
import CoursePanel from '../panels/CoursePanel'
import UploadArea  from '../areas/UploadArea'

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
        if (nextProps.courses !== this.props.courses) this.doUpdate = false;
        if (nextProps.accountData === this.props.accountData || !nextProps.accountData.get('id')) return;
        this.doUpdate = false;
        this.index = 0;
        (async () => {
            await this.fetchCourses(nextProps.accountData.get('apikey'));
        })();
    }
    async fetchCourses (apiKey, shouldConcat = false, limit = LIMIT, start = 0) {
        const courses = (await got(resolve(domain, `/api/getcourses?limit=${limit}&start=${start}&apikey=${apiKey}`), {
            json: true
        })).body;
        if (!courses.err) {
            this.props.dispatch(setCoursesSelf(courses, shouldConcat));
        }
    }
    renderCourses (courses) {
        let self = this;
        return Array.from((function * () {
            for (let i in courses) {
                yield (
                    <CoursePanel canEdit isSelf course={courses[i]} apiKey={self.props.accountData.get('apikey')} id={i} key={i} />
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
        const uploadedCourses = this.props.uploadedCourses.toJS();
        const styles = {
            main: {
                display: screenSize === ScreenSize.LARGE ? 'flex' : 'flex',
                flexDirection: screenSize === ScreenSize.LARGE ? 'column' : 'column',
                alignItems: screenSize === ScreenSize.LARGE ? 'center' : 'center'
            },
            upload: {
                width: screenSize === ScreenSize.LARGE ? 'calc(100% - 260px)' : '100%',
                maxWidth: '926px',
                height: screenSize === ScreenSize.LARGE ? 'calc(100% - 40px)' : 'auto',
                overflow: 'hidden',
                zIndex: '10',
                marginTop: '40px',
                color: '#fff'
            },
            flex: {
                overflow: 'hidden',
                display: screenSize === ScreenSize.LARGE ? 'flex' : 'block',
                flexDirection: screenSize === ScreenSize.LARGE ? 'column' : ''
            },
            line: {
                height: '5px',
                backgroundColor: '#000',
                margin: '10px 0'
            }
        };
        return (
            <div style={styles.main}>
                <div style={styles.upload}>
                    {
                        !!accountData.id ? (
                            <div style={styles.flex}>
                                <UploadArea />
                                {
                                    screenSize === ScreenSize.LARGE ? (
                                        <Scrollbars universal style={{height: '100%'}} onScroll={this.handleScroll} ref={input => { this.scrollBar = input; }}>
                                            {
                                                uploadedCourses.length > 0 && (
                                                    <div style={{height:'auto', color:'#000', fontSize:'15px'}}>
                                                        Recently uploaded:
                                                        {
                                                            this.renderCourses(uploadedCourses)
                                                        }
                                                        <div style={styles.line} />
                                                        All uploads:
                                                    </div>
                                                )
                                            }
                                            {
                                                this.renderCourses(courses)
                                            }
                                        </Scrollbars>
                                    ) : (
                                        <div>
                                            {
                                                uploadedCourses.length > 0 && (
                                                    <div style={{height:'auto', color:'#000', fontSize:'15px'}}>
                                                        Recently uploaded:
                                                        {
                                                            this.renderCourses(uploadedCourses)
                                                        }
                                                        <div style={styles.line} />
                                                        All uploads:
                                                    </div>
                                                )
                                            }
                                            {
                                                this.renderCourses(courses)
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        ) : (
                            <div style={styles.flex}>You are not logged in</div>
                        )
                    }
                </div>
            </div>
        )
    }
}
export default connect(state => ({
    screenSize: state.getIn(['mediaQuery', 'screenSize']),
    accountData: state.getIn(['userData', 'accountData']),
    courses: state.get('courseDataSelf'),
    uploadedCourses: state.get('courseDataUploaded')
}))(UploadView)