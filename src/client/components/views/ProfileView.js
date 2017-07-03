import React from 'react'
import {
    connect
} from 'react-redux'
import got from 'got'

import { resolve } from 'url'

import SMMButton, { COLOR_SCHEME } from '../buttons/SMMButton'
import {
    ScreenSize
} from '../../reducers/mediaQuery'
import {
    domain
} from '../../../static'
import {
    setAccountData
} from '../../actions'

const MAX_LENGTH_USERNAME = 20;

class ProfileView extends React.PureComponent {
    constructor (props) {
        super(props);
        const accountData = props.accountData.toJS();
        this.state = {
            username: !!accountData.username ? accountData.username : '',
            saved: false
        };
        this.onProfileSubmit = this.onProfileSubmit.bind(this);
        this.onUsernameChange = this.onUsernameChange.bind(this);
    }
    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.accountData === this.props.accountData) return;
        const username = nextProps.accountData.toJS().username;
        const accountData = this.props.accountData.toJS();
        if (username === accountData.username) return;
        this.setState({
            username
        });
        if (accountData.id !== nextProps.accountData.toJS().id) return;
        this.setState({
            saved: true
        });
    }
    onProfileSubmit () {
        (async () => {
            if (this.state.username === this.props.accountData.toJS().username) return;
            const profile = {
                username: this.state.username
            };
            const res = (await got(resolve(domain, `/api/setaccountdata?apikey=${this.props.accountData.get('apikey')}`), {
                method: 'POST',
                body: profile,
                json: true
            })).body;
            if (!res.err) {
                this.props.dispatch(setAccountData(res));
            }
        })();
    }
    onUsernameChange (e) {
        let username = e.target.value;
        if (username.length > MAX_LENGTH_USERNAME) {
            username = username.substr(0, MAX_LENGTH_USERNAME);
        }
        this.setState({
            username,
            saved: false
        });
    }
    render () {
        const screenSize = this.props.screenSize;
        const accountData = this.props.accountData.toJS();
        const usernameChanged = accountData.username !== this.state.username;
        const colorScheme = usernameChanged ? COLOR_SCHEME.RED : (this.state.saved ? COLOR_SCHEME.GREEN : COLOR_SCHEME.YELLOW);
        const styles = {
            profile: {
                width: screenSize === ScreenSize.LARGE ? 'calc(100% - 260px)' : '100%',
                height: screenSize === ScreenSize.LARGE ? 'calc(100% - 40px)' : 'auto',
                overflow: 'hidden',
                position: screenSize === ScreenSize.LARGE ? 'absolute' : '',
                zIndex: '10',
                top: screenSize === ScreenSize.LARGE ? '40px' : '',
                left: screenSize === ScreenSize.LARGE ? '140px' : '',
                marginTop: screenSize === ScreenSize.LARGE ? '' : '30px',
                color: '#fff'
            },
            flex: {
                overflow: 'hidden',
                display: screenSize === ScreenSize.LARGE ? 'flex' : 'block',
                flexDirection: screenSize === ScreenSize.LARGE ? 'column' : ''
            },
            option: {
                height: 'auto',
                width: '50%',
                padding: '10px'
            },
            value: {
                height: '32px',
                lineHeight: '32px'
            },
            input: {
                height: '32px',
                fontSize: '18px'
            }
        };
        return (
            <div style={styles.profile}>
                {
                    !!accountData.id ? (
                        <div style={styles.flex}>
                            <div style={styles.option}>
                                <div style={styles.value}>
                                    Username:
                                </div>
                                <input style={styles.input} value={this.state.username} onChange={this.onUsernameChange} />
                            </div>
                            <SMMButton text="Save" iconSrc="/img/profile.png" fontSize="13px" padding="3px" colorScheme={colorScheme} onClick={this.onProfileSubmit} />
                        </div>
                    ) : (
                        <div style={styles.flex}>You are not logged in</div>
                    )
                }
            </div>
        )
    }
}
export default connect(state => ({
    screenSize: state.getIn(['mediaQuery', 'screenSize']),
    accountData: state.getIn(['userData', 'accountData'])
}))(ProfileView)