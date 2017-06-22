import React from 'react'
import {
    connect
} from 'react-redux'

import {
    setVideoId
} from '../../actions'
import {
    ScreenSize
} from '../../reducers/mediaQuery'

class CourseVideoButton extends React.PureComponent {
    constructor (props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    onClick () {
        this.props.dispatch(setVideoId(this.props.videoId))
    }
    render () {
        const screenSize = this.props.screenSize;
        const styles = {
            button: {
                backgroundColor: '#11c2b0',
                color: '#fff',
                borderRadius: '5px',
                border: screenSize === ScreenSize.LARGE ? '8px solid #0f9989' : '4px solid #0f9989',
                height: screenSize === ScreenSize.LARGE ? '180px' : 'auto',
                width: '100%',
                margin: '0 5px',
                boxShadow: '0px 5px 0px 0px rgba(0,0,0,0.4)',
                cursor: 'pointer',
                padding: '0 10px'
            },
            icon: {
                maxHeight: '110px',
                height: 'auto',
                width: 'auto',
                display: 'block'
            },
            iconImg: {
                width: 'auto',
                height: screenSize === ScreenSize.LARGE ? '100%' : '80px'
            },
            text: {
                height: screenSize === ScreenSize.LARGE ? '70px' : 'auto',
                width: screenSize === ScreenSize.LARGE ? '100%' : 'auto',
                minWidth: screenSize === ScreenSize.LARGE ? '' : '90px',
                margin: screenSize === ScreenSize.LARGE ? '' : '3px 0',
                lineHeight: screenSize === ScreenSize.LARGE ? '70px' : '',
                fontSize: screenSize === ScreenSize.LARGE ? '24px' : '16px'
            }
        };
        return (
            <div style={styles.button} onClick={this.onClick}>
                <div style={styles.icon}>
                    <img style={styles.iconImg} src="/img/play.png" />
                </div>
                <div style={styles.text}>
                    Video
                </div>
            </div>
        )
    }
}
export default connect()(CourseVideoButton);