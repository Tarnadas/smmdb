import React from 'react'
import MediaQuery from 'react-responsive'
import copy from 'copy-to-clipboard'

export default class CourseDownloadButton extends React.PureComponent {
    constructor (props) {
        super(props);
        this.onCopyCourseID = this.onCopyCourseID.bind(this, props.courseId);
    }
    onCopyCourseID (courseID) {
        copy(courseID);
    }
    render () {
        const styles = {
            href: {
                height: '180px',
                width: 'calc(50% - 10px)',
                margin: '0 5px',
            },
            button: {
                height: '180px',
                backgroundColor: '#11c2b0',
                color: '#fff',
                borderRadius: '5px',
                border: '8px solid #0f9989',
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
            <MediaQuery query='screen and (min-device-width: 320px) and (max-device-width: 320px) and (min-device-height: 240px) and (max-device-width: 240px)'>
                {
                    matches => (
                        matches ? (
                            <div style={styles.button} onClick={this.onCopyCourseID}>
                                <div style={styles.icon}>
                                    <img style={styles.iconImg} src="/img/coursebot.png" />
                                </div>
                                <div style={styles.text}>
                                    Copy Course ID
                                </div>
                            </div>
                        ) : (
                            <a style={styles.href} href={`/api/downloadcourse?id=${this.props.courseId}&type=zip`} download>
                                <div style={styles.button}>
                                    <div style={styles.icon}>
                                        <img style={styles.iconImg} src="/img/coursebot.png" />
                                    </div>
                                    <div style={styles.text}>
                                        Download
                                    </div>
                                </div>
                            </a>
                        )
                    )
                }
            </MediaQuery>
        )
    }
}