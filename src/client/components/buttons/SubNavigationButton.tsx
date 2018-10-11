import * as React from 'react'
import { Link } from 'react-router-dom'

export class SubNavigationButton extends React.PureComponent<any, any> {
  public constructor (props: any) {
    super(props)
    this.state = {
      hover: false
    }
    this.onMouseEnter = this.onMouseEnter.bind(this)
    this.onMouseLeave = this.onMouseLeave.bind(this)
  }

  private onMouseEnter (): void {
    this.setState({
      hover: true
    })
  }

  private onMouseLeave (): void {
    this.setState({
      hover: false
    })
  }

  public render (): JSX.Element {
    const { hover } = this.state
    const styles: any = {
      button: {
        width: 'auto',
        height: '32px',
        minHeight: '32px',
        lineHeight: '32px',
        backgroundColor: hover ? '#ffd800' : 'rgba(255,229,0,0.7)',
        boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
        cursor: 'pointer',
        overflow: 'hidden',
        marginLeft: '20px'
      },
      icon: {
        margin: '4px',
        width: '24px',
        height: '24px',
        float: 'left',
        padding: '4px'
      },
      img: {
        width: '100%',
        height: '100%'
      },
      text: {
        color: '#323245',
        float: 'left',
        width: 'auto',
        paddingRight: '5px'
      }
    }
    const content = (
      <div>
        <div style={styles.icon}>
          <img style={styles.img} src={this.props.iconSrc} />
        </div>
        <div style={styles.text}>
          { this.props.text }
        </div>
      </div>
    )
    return (
      <div
        style={styles.button}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onClick={this.props.onClick}
      >
        {
          this.props.blank ? (
            <a href={this.props.link} target='__blank'>
              { content }
            </a>
          ) : (
            <Link to={this.props.link}>
              { content }
            </Link>
          )
        }
      </div>
    )
  }
}
