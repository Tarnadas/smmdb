import React    from 'react'
import {
    connect
} from 'react-redux'

import TopBarArea from '../areas/TopBarArea'
import ContentView from './ContentView'

import {
    setVideoId
} from '../../actions'

class AppView extends React.PureComponent {
    constructor (props) {
        super(props);
        this.onVideoHide = this.onVideoHide.bind(this);
    }
    onVideoHide () {
        this.props.dispatch(setVideoId(''));
    }
    render () {
        const styles = {
            global: {
                width: '100%',
                maxWidth: '100%',
                height: '100%',
                maxHeight: '100%',
                overflow: 'hidden'
            },
            logo: {
                height: 'auto',
                fontSize: '44px',
                textAlign: 'center',
                boxShadow: '0px 10px 20px 0px rgba(0,0,0,0.3)',
                zIndex: '1',
                position: 'relative'
                //backgroundColor: '#ffcf00'
            },
            logoFont: {
                display: 'inline-block',
                color: '#000'
            },
            logoImage: {
                display: 'inline-block',
                position: 'absolute',
                top: '200px',
                right: '10px',
                float: 'right',
                height: '200px',
                width: '174px',
                zIndex: '2'
            },
            footer: {
                display: 'block',
                position: 'absolute',
                bottom: '0',
                verticalAlign: 'baseline',
                width: '100%',
                height: '43px',
                paddingTop: '13px',
                fontSize: '11px',
                textAlign: 'center',
                background: 'rgba(44, 44, 44, 0.3)',
                fontFamily: 'Consolas, "courier new", serif',
                fontWeight: 'bold',
                color: '#000'
            },
            overflow: {
                display: this.props.videoId ? 'flex' : 'none',
                position: 'absolute',
                zIndex: '100',
                backgroundColor: 'rgba(0,0,0,0.6)',
                top: '0', left: '0',
                width: '100%',
                height: '100%',
                alignItems: 'center'
            },
            video: {
                width: '720px',
                height: '480px',
                margin: '0 auto'
            }
        };
        const isLoggedIn = !!this.props.userName;
        return (
            <div>
                <div style={styles.global}>
                    <TopBarArea isLoggedIn={isLoggedIn} />
                    <div style={styles.logo}>
                        <div style={styles.logoFont}>SUPER MARIO MAKER DATABASE</div>
                        <div style={styles.logoImage}>
                            <img src="/img/Construction_Mario.png" />
                        </div>
                    </div>
                    <ContentView />
                    <div style={styles.footer}>
                        Super Mario Maker Database (in short SMMDB) is not affiliated or associated with any other company.<br/>
                        All logos, trademarks, and trade names used herein are the property of their respective owners.
                    </div>
                </div>
                {
                    !!this.props.videoId && (
                        <div style={styles.overflow} onClick={this.onVideoHide}>
                            <iframe style={styles.video} src={`http://www.youtube.com/embed/${this.props.videoId}?disablekb=1&iv_load_policy=3&rel=0&showinfo=0`} frameBorder='0' allowFullScreen />
                        </div>
                    )
                }
            </div>
        );
    }
}
export default connect(state => {
    let userName = state.getIn(['userData', 'userName']);
    let videoId = state.getIn(['userData', 'videoId']);
    console.log(videoId);
    return {
        userName: !!userName ? userName : '',
        videoId: !!videoId ? videoId : ''
    }
})(AppView);