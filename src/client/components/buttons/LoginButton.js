import React       from 'react'
import GoogleLogin from 'react-google-login'
import request     from 'request-promise'

import ButtonSub from '../subs/ButtonSub'

export default class LoginButton extends React.PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            loggedIn: false
        };
        this.onGoogleLoginSuccess = this.onGoogleLoginSuccess.bind(this);
        this.onGoogleLoginFailure = this.onGoogleLoginFailure.bind(this);
    }
    async onGoogleLoginSuccess (response) {
        let res = await request({
            method: 'POST',
            uri: 'http://tarnadas.ddns.net/tokensignin',
            body: response,
            json: true
        });
        console.log(res);
    }
    onGoogleLoginFailure (response) {
        console.log(response);
    }
    render () {
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
                position: 'relative',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                border: '0',
                borderRadius: '5px',
                boxShadow: '1px 4px 13px 0 rgba(0,0,0,0.5)',
                float: 'right',
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
        if (this.state.loggedIn) {
            iconSrc = '/img/logout.png';
            text = 'Sign out';
        } else {
            iconSrc = '//developers.google.com/identity/sign-in/g-normal.png';
            text = 'Sign in';
        }
        return (
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
}