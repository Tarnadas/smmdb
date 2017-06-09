import React from 'react'

import ButtonSub from '../subs/ButtonSub'

export default class SMMButton extends React.PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            hover: false
        };
        this.mouseEnter = this.mouseEnter.bind(this);
        this.mouseLeave = this.mouseLeave.bind(this);
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
    render () {
        const styles = {
            smmButton: {
                margin: '0 10px 10px 10px',
                lineHeight: '40px',
                width: '120px',
                height: '40px',
                backgroundColor: this.state.hover ? '#ffe500' : '#ffe500',
                color: this.state.hover ? '#323245' : '#323245',
                cursor: 'pointer',
                outline: 'none',
                overflow: 'hidden',
                position: 'relative',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                border: '0',
                borderRadius: '5px',
                boxShadow: '1px 4px 13px 0 rgba(0,0,0,0.5)',
                //float: 'left'
                display: 'inline-block'
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
            smmIconHover: {
                margin: '4px',
                width: '32px',
                height: '32px',
                float: 'left',
                borderRadius: '4px',
                backgroundColor: '#000'
            }
        };
        const iconStyle = this.props.iconColor === 'bright' ? styles.smmIcon : (this.state.hover ? styles.smmIconHover : styles.smmIconDark);
        const text = this.props.text;
        return (
            <div style={styles.smmButton}>
                <ButtonSub iconStyle={iconStyle} iconSrc={this.props.iconSrc} text={text} />
            </div>
        )
    }
}