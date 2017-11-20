import React from 'react'

const SAVE_FOLDER_VIEW = 0
// const SMMDB_VIEW = 1

export default class ChangeViewButton extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      hover: false
    }
    this.onMouseOver = this.onMouseOver.bind(this)
    this.onMouseLeave = this.onMouseLeave.bind(this)
  }
  onMouseOver () {
    this.setState({
      hover: true
    })
  }
  onMouseLeave () {
    this.setState({
      hover: false
    })
  }
  render () {
    const hover = this.state.hover
    const styles = {
      outer: {
        display: 'flex',
        margin: '14px',
        zIndex: '10',
        height: '32px',
        backgroundColor: '#fff',
        borderRadius: '4px',
        boxSizing: 'border-box',
        textAlign: 'center',
        color: '#fff',
        cursor: 'pointer',
        boxShadow: hover ? '3px 6px 3px -2px rgba(0,0,0,1)' : '3px 3px 3px -2px rgba(0,0,0,1)',
        transition: 'transform 0.5s, box-shadow 0.5s',
        transform: hover ? 'translateY(-3px)' : ''
      },
      inner: {
        margin: '4px',
        float: 'left',
        width: '160px',
        height: '24px',
        lineHeight: '24px',
        backgroundColor: '#685d8c',
        boxSizing: 'border-box',
        borderRadius: '2px'
      },
      divImg: {
        width: '32px',
        height: '32px'
      },
      divImgInner: {
        margin: '4px 4px 0 0',
        borderRadius: '12px',
        width: '24px',
        height: '24px',
        boxSizing: 'border-box',
        backgroundColor: '#e4e6e4'
      },
      img: {
        width: '16px',
        height: '16px',
        marginTop: '5px'
      }
    }
    return (
      <div
        style={styles.outer}
        onClick={this.props.onClick}
        onMouseOver={this.onMouseOver}
        onMouseLeave={this.onMouseLeave}
      >
        <div style={styles.inner}>
          {
            this.props.view === SAVE_FOLDER_VIEW ? 'MY COURSES' : 'SMMDB COURSES'
          }
        </div>
        <div style={styles.divImg}>
          <div style={styles.divImgInner}>
            <img style={styles.img} src='/img/arrow_down.svg' />
          </div>
        </div>
      </div>
    )
  }
}
