import React from 'react'

export default class ButtonSub extends React.PureComponent {
    render () {
        const styles = {
            img: {
                width: '100%',
                height: '100%'
            }
        };
        return (
            <div>
                <div style={this.props.iconStyle}>
                    <img style={styles.img} src={this.props.iconSrc} />
                </div>
                <div>{this.props.text}</div>
            </div>
        )
    }
}