import React from 'react'
import { connect } from 'react-redux'

import { setVideoId } from '../../actions'
import { ScreenSize } from '../../reducers/mediaQuery'

class CourseVideoButton extends React.PureComponent {
  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
  }
  onClick () {
    if (this.props.screenSize > ScreenSize.SMALL) {
      this.props.dispatch(setVideoId(this.props.videoId))
    }
  }
  render () {
    const screenSize = this.props.screenSize
    const styles = {
      button: {
        backgroundColor: '#11c2b0',
        color: '#fff',
        borderRadius: '5px',
        border: screenSize >= ScreenSize.MEDIUM ? '8px solid #0f9989' : '4px solid #0f9989',
        height: screenSize >= ScreenSize.MEDIUM ? '180px' : 'auto',
        width: '100%',
        margin: '0px 5px 10px 5px',
        boxShadow: '0px 5px 0px 0px rgba(0,0,0,0.4)',
        cursor: 'pointer',
        padding: '0 10px',
        flex: '1 0 0%'
      },
      icon: {
        maxHeight: '110px',
        height: 'auto',
        width: 'auto',
        display: 'block'
      },
      iconImg: {
        width: 'auto',
        height: screenSize >= ScreenSize.MEDIUM ? '100%' : '80px'
      },
      text: {
        height: screenSize >= ScreenSize.MEDIUM ? '70px' : 'auto',
        width: screenSize >= ScreenSize.MEDIUM ? '100%' : 'auto',
        minWidth: screenSize >= ScreenSize.MEDIUM ? '' : '90px',
        margin: screenSize >= ScreenSize.MEDIUM ? '' : '3px 0',
        lineHeight: screenSize >= ScreenSize.MEDIUM ? '70px' : '',
        fontSize: screenSize >= ScreenSize.MEDIUM ? '24px' : '16px'
      }
    }
    const Wrapper = screenSize > ScreenSize.SMALL
    ? props => (
      <div style={styles.button} onClick={this.onClick}>
        { props.children }
      </div>
    ) : props => (
      <a style={styles.button} href={`https://youtu.be/${this.props.videoId}`} target='_blank'>
        { props.children }
      </a>
    )
    return (
      <Wrapper>
        <div style={styles.icon}>
          <img style={styles.iconImg} src='/img/play.png' />
        </div>
        <div style={styles.text}>
          Video
        </div>
      </Wrapper>
    )
  }
}
export default connect()(CourseVideoButton)
