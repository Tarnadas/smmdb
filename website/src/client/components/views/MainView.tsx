import * as React from 'react'
import { connect } from 'react-redux'

import { SMMButton } from '../buttons/SMMButton'
import { ScreenSize } from '../../reducers/mediaQuery'

class MainView extends React.PureComponent<any, any> {
  public render (): JSX.Element {
    const { screenSize } = this.props
    const styles: any = {
      main: {
        height: '100%',
        padding: screenSize === ScreenSize.SUPER_SMALL ? '6% 5%' : '6% 10%',
        color: '#000',
        display: 'flex',
        flexDirection: 'column',
        overflow: screenSize < ScreenSize.MEDIUM ? 'hidden' : 'auto'
      },
      content: {
        flex: '1 0 auto',
        padding: screenSize === ScreenSize.SUPER_SMALL ? '20px 10px' : '20px',
        fontSize: '16px',
        backgroundColor: 'rgba(59,189,159,1)',
        boxShadow: '0px 0px 10px 10px rgba(59,189,159,1)'
      },
      affiliate: {
        padding: screenSize === ScreenSize.SUPER_SMALL ? '20px 10px' : '20px',
        backgroundColor: 'rgba(59,189,159,1)',
        boxShadow: '0px 0px 10px 10px rgba(59,189,159,1)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        flex: '0 0 auto'
      },
      header: {
        fontSize: '18px',
        padding: '6px 12px',
        width: '100%',
        margin: '20px 0',
        backgroundColor: '#fff8af',
        borderRadius: '6px',
        border: '4px solid #f8ca00',
        boxShadow: '0 0 0 4px black'
      }
    }
    return (
      <div style={styles.main} id="scroll">
        <div style={styles.content}>
          <div style={styles.header}>Welcome to SMMDB!</div>
          SMMDB is the only cross console/emulator sharing platform for Super
          Mario Maker and Super Mario Maker 2 courses.
          <br />
          <br />
          Super Mario Maker 2 courses can finally be uploaded as well!
          <br />
          <br />
          Supported platforms for Super Mario Maker 1 are Wii U, 3DS and Cemu.
          SMMDB can be used as a compatibility layer between those platform. It
          enriches .. especially for platforms with minor support from Nintendo,
          which includes 3DS and emulators.
          <br />
          Super Mario Maker for 3DS has no option to search for courses. Several
          Wii U courses can&#39;t even be played on 3DS because of
          incompatibility. SMMDB will let you search for courses and tries to
          convert incompatible courses as good as possible. For Cemu, a Wii U
          emulator, there is even a save file editor. Just navigate to
          &#39;Client&#39;.
          <br />
          <br />
          SMMDB also features courses for Super Mario 64 Maker, a popular ROM
          hack by Kaze Emanuar.
          <br />
          <br />
          To use all features on this website it is recommended to sign in with
          Google.
          <br />
          <br />
          All content on this website is user-created. We do not share any
          copyrighted stuff.
        </div>
        <div style={styles.affiliate}>
          <div style={styles.header}>Affiliates</div>
          <SMMButton
            link="https://net64-mod.github.io"
            blank
            text="Net64 Website"
            iconSrc="/img/net64.svg"
            iconColor="bright"
          />
          <SMMButton
            link="http://mariomods.net/"
            blank
            text="Mario Making Mods"
            iconSrc="/img/MMM.png"
            iconColor="bright"
            noText
          />
          <SMMButton
            link="http://sm64hacks.com/"
            blank
            text="Super Mario 64 Hacks"
            iconSrc="/img/sm64hacks.png"
            iconColor="bright"
            noText
          />
          <SMMButton
            link="https://smmserver.github.io/"
            blank
            text="SmmServer"
            iconSrc="/img/smmserver.png"
            iconColor="bright"
            noText
          />
        </div>
      </div>
    )
  }
}
export default connect(
  (state: any): any => ({
    screenSize: state.getIn(['mediaQuery', 'screenSize'])
  })
)(MainView)
