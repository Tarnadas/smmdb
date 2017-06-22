import React from 'react'
import {
    connect
} from 'react-redux'

import CourseDownloadButton from '../buttons/CourseDownloadButton'
import CourseVideoButton    from '../buttons/CourseVideoButton'
import {
    ScreenSize
} from '../../reducers/mediaQuery'

class CoursePanel extends React.PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            showDetails: false
        };
        this.onShowDetails = this.onShowDetails.bind(this);
        this.onHideDetails = this.onHideDetails.bind(this);
    }
    onShowDetails () {
        if (!this.state.showDetails) {
            this.setState({
                showDetails: true
            });
        }
    }
    onHideDetails () {
        this.setState({
            showDetails: false
        });
    }
    render () {
        const screenSize = this.props.screenSize;
        const styles = {
            panel: {
                height: this.state.showDetails ? 'auto' : '169px',
                width: 'calc(100% - 20px)',
                backgroundColor: '#d4dda5',
                borderRadius: '10px',
                margin: '10px',
                color: '#000',
                overflow: 'hidden',
                transition: 'height 0.8s', // TODO
                display: 'flex'
            },
            top: {
                height: '169px',
                cursor: this.state.showDetails ? 'auto' : 'pointer',
                display: 'inline-flex',
                flexWrap: 'wrap',
                alignContent: 'flex-start',
                verticalAlign: 'top'
            },
            rank: {
                width: '100px',
                height: 'auto',
                backgroundColor: '#d7db48',
                borderRadius: '10px 0 0 10px',
                display: screenSize === ScreenSize.SMALL ? 'none' : 'block'
            },
            details: {
                width: screenSize === ScreenSize.SMALL ? '100%' : 'calc(100% - 100px)',
                display: 'inline-flex',
                flexWrap: 'wrap',
                alignContent: 'flex-start',
                verticalAlign: 'top'
            },
            theme: {
                width: '91px',
                height: '44px'
            },
            title: {
                width: `calc(100% - ${this.state.showDetails ? '135' : '91'}px)`,
                height: '44px',
                paddingLeft: '10px',
                textAlign: 'left',
                fontSize: screenSize === ScreenSize.SMALL ?  '16px' : '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            close: {
                display: this.state.showDetails ? '' : 'none',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                float: 'right',
                margin: '6px',
                backgroundColor: '#11c2b0',
                borderRadius: '5px',
                padding: '6px'
            },
            preview: {
                width: screenSize === ScreenSize.SMALL ? '100%' :'calc(100% - 86px)',
                height: '81px',
                overflow: 'hidden'
            },
            previewImgWrapper: {
                width: '720px',
                height: '81px',
                backgroundColor: '#cfcfab',
                textAlign: 'left'
            },
            previewImg: {
                width: 'auto'
            },
            mii: {
                height: '81px',
                width: '86px',
                display: screenSize === ScreenSize.SMALL ? 'none' : 'block'
            },
            miiImgWrapper: {
                width: '76px',
                height: '76px',
                boxShadow: '0px 5px 0px 0px rgba(0,0,0,0.4)',
                backgroundColor: '#fff',
                borderRadius: '5px'
            },
            footer: {
                height: '44px',
                lineHeight: '44px',
                fontSize: '18px',
                margin: '0 12px',
                color: '#444'
            },
            stats: {
                float: 'left',
                width: 'auto',
                display: 'flex',
                alignItems: 'center'
            },
            statsStars: {
                width: '36px',
                height: '36px',
                margin: '0 8px'
            },
            statsDownloads: {
                width: '24px',
                height: '24px',
                margin: '0 8px'
            },
            maker: {
                float: 'right',
                width: 'auto',
                display: 'flex',
                alignItems: 'center'
            },
            makerRep: {
                width: '10px',
                height: '10px',
                margin: '0 8px'
            },
            makerName: {
                color: '#000',
                fontSize: '22px',
                marginLeft: '14px'
            },
            bottom: {
                display: 'inline-flex',
                //alignItems: 'flex-start',
                height: 'auto',
                justifyContent: 'space-around',
                flexWrap: screenSize === ScreenSize.LARGE ? '' : 'wrap'
            },
            imageLarge: {
                width: 'auto',
                //minWidth: '320px',
                height: 'auto'
            },
            buttonPanel: {
                width: screenSize === ScreenSize.LARGE ? 'calc(100% - 280px)' : 'auto',
                margin: screenSize !== ScreenSize.LARGE ? '20px' : '0 20px',
                display: 'flex',
                alignItems: 'flex-start'
            }
        };
        const style = parseInt(this.props.course.gameStyle);
        /*
         <img style={styles.makerRep} src="/img/rep.png" />
         <div>
         { this.props.course.reputation }
         </div>
         */
        return (
            <div style={styles.panel} onClick={this.onShowDetails}>
                <div style={styles.rank}>
                </div>
                <div style={styles.details}>
                    <div style={styles.top}>
                        <div style={styles.theme}>
                            <img src={
                                style === 0 ? (
                                    '/img/smb.png'
                                ) : (
                                    style === 1 ? (
                                        '/img/smb3.png'
                                    ) : (
                                        style === 2 ? (
                                            '/img/smw.png'
                                        ) : (
                                            '/img/nsmbu.png'
                                        )
                                    )
                                )
                            } />
                        </div>
                        <div style={styles.title}>
                            { this.props.course.title }
                        </div>
                        <div style={styles.close} onClick={this.onHideDetails}>
                            <img src="/img/cancel.svg" />
                        </div>
                        <div style={styles.preview}>
                            <div style={styles.previewImgWrapper}>
                                <img style={styles.previewImg} src={`/courseimg/${this.props.course.id}_full.jpg`} />
                            </div>
                        </div>
                        <div style={styles.mii}>
                            <div style={styles.miiImgWrapper}>
                                <img src='/img/mii_default.png' />
                            </div>
                        </div>
                        <div style={styles.footer}>
                            <div style={styles.stats}>
                                <img style={styles.statsStars} src="/img/unstarred.png" />
                                <div>
                                    { this.props.course.starred }
                                </div>
                                <div>
                                    /
                                </div>
                                <img style={styles.statsDownloads} src="/img/downloads.png" />
                                <div>
                                    { this.props.course.downloads }
                                </div>
                            </div>
                            <div style={styles.maker}>
                                <div style={styles.makerName}>
                                    { this.props.course.maker }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={styles.bottom}>
                        <div style={styles.imageLarge}>
                            <img src={`/courseimg/${this.props.course.id}.jpg`} />
                        </div>
                        <div style={styles.buttonPanel}>
                            <CourseDownloadButton courseId={this.props.course.id} screenSize={screenSize} />
                            {
                                !!this.props.course.videoid && (
                                    <CourseVideoButton videoId={this.props.course.videoid} screenSize={screenSize} />
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default connect(state => {
    const screenSize = state.getIn(['mediaQuery', 'screenSize']);
    return {
        screenSize
    }
})(CoursePanel);