import React    from 'react'
import {
    connect
} from 'react-redux'
import MediaQuery from 'react-responsive'

import TopBarArea  from '../areas/TopBarArea'
import FilterArea  from '../areas/FilterArea'
import ContentView from './ContentView'

import {
    ScreenSize
} from '../../reducers/mediaQuery'
import {
    setVideoId, mediaQuery
} from '../../actions'

class AppView extends React.PureComponent {
    constructor (props) {
        super(props);
        this.screenSize = 0;
        this.onVideoHide = this.onVideoHide.bind(this);
        this.onMediaSmall = this.onMediaQuery.bind(this, ScreenSize.SMALL);
        this.onMediaMedium = this.onMediaQuery.bind(this, ScreenSize.MEDIUM);
        this.onMediaLarge = this.onMediaQuery.bind(this, ScreenSize.LARGE);
    }
    componentWillUpdate (nextProps, nextState, nextContext) {
        this.screenSize = 0;
    }
    onVideoHide () {
        this.props.dispatch(setVideoId(''));
    }
    onMediaQuery (size, query) {
        if (query) {
            console.log(size);
            this.props.dispatch(mediaQuery(size));
        }
        return null;
    }
    render () {
        const screenSize = this.props.screenSize;
        const styles = {
            global: {
                width: '100%',
                maxWidth: '100%',
                height: '100%',
                maxHeight: '100%',
                overflow: screenSize === ScreenSize.LARGE ? 'hidden' : 'scroll',
                display: screenSize === ScreenSize.LARGE ? 'flex' : 'block',
                flexDirection: 'column'
            },
            logo: {
                height: 'auto',
                fontSize: '44px',
                textAlign: 'center',
                boxShadow: '0px 10px 20px 0px rgba(0,0,0,0.3)',
                zIndex: '1',
                flex: '0 0'
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
                paddingTop: '13px',
                fontSize: '11px',
                textAlign: 'center',
                background: 'rgba(44, 44, 44, 0.3)',
                fontFamily: 'Consolas, "courier new", serif',
                fontWeight: 'bold',
                color: '#000',
                flex: '0 0',
                height: 'auto'
            },
            overflow: {
                display: 'flex',
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
                <div style={{display: 'none'}}>
                    <MediaQuery minWidth={700}>
                        <MediaQuery minWidth={1024}>
                            { this.onMediaLarge }
                        </MediaQuery>
                        <MediaQuery maxWidth={1023}>
                            { this.onMediaMedium }
                        </MediaQuery>
                    </MediaQuery>
                    <MediaQuery maxWidth={699}>
                        { this.onMediaSmall }
                    </MediaQuery>
                </div>
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
                    {
                        this.props.showFilter && (
                            <div style={styles.overflow}>
                                <FilterArea />
                            </div>
                        )
                    }
                </div>
            </div>
        );
    }
}
export default connect(state => {
    const screenSize = state.getIn(['mediaQuery', 'screenSize']);
    const userName = state.getIn(['userData', 'userName']);
    const videoId = state.getIn(['userData', 'videoId']);
    const showFilter = state.get('showFilter');
    return {
        screenSize,
        userName: !!userName ? userName : '',
        videoId: !!videoId ? videoId : '',
        showFilter
    }
})(AppView);