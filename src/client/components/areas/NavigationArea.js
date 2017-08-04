import React from 'react'

import NavigationButton from '../buttons/NavigationButton'

export default class NavigationArea extends React.PureComponent {
  render () {
    const display = this.props.display
    const styles = {
      navigation: {
        display: display ? 'flex' : 'none',
        width: 'auto',
        minWidth: '200px',
        height: 'auto',
        position: 'absolute',
        top: '40px',
        left: '10px',
        flexDirection: 'column'
      }
    }
    return (
      <div style={styles.navigation}
        onMouseEnter={this.props.onMouseEnter}
        onMouseLeave={this.props.onMouseLeave}
      >
        <NavigationButton onClick={this.props.onClick} link='/' text='Courses' iconSrc='/img/courses.png' iconColor='dark' />
        <NavigationButton onClick={this.props.onClick} link='/upload' text='Upload' iconSrc='/img/upload.png' iconColor='dark' />
        <NavigationButton onClick={this.props.onClick} link='/profile' text='Profile' iconSrc='/img/profile.png' iconColor='dark' />
        {
          !process.env.ELECTRON &&
          <NavigationButton onClick={this.props.onClick} link='https://github.com/Tarnadas/smmdb' blank text='API' iconSrc='/img/api.png' iconColor='dark' />
        }
        {
          !process.env.ELECTRON && (
          <NavigationButton onClick={this.props.onClick} link='https://github.com/Tarnadas/cemu-smmdb/releases' blank text='Client' iconSrc='/img/client.png' iconColor='dark' />
        )
        }
        {
          !process.env.ELECTRON &&
          <NavigationButton onClick={this.props.onClick} link='https://www.reddit.com/r/CemuMarioMaker' blank text='Reddit' iconSrc='/img/reddit.png' iconColor='dark' />
        }
        {
          !process.env.ELECTRON &&
          <NavigationButton onClick={this.props.onClick} link='https://discord.gg/SPZsgSe' blank text='Discord' iconSrc='/img/discord.png' iconColor='dark' />
        }
      </div>
    )
  }
}
