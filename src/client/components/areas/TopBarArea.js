import React from 'react'
import GoogleLogin from 'react-google-login'
import request from 'request-promise'

export default class TopBarArea extends React.PureComponent{
    constructor (props) {
        super(props);
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
        console.log(res)
    }
    onGoogleLoginFailure (response) {
        console.log(response);
    }
    render () {
        const styles = {
            topbar: {
                height: '50px',
                padding: '10px',
                marginBottom: '20px'
            },
            topbarElement: {
                margin: '0 10px',
                lineHeight: '40px',
                width: '120px',
                height: '40px',
                backgroundColor: '#ffe500',
                color: '#323245',
                cursor: 'pointer',
                outline: 'none',
                overflow: 'hidden',
                position: 'relative',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                border: '0',
                borderRadius: '5px',
                boxShadow: '1px 4px 13px 0 rgba(0,0,0,0.5)'
            },
            smmIcon: {
                margin: '4px',
                width: '32px',
                height: '32px',
                float: 'left',
                borderRadius: '4px'
            },
            smmIconDark: {
                margin: '4px',
                width: '32px',
                height: '32px',
                float: 'left',
                borderRadius: '4px',
                backgroundColor: 'rgb(50, 50, 69)'
            },
            img: {
                width: '100%',
                height: '100%'
            }
        };
        const topbarElementLeft = Object.assign({}, styles.topbarElement, { float: 'left' });
        const topbarElementRight = Object.assign({}, styles.topbarElement, { float: 'right', padding: '0', textAlign: 'left', fontFamily: 'SuperMarioMakerExtended,SuperMarioMaker,Roboto,arial,sans-serif' });
        return (
            <div style={styles.topbar}>
                <GoogleLogin
                    clientId="899493559187-bnvgqj1i8cnph7ilkl4h261836skee25.apps.googleusercontent.com"
                    style={topbarElementRight}
                    onSuccess={this.onGoogleLoginSuccess}
                    onFailure={this.onGoogleLoginFailure}
                >
                    <div style={styles.smmIcon}>
                        <img src="//developers.google.com/identity/sign-in/g-normal.png" />
                    </div>
                    <div>Sign In</div>
                </GoogleLogin>
                <div style={topbarElementRight}>
                    <div style={styles.smmIcon}>
                        <img style={styles.img} src="/img/logout.png" />
                    </div>
                    <div>Sign out</div>
                </div>
                <div style={topbarElementLeft}>
                    <div style={styles.smmIconDark}>
                        <img style={styles.img} src="/img/courses.png" />
                    </div>
                    <div>Courses</div>
                </div>
                <div style={topbarElementLeft}>
                    <div style={styles.smmIconDark}>
                        <img style={styles.img} src="/img/upload.png" />
                    </div>
                    <div>Upload</div>
                </div>
                <div style={topbarElementLeft}>
                    <div style={styles.smmIconDark}>
                        <img style={styles.img} src="/img/profile.png" />
                    </div>
                    <div>Profile</div>
                </div>
                <div style={topbarElementLeft}>
                    <div style={styles.smmIconDark}>
                        <img style={styles.img} src="/img/api.png" />
                    </div>
                    <div>API</div>
                </div>
                <a href="https://github.com/Tarnadas/cemu-smmdb/releases" target="__blank">
                    <div style={topbarElementLeft}>
                        <div style={styles.smmIconDark}>
                            <img style={styles.img} src="/img/client.png" />
                        </div>
                        <div>Client</div>
                    </div>
                </a>
                <a href="https://www.reddit.com/r/CemuMarioMaker" target="__blank">
                    <div style={topbarElementLeft}>
                        <div style={styles.smmIconDark}>
                            <img style={styles.img} src="/img/reddit.png" />
                        </div>
                        <div>Reddit</div>
                    </div>
                </a>
                <a href="https://discord.gg/0wURURBfQTrjAXqh" target="__blank">
                    <div style={topbarElementLeft}>
                        <div style={styles.smmIconDark}>
                            <img style={styles.img} src="/img/discord.png" />
                        </div>
                        <div>Discord</div>
                    </div>
                </a>
            </div>
        );
    }
}