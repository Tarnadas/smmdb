import React from 'react'
import {
    Link
} from 'react-router-dom'

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
                backgroundColor: this.state.hover ? '#323245' : '#ffe500',
                cursor: 'pointer',
                outline: 'none',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                border: '0',
                borderRadius: '5px',
                boxShadow: '1px 4px 13px 0 rgba(0,0,0,0.5)',
                display: 'inline-block',
                fontSize: !!this.props.fontSize ? this.props.fontSize : ''
            },
            smmIcon: {
                margin: '4px',
                width: '32px',
                height: '32px',
                float: 'left',
                borderRadius: '4px',
                padding: !!this.props.padding ? this.props.padding : ''
            },
            smmIconDark: {
                margin: '4px',
                width: '32px',
                height: '32px',
                float: 'left',
                borderRadius: '4px',
                backgroundColor: 'rgb(50, 50, 69)',
                padding: !!this.props.padding ? this.props.padding : ''
            },
            smmIconHover: {
                margin: '4px',
                width: '32px',
                height: '32px',
                float: 'left',
                borderRadius: '4px',
                backgroundColor: '#000',
                padding: !!this.props.padding ? this.props.padding : ''
            }
        };
        const iconStyle = this.props.iconColor === 'bright' ? styles.smmIcon : (this.state.hover ? styles.smmIconHover : styles.smmIconDark);
        const text = this.props.text;
        return (
            <div style={styles.smmButton}
                 onMouseEnter={this.mouseEnter}
                 onMouseLeave={this.mouseLeave}
                 onClick={this.props.onClick ? this.props.onClick : null}
            >
                {
                    !!this.props.link ? (
                        !!this.props.blank ? (
                            <a href="https://github.com/Tarnadas/smmdb" target="__blank">
                                <ButtonSub iconStyle={iconStyle} iconSrc={this.props.iconSrc} text={text} hover={this.state.hover} />
                            </a>
                        ) : (
                            <Link to={this.props.link}>
                                <ButtonSub iconStyle={iconStyle} iconSrc={this.props.iconSrc} text={text} hover={this.state.hover} />
                            </Link>
                        )
                    ) : (
                        <ButtonSub iconStyle={iconStyle} iconSrc={this.props.iconSrc} text={text} hover={this.state.hover} />
                    )
                }
            </div>
        )
    }
}