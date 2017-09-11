import React from 'react'
import {
  connect
} from 'react-redux'

import {
  ScreenSize
} from '../../reducers/mediaQuery'

class FAQView extends React.PureComponent {
  render () {
    const screenSize = this.props.screenSize
    const styles = {
      faq: {
        width: '100%',
        height: '100%',
        padding: '3% 5%',
        color: '#000',
        display: 'flex',
        textAlign: 'left',
        flexDirection: 'column'
      },
      content: {
        flex: '1 0 0%',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: screenSize === ScreenSize.SUPER_SMALL ? '20px 10px' : '20px',
        fontSize: '16px',
        backgroundColor: 'rgba(59,189,159,1)',
        boxShadow: '0px 0px 10px 10px rgba(59,189,159,1)',
        overflow: screenSize < ScreenSize.MEDIUM ? 'hidden' : 'auto'
      },
      question: {
        width: '100%',
        margin: '6px 0',
        fontSize: '18px',
        padding: '6px 12px',
        backgroundColor: '#fff8af',
        borderRadius: '6px',
        border: '4px solid #f8ca00',
        boxShadow: '0 0 0 4px black'
      },
      answer: {
        width: '100%',
        margin: '10px 0 26px 0',
        fontSize: '14px',
        lineHeight: '20px'
      }
    }
    return (
      <div style={styles.faq}>
        <div style={styles.content} id='scroll'>
          <div style={styles.question}>
            How do I use the website with my Wii U?
          </div>
          <div style={styles.answer}>
            Unfortunately there is currently no easy solution for Wii U. However you can export your Super Mario Maker save file with the Homebrew app Saviine.<br />
            You can then use <a href='https://github.com/Tarnadas/cemu-smmdb/releases'>Cemu SMMDB</a> to edit your save save file and reimport it to your Wii U with the Homebrew app Loadiine.
          </div>
          <div style={styles.question}>
            How do I use the website with my 3DS?
          </div>
          <div style={styles.answer}>
            You need Homebrew on your 3DS. You also need the Homebrew app <a href='https://github.com/MarcuzD/OCDM'>OCDM</a>.
            We also recommend using <a href='https://github.com/Pirater12/Multidownload/releases'>Multidownload++</a> for simple QR Code downloads.<br /><br />
            To import courses you can simply use your 3DS to scan the QR Code provided for every course. OCDM can then import courses from your SD Card.<br />
            Exporting is also done with OCDM.
            Exported courses can be easily uploaded on the website, but you would need to transfer your exported course to an external device, because the website does not support the in-built 3DS web browser.
            You can then just upload the raw file without wrapping it in a compressed format.
          </div>
          <div style={styles.question}>
            How do I use the website with Cemu?
          </div>
          <div style={styles.answer}>
            Just download <a href='https://github.com/Tarnadas/cemu-smmdb/releases'>Cemu SMMDB</a>, open it and select your Super Mario Maker save folder.
            It is contained in your Cemu folder under \mlc01\emulatorSave\#saveID#.
            You get your saveID by starting Super Mario Maker with Cemu. It is then displayed on the bordered window, but typically it is 44fc5929.<br />
            Downloading with Cemu SMMDB is self explaining.
            To upload a course you would have to navigate to your Super Mario Maker save folder and compress the respective course folder (named course###) in any compressible format.<br /><br />
            <a href='https://youtu.be/wF2f2ScIZUY' target='_blank'>If you prefer a video, one of our users made a tutorial.</a>
          </div>
          <div style={styles.question}>
            What is Super Mario 64 Maker (SM64M)?
          </div>
          <div style={styles.answer}>
            SM64M is a popular Super Mario 64 ROM hack by <a href='https://www.youtube.com/user/KazeBG0'>Kaze</a>.
            You can basically create your own level in Super Mario 64 with 3D building blocks and enemies.
          </div>
          <div style={styles.question}>
            How do I use the website with SM64M?
          </div>
          <div style={styles.answer}>
            For a basic tutorial on how to use SM64M in general, watch <a href='https://youtu.be/XNZk4ggJkcc'>this video</a>.<br />
            You use save states in your emulator to save your current course. You can then just upload the zip file containing the save state.<br />
            Downloaded courses can be loaded with the emulator's load state function.
          </div>
          <div style={styles.question}>
            I have a question which has not been answered in the FAQ
          </div>
          <div style={styles.answer}>
            Visit us on <a href='https://discord.gg/SPZsgSe'>Discord</a>.
          </div>
        </div>
      </div>
    )
  }
}
export default connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(FAQView)
