import * as React from 'react'
import { connect } from 'react-redux'

import { SMMButton } from '../buttons/SMMButton'
import { StatsPanel } from '../panels/StatsPanel'
import { ScreenSize } from '../../reducers/mediaQuery'

class MainView extends React.PureComponent<any, any> {
  public render (): JSX.Element {
    const { screenSize } = this.props
    const styles: any = {
      main: {
        padding: screenSize === ScreenSize.SUPER_SMALL ? '2rem 5%' : '2rem 10%',
        color: '#000',
        display: 'flex',
        flexDirection: 'column'
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
      <React.Fragment>
        <StatsPanel />
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
            SMMDB can be used as a compatibility layer between those platform.
            It enriches gameplay especially for platforms with minor support
            from Nintendo, which includes 3DS and emulators.
            <br />
            Super Mario Maker for 3DS has no option to search for courses.
            Several Wii U courses can&#39;t even be played on 3DS because of
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
            To use all features on this website it is recommended to sign in
            with Google.
            <br />
            <br />
            All content on this website is user-created. We do not share any
            copyrighted stuff.
          </div>
          <div style={{...styles.content, textAlign: 'left', fontSize: '1.1rem'}}>
            <div style={{...styles.header, textAlign: 'center'}}>My future plans of development</div>
            Hi, my name is Mario!<br /><br />
            I'm a software engineer with a passion for my side projects.
            This is also why SMMDB and Net64 exist now for several years and are still in use.<br /><br />
            The idea I initially had when I started 2017 with SMMDB was to make Super Mario Maker usable on emulators,
            but I soon had the idea of making it playable in your browser.
            With modern HTML5 technologies it is nowadays possible to create games with near native performance.
            These technologies specifically are WebAssembly and WebGL/WebGPU.
            As a developer with a background mainly in frontend development and due to my love for performance,
            I started experimenting early with these technologies and soon became interested in the
            {' '}<a href="https://www.rust-lang.org/" target="_blank">Rust programming language</a>.
            Learning Rust filled me with joy, which I have never felt using another language,
            {' '}<a href="https://fewbar.com/2017/01/a-love-letter-to-rust/" target="_blank">but let's keep it like that</a>.
            <br /><br />
            Since the Rust gaming ecosystem was still relatively immature at the time,
            I postponed the idea and devoted myself to other projects, namely
            {' '}<a href="https://net64-mod.github.io/" target="_blank">Net64+</a> and afterwards
            {' '}<a href="https://sm64js.com/" target="_blank">sm64js</a>.
            In the meantime Super Mario Maker 2 came out,
            so I was thrilled to work on SMMDB again and implement proper support for it.
            Since the Switch console was selling much better than the Wii U,
            this also flourished the homebrew ecosystem and other people almost had everything reverse engineered,
            that I needed to know.
            <br /><br />
            After waiting for several years now it is time to move forward and do what I wanted to do
            and this is why I start a new project called
            {' '}<a href="https://shroomkingdom.net/" target="_blank">Shroom Kingdom</a>.
            If you go to the website, the first thing that will catch your attention will be the blockchain integration.
            Several people have already told me, that this is not a good idea and actively tried to stop me.
            I think this comes from a misinformation about blockchain in general.
            Many people try to stop what blockchain stands for and if you don't take a deeper look into the technology,
            you can soon develop a bad attitude towards blockchain.
            What people most refer to is the immense amount of energy the blockchain requires to operate.
            This is however only true for blockchains that use Proof of Work (PoW) as its consensus algorithm.
            I have also the opinion, that PoW can be easily abused and hard to regulate where the energy that flows in comes from.
            However there are other consensus algorithms, that don't have these problems like Proof of Stake.
            This is one reason why I chose
            {' '}<a href="https://near.org/" target="_blank">NEAR Protocol</a> as my favority blockchain platform.
            <br /><br />
            Another argument that gets mentioned often is that Non Fungible Tokens (NFTs) are bad.
            No one could tell me why though and all I can tell you is that NFTs are literally just arbitrary data
            stored on the blockchain.
            What you want to do with that data depends on the platform,
            but most people use it to store and share art.
            The biggest benefit that NFTs give you is true ownership of an asset.
            This also makes it possible to add utility to your NFTs,
            e.g. imagine an RPG game where every piece of armor you acquire is actually an NFT on the blockchain.
            The NFT would directly impact the game itself and this is what most projects in blockchain gaming do.
            Blockchain gaming is booming in general, which is also why js13kGames added a
            {' '}<a href="https://twitter.com/js13kGames/status/1420791235158151175" target="_blank">decentralized category</a>.
            In the case of Shroom Kingdom every level is an NFT.
            The utility that gets provided is that you can play it.
            Levels will have even more utilities, but the details have yet to be determined.
            <br /><br />
            NEAR Protocol or blockchain in general also allows me to get the funding that I need to work on this.
            So this started another argument about how I earn money from an intellectual property which is not mine.
            To be able to play on Shroom Kingdom, you will need game assets from Super Mario Maker 2.
            This can be done by dumping game files from a real console and extract the required assets.
            I don't want to encourage people to pirate the game to be able to play on Shroom Kingdom,
            which is why I will also implement support for game mods.
            There is a huge amount of custom assets, that can instead be used, if you don't own the game and the console.
            Even though the analogies are obvious, I will not use any copyrighted content.
            <br /><br />
            Shroom Kingdom will be a so called play-to-earn game.
            At first it sounds intriguous, but in fact it is again the blockchain that enables this new kind of games.
            By participating in the game, you will earn a Fungible Token called $SHRM,
            which you can exchange for other tokens or real world money.
            The $SHRM token would not have any value except using it as a currency, if it would not have a utility in-game,
            so $SHRM will be used to unlock new building blocks or upgrade licenses, e.g. increasing level upload limits.
            <br /><br />
            To stay up to date with the latest news about this project, you can follow us on the following platforms:
            <br /><br /><br />
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              fontSize: '0.8rem',
              margin: '0 3rem'
            }}>
              <SMMButton
                link="https://shroomkingdom.net"
                blank
                text="Shroom Kingdom"
                iconSrc="https://shroomkingdom.net/images/logo.svg"
                iconColor="dark"
              />
              <SMMButton
                link="https://twitter.com/shrm_kingdom"
                blank
                text="SK @ Twitter"
                iconSrc="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQ0LjE4NyIgd2lkdGg9IjMwMCI+PHBhdGggZD0iTTk0LjcxOSAyNDMuMTg3YzExMi40NiAwIDE3My45NTYtOTMuMTY4IDE3My45NTYtMTczLjk1NiAwLTIuNjQ3LS4wNTQtNS4yOC0uMTczLTcuOTAzQTEyNC4zMjMgMTI0LjMyMyAwIDAwMjk5IDI5LjY2OGMtMTAuOTU1IDQuODctMjIuNzQ0IDguMTQ3LTM1LjExIDkuNjI1IDEyLjYyMy03LjU2OSAyMi4zMTQtMTkuNTQzIDI2Ljg4NS0zMy44MTdhMTIyLjYxIDEyMi42MSAwIDAxLTM4LjgyNCAxNC44NEMyNDAuNzk0IDguNDMzIDIyNC45MTEgMSAyMDcuMzIyIDFjLTMzLjc2MyAwLTYxLjE0NCAyNy4zOC02MS4xNDQgNjEuMTMyIDAgNC43OTguNTM3IDkuNDY1IDEuNTg2IDEzLjk0Qzk2Ljk0OCA3My41MTcgNTEuODkgNDkuMTg4IDIxLjczOCAxMi4xOTRhNjAuOTc4IDYwLjk3OCAwIDAwLTguMjc4IDMwLjczYzAgMjEuMjEyIDEwLjc5MyAzOS45MzggMjcuMjA3IDUwLjg5M2E2MC42OSA2MC42OSAwIDAxLTI3LjY5LTcuNjQ3Yy0uMDEuMjU3LS4wMS41MDctLjAxLjc4MSAwIDI5LjYxIDIxLjA3NiA1NC4zMzIgNDkuMDUyIDU5LjkzNGE2MS4yMiA2MS4yMiAwIDAxLTE2LjEyMiAyLjE1MmMtMy45MzQgMC03Ljc2Ni0uMzg3LTExLjQ5LTEuMTAzQzQyLjE5IDE3Mi4yMjcgNjQuNzYgMTg5LjkwNCA5MS41MiAxOTAuNGMtMjAuOTI1IDE2LjQwMi00Ny4yODcgMjYuMTctNzUuOTM3IDI2LjE3LTQuOTI5IDAtOS43OTgtLjI4LTE0LjU4NC0uODQ2IDI3LjA1OSAxNy4zNDQgNTkuMTkgMjcuNDY0IDkzLjcyMiAyNy40NjQiIGZpbGw9IiMxZGExZjIiLz48L3N2Zz4K"
                iconColor="bright"
              />
              <SMMButton
                link='https://discord.gg/SPZsgSe' blank
                text='SK @ Discord'
                iconSrc='/img/discord.svg'
                iconColor='bright'
              />
            </div>
          </div>
          <div style={styles.affiliate}>
            <div style={styles.header}>Affiliates</div>
            <SMMButton
              link="https://shroomkingdom.net"
              blank
              text="Shroom Kingdom"
              iconSrc="https://shroomkingdom.net/images/logo.svg"
              iconColor="dark"
            />
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
      </React.Fragment>
    )
  }
}
export default connect(
  (state: any): any => ({
    screenSize: state.getIn(['mediaQuery', 'screenSize'])
  })
)(MainView)
