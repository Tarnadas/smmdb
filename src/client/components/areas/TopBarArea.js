import React from 'react'
import {
    connect
} from 'react-redux'
import {
    Link
} from 'react-router-dom'

import LoginButton from '../buttons/LoginButton'
import SMMButton   from '../buttons/SMMButton'
import {
    ScreenSize
} from '../../reducers/mediaQuery'

class TopBarArea extends React.PureComponent{
    render () {
        const screenSize = this.props.screenSize;
        const styles = {
            topbar: {
                width: '100%',
                height: 'auto',
                padding: '10px',
                display: screenSize === ScreenSize.LARGE ? 'inline-flex' : 'none',
                alignItems: 'flex-start',
                flex: '0 0 auto'
            },
            button: {
                width: 'auto',
                height: 'auto'
            }
        };
        return (
            <div style={styles.topbar}>
                <div>
                    <SMMButton link='/' text="Courses" iconSrc="/img/courses.png" iconColor="dark" />
                    <SMMButton link='/upload' text="Upload" iconSrc="/img/upload.png" iconColor="dark" />
                    <SMMButton link='/profile' text="Profile" iconSrc="/img/profile.png" iconColor="dark" />
                    <SMMButton link='https://github.com/Tarnadas/smmdb' blank text="API" iconSrc="/img/api.png" iconColor="dark" />
                    <SMMButton link='https://github.com/Tarnadas/cemu-smmdb/releases' blank text="Client" iconSrc="/img/client.png" iconColor="dark" />
                    <SMMButton link='https://www.reddit.com/r/CemuMarioMaker' blank text="Reddit" iconSrc="/img/reddit.png" iconColor="dark" />
                    <SMMButton link='https://discord.gg/hK2fsTq' blank text="Discord" iconSrc="/img/discord.png" iconColor="dark" />
                </div>
                <div style={styles.button}>
                    <LoginButton />
                </div>
            </div>
        );
    }
}
export default connect(state => {
    const screenSize = state.getIn(['mediaQuery', 'screenSize']);
    return {
        screenSize
    }
})(TopBarArea);