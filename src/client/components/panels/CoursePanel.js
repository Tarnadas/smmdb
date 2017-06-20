import React from 'react'

import CourseDownloadButton from '../buttons/CourseDownloadButton'
import CourseVideoButton    from '../buttons/CourseVideoButton'

export default class CoursePanel extends React.PureComponent {
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
        const styles = {
            panel: {
                height: this.state.showDetails ? '409px' : '169px',
                width: 'calc(100% - 20px)',
                backgroundColor: '#d4dda5',
                borderRadius: '10px',
                margin: '10px',
                color: '#000',
                overflow: 'hidden',
                transition: 'height 0.8s'
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
                backgroundColor: '#d7db48',
                borderRadius: '10px 0 0 10px'
            },
            details: {
                width: 'calc(100% - 100px)',
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
                lineHeight: '44px',
                paddingLeft: '10px',
                textAlign: 'left',
                fontSize: '22px',
                whiteSpace: 'nowrap'
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
                width: 'calc(100% - 86px)',
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
                width: '86px'
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
                height: '240px'
            },
            imageLarge: {
                width: '320px',
                height: '240px'
            },
            buttonPanel: {
                width: 'calc(100% - 280px)',
                margin: '0 20px',
                display: 'flex',
                flexWrap: 'wrap'
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
                            <CourseDownloadButton courseId={this.props.course.id} />
                            {
                                !!this.props.course.videoid && (
                                    <CourseVideoButton videoId={this.props.course.videoid} />
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}