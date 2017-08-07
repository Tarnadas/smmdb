import React from 'react'

export default class MainView extends React.PureComponent {
  render () {
    const styles = {
      main: {
        display: 'flex'
      }
    }
    return (
      <div style={styles.main}>
        Welcome to Super Mario Maker Database!
        This is a website solely for the purpose to share Super Mario Maker courses platform independently.
        It doesn't matter if you want to use courses on this website for Wii U, 3DS or an emulator. All platforms are supported.
        To use all features on this website it is recommended to sign in with Google.
        All shared content on this website is user-created. We do not share any copyrighted stuff.
      </div>
    )
  }
}
