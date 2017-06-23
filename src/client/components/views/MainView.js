import React      from 'react'
import {
    connect
} from 'react-redux'
import {
    Scrollbars
} from 'react-custom-scrollbars'

import {
    ScreenSize
} from '../../reducers/mediaQuery'

import CoursePanel from '../panels/CoursePanel'
import SideBarArea from '../areas/SideBarArea'

class MainView extends React.PureComponent {
    constructor (props) {
        super(props);
        this.renderCourses = this.renderCourses.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }
    componentWillReceiveProps (nextProps, nextContext) {
        if (nextProps.filter === this.props.filter) return;
        this.scrollBar.scrollToTop();
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
                {
                    screenSize === ScreenSize.LARGE && <SideBarArea />
                }
                <div style={styles.main}>
                    <div style={styles.flex}>
                        {
                            screenSize === ScreenSize.LARGE ? (
                                <Scrollbars style={{height: '100%'}} onScroll={this.handleScroll} ref={input => { this.scrollBar = input; }}>
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
export default connect(state => {
    const screenSize = state.getIn(['mediaQuery', 'screenSize']);
    const courses = state.get('courseData');
    const filter = state.getIn(['filter', 'currentFilter']);
    return {
        screenSize,
        courses,
        filter
    }
})(MainView);