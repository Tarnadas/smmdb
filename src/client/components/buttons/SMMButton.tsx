import * as React from 'react'
import { Link } from 'react-router-dom'

import ButtonSub from '../subs/ButtonSub'

export const COLOR_SCHEME = {
  YELLOW: 0,
  GREEN: 1,
  RED: 2
}

export class SMMButton extends React.PureComponent<any, any> {
  constructor (props: any) {
    super(props)
    this.state = {
      hover: false,
      deleteHover: false
    }
    this.mouseEnter = this.mouseEnter.bind(this)
    this.mouseLeave = this.mouseLeave.bind(this)
    this.deleteEnter = this.deleteEnter.bind(this)
    this.deleteLeave = this.deleteLeave.bind(this)
    this.onDelete = this.onDelete.bind(this)
  }
  mouseEnter () {
    this.setState({
      hover: true
    })
    if (this.props.onMouseEnter) this.props.onMouseEnter()
  }
  mouseLeave () {
    this.setState({
      hover: false
    })
    if (this.props.onMouseLeave) this.props.onMouseLeave()
  }
  deleteEnter () {
    this.setState({
      deleteHover: true
    })
  }
  deleteLeave () {
    this.setState({
      deleteHover: false
    })
  }
  onDelete (e: any) {
    e.stopPropagation()
    this.props.onDelete(this.props.saveId)
  }
  render () {
    const colorScheme = this.props.colorScheme || COLOR_SCHEME.YELLOW
    const onDelete = this.props.onDelete
    const styles: any = {
      smmButton: {
        margin: this.props.noMargin ? '' : '0 10px 10px 10px',
        lineHeight: '40px',
        minWidth: '120px',
        width: 'auto',
        height: '40px',
        backgroundColor: colorScheme === COLOR_SCHEME.YELLOW ? (
          this.state.deleteHover ? (
            '#cc0008'
          ) : (
            this.state.hover ? '#323245' : '#ffe500'
          )
        ) : (
          colorScheme === COLOR_SCHEME.GREEN ? (
            this.state.hover ? '#323245' : '#33cc33'
          ) : (
            this.state.hover ? '#323245' : '#CC7034'
          )
        ),
        textAlign: 'left',
        cursor: 'pointer',
        outline: 'none',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        border: '0',
        borderRadius: '5px',
        boxShadow: '1px 4px 13px 0 rgba(0,0,0,0.5)',
        display: 'inline-block',
        fontSize: this.props.fontSize ? this.props.fontSize : ''
      },
      smmIcon: {
        margin: '4px',
        width: this.props.noText ? 'auto' : '32px',
        height: '32px',
        float: 'left',
        borderRadius: '4px',
        padding: this.props.padding ? this.props.padding : ''
      },
      smmIconDark: {
        margin: '4px',
        width: this.props.noText ? 'auto' : '32px',
        height: '32px',
        float: 'left',
        borderRadius: '4px',
        backgroundColor: 'rgb(50, 50, 69)',
        padding: this.props.padding ? this.props.padding : ''
      },
      smmIconHover: {
        margin: '4px',
        width: '32px',
        height: '32px',
        float: 'left',
        borderRadius: '4px',
        backgroundColor: '#000',
        padding: this.props.padding ? this.props.padding : ''
      },
      cancel: {
        right: '3px',
        top: '-3px',
        width: '34px',
        height: '34px',
        borderRadius: '3px',
        backgroundColor: '#f4f47b',
        zIndex: '100'
      },
      cancelImg: {
        padding: '3px',
        width: '100%',
        height: '100%'
      }
    }
    const iconStyle = this.props.iconColor === 'bright'
      ? styles.smmIcon
      : (this.state.hover ? styles.smmIconHover : styles.smmIconDark)
    const text = this.props.text
    return (
      <div style={styles.smmButton}
        onMouseEnter={this.mouseEnter}
        onMouseLeave={this.mouseLeave}
        onClick={this.props.onClick ? this.props.onClick : null}
      >
        {
          this.props.link ? (
            this.props.blank ? (
              <a href={this.props.link} target='_blank'>
                <ButtonSub
                  iconStyle={iconStyle}
                  iconSrc={this.props.iconSrc}
                  text={text}
                  hover={this.state.hover}
                  noText={this.props.noText}
                />
              </a>
            ) : (
              <Link to={this.props.link}>
                <ButtonSub
                  iconStyle={iconStyle}
                  iconSrc={this.props.iconSrc}
                  text={text}
                  hover={this.state.hover}
                  noText={this.props.noText}
                />
              </Link>
            )
          ) : (
            <ButtonSub
              iconStyle={iconStyle}
              iconSrc={this.props.iconSrc}
              text={text}
              hover={this.state.hover}
              noText={this.props.noText}
            />
          )
        }
        {
          onDelete &&
          <div
            style={styles.cancel}
            onClick={this.onDelete}
            onMouseEnter={this.deleteEnter}
            onMouseLeave={this.deleteLeave}
          >
            <img style={styles.cancelImg} src='/img/cancel_yellow.svg' />
          </div>
        }
      </div>
    )
  }
}
