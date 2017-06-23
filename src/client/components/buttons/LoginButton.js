import React       from 'react'
import GoogleLogin from 'react-google-login'
import request     from 'request-promise'
import {
    connect
} from 'react-redux'

import { resolve } from 'url'

import ButtonSub from '../subs/ButtonSub'
import {
    setAccountData
} from '../../actions'
import { domain } from '../../../static'

class LoginButton extends React.PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            hover: false
        };
        this.mouseEnter = this.mouseEnter.bind(this);
        this.mouseLeave = this.mouseLeave.bind(this);
        this.onGoogleLoginSuccess = this.onGoogleLoginSuccess.bind(this);
        this.onGoogleLoginFailure = this.onGoogleLoginFailure.bind(this);
        this.onLogOut = this.onLogOut.bind(this);
    }
    componentDidMount () {
        (async () => {
            let res = await request({
                method: 'POST',
                uri: resolve(domain, '/signin'),
                json: true
            });
            if (!res.err) {
                setTimeout(() => { // TODO this is just a workaround to prevent a warning
                    this.props.dispatch(setAccountData(res));
                }, 1000);
            }
        })();
    }
    mouseEnter() {
        this.setState({
            hover: true
        });
    }
    mouseLeave() {
        this.setState({
            hover: false
        });
    }
    async onGoogleLoginSuccess (response) {
        let res = await request({
            method: 'POST',
            uri: resolve(domain, '/tokensignin'),
            body: response,
            json: true
        });
        this.props.dispatch(setAccountData(res));
    }
    onGoogleLoginFailure (response) {
        console.log(response);
    }
    async onLogOut () {
        let res = await request({
            method: 'POST',
            uri: resolve(domain, '/signout'),
            json: true
        });
        if (!res.err) {
            this.props.dispatch(setAccountData());
        } else {
            console.log(res.err);
        }
    }
    render () {
        const accountData = this.props.accountData.toJS();
        const loggedIn = !!accountData.id;
        const styles = {
            smmButton: {
                margin: '0 10px 10px 10px',
                lineHeight: '40px',
                width: '120px',
                height: '40px',
                backgroundColor: this.state.hover ? '#323245' : '#ffe500',
                color: this.state.hover ? '#fff' : '#323245',
                cursor: 'pointer',
                outline: 'none',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                border: '0',
                borderRadius: '5px',
                boxShadow: '1px 4px 13px 0 rgba(0,0,0,0.5)',
                padding: '0',
                textAlign: 'left',
                fontFamily: 'SuperMarioMakerExtended,SuperMarioMaker,Roboto,arial,sans-serif'
            },
            smmIcon: {
                margin: '4px',
                width: '32px',
                height: '32px',
                float: 'left',
                borderRadius: '4px'
            }
        };
        let iconSrc, text;
        if (loggedIn) {
            iconSrc = '/img/logout.png';
            text = 'Sign out';
        } else {
            iconSrc = '//developers.google.com/identity/sign-in/g-normal.png';
            text = 'Sign in';
        }
        return (
            <div style={{float:'right'}} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
                {
                    loggedIn ? (
                        <div style={styles.smmButton} onClick={this.onLogOut}>
                            <ButtonSub iconStyle={styles.smmIcon} iconSrc={iconSrc} text={text} />
                        </div>
                    ) : (
                        <GoogleLogin
                            clientId="899493559187-bnvgqj1i8cnph7ilkl4h261836skee25.apps.googleusercontent.com"
                            style={styles.smmButton}
                            onSuccess={this.onGoogleLoginSuccess}
                            onFailure={this.onGoogleLoginFailure}
                        >
                            <ButtonSub iconStyle={styles.smmIcon} iconSrc={iconSrc} text={text} />
                        </GoogleLogin>
                    )
                }
            </div>
        )
    }
}
export default connect(state => {
    const accountData = state.getIn(['userData', 'accountData']);
    return {
        accountData
    }
})(LoginButton);