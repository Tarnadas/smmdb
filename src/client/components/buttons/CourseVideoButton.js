import React from 'react'
import {
    connect
} from 'react-redux'

import {
    setVideoId
} from '../../actions'

class CourseVideoButton extends React.PureComponent {
    constructor (props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    onClick () {
        this.props.dispatch(setVideoId(this.props.videoId))
    }
    render () {
        const styles = {
            button: {
                backgroundColor: '#11c2b0',
                color: '#fff',
                borderRadius: '5px',
                border: '8px solid #0f9989',
                height: '180px',
                width: 'calc(50% - 10px)',
                margin: '0 5px',
                boxShadow: '0px 5px 0px 0px rgba(0,0,0,0.4)',
                cursor: 'pointer'
            },
            icon: {
                height: '110px',

            },
            iconImg: {
                width: 'auto',
                height: 'auto'
            },
            text: {
                height: '70px',
                lineHeight: '70px',
                fontSize: '24px'
            }
        };
        return (
            <div style={styles.button} onClick={this.onClick}>
                <div style={styles.icon}>
                    <img style={styles.iconImg} src="/img/play.png" />
                </div>
                <div style={styles.text}>
                    Show Video
                </div>
            </div>
        )
    }
}
export default connect()(CourseVideoButton);