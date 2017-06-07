import React    from 'react'
import {
    connect
} from 'react-redux'

import TopBarArea from '../areas/TopBarArea'

class AppView extends React.Component {
    render () {
        const styles = {
            global: {
                width: '100%',
                maxWidth: '100%',
                height: '100vh',
                overflowX: 'hidden'
            },
            logo: {
                fontSize: '44px',
                textAlign: 'center'
            },
            logoFont: {
                display: 'inline-block',
                color: '#000'
            },
            logoImage: {
                display: 'inline-block',
                position: 'absolute',
                right: '10px',
                float: 'right',
                height: '200px',
                width: '174px',
                zIndex: '-1',
                backgroundImage: 'url("/img/Construction_Mario.png")'
            },
            footer: {
                display: 'block',
                position: 'absolute',
                right: '0',
                bottom: '0',
                left: '0',
                verticalAlign: 'baseline',
                width: '100%',
                height: '43px',
                paddingTop: '13px',
                fontSize: '11px',
                textAlign: 'center',
                background: 'rgba(44, 44, 44, 0.3)',
                fontFamily: 'Consolas, "courier new", serif',
                fontWeight: 'bold',
                color: 'black'
            }
        };
        const isLoggedIn = !!this.props.userName;
        return (
            <div style={styles.global}>
                <TopBarArea isLoggedIn={isLoggedIn} />
                <div style={styles.logo}>
                    <div style={styles.logoFont}>SUPER MARIO MAKER DATABASE</div>
                    <div style={styles.logoImage} />
                </div>
                <footer style={styles.footer}>
                    Super Mario Maker Database (in short SMMDB) is not affiliated or associated with any other company.<br/>
                    All logos, trademarks, and trade names used herein are the property of their respective owners.
                </footer>
            </div>
        );
    }
}
export default connect(state => {
    let userName = state.getIn(['userData', 'userName']);
    return {
        userName: !!userName ? userName : ''
    }
})(AppView);