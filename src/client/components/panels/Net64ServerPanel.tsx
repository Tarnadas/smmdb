import * as React from 'react'
import marked from 'marked'
import { emojify } from 'node-emoji'

import { resolve } from 'url'

const CHARACTER_IMAGES = [
  'mario.png', 'luigi.png', 'yoshi.png', 'wario.png', 'peach.png', 'toad.png', 'waluigi.png', 'rosalina.png', 'sonic.png', 'knuckles.png', 'goomba.png', 'kirby.png'
]

export interface Player {
  /** Player username */
  username?: string | null

  /** Player characterId */
  characterId?: number | null
}

export class Net64ServerPanel extends React.PureComponent<any, any> {
  public description: any

  public constructor (props: any) {
    super(props)
    this.state = {
      display: false
    }
    this.onToggle = this.onToggle.bind(this)
    this.renderPlayers = this.renderPlayers.bind(this)
  }

  public componentDidMount (): void {
    if (this.props.server.description) this.description.innerHTML = emojify(marked(this.props.server.description))
  }

  // eslint-disable-next-line
  public UNSAFE_componentWillUpdate (nextProps: any): void {
    if (nextProps.server.description !== this.props.server.description) {
      this.description.innerHTML = emojify(marked(nextProps.server.description))
    }
  }

  private onToggle (): void {
    this.setState((prevState: any): any => ({
      display: !prevState.display
    }))
  }

  private renderPlayers (players: Player[]): JSX.Element[] {
    const styles: any = {
      div: {
        borderBottom: '1px solid black',
        borderTop: '1px solid black',
        display: 'flex'
      },
      imgWrapper: {
        width: '24px',
        height: '24px'
      },
      img: {
        height: '100%'
      }
    }
    return players
      .filter((player): boolean => !!player)
      .map(
        (player, index): JSX.Element =>
          <div
            key={index}
            style={styles.div}
          >
            <div style={styles.imgWrapper}>
              <img src={`img/${CHARACTER_IMAGES[player.characterId || 0]}`} style={styles.img} />
            </div>
            <div>
              { player.username }
            </div>
          </div>
      )
  }

  public render (): JSX.Element {
    const { server } = this.props
    const styles: any = {
      panel: {
        fontSize: '18px',
        margin: '10px 0',
        flex: '1 0 auto'
      },
      header: {
        width: '100%',
        padding: '6px 12px',
        backgroundColor: '#fff8af',
        borderRadius: '6px',
        border: '4px solid #f8ca00',
        boxShadow: '0 0 0 4px black',
        cursor: 'pointer',
        display: 'flex'
      },
      name: {
        margin: '0 30px',
        flex: '1 1 auto'
      },
      players: {
        whiteSpace: 'nowrap'
      },
      details: {
        display: this.state.display ? 'flex' : 'none',
        margin: '4px 10px 0 10px',
        width: 'calc(100% - 20px)',
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: '0 0 10px 10px',
        flexWrap: 'wrap'
      },
      left: {
        display: 'flex',
        flexDirection: 'column',
        width: '50%',
        flex: '1 0 auto',
        minWidth: '300px'
      },
      right: {
        display: 'flex',
        flexDirection: 'column',
        width: '50%',
        padding: '6px',
        flex: '1 0 auto',
        minWidth: '300px',
        maxWidth: '500px'
      },
      el: {
        margin: '6px'
      }
    }
    return (
      <div style={styles.panel}>
        <div style={styles.header} onClick={this.onToggle}>
          <div>
            { server.countryCode }
          </div>
          <div style={styles.name}>
            { server.name }
          </div>
          <div style={styles.players}>
            { server.players.length } / 24
          </div>
        </div>
        <div style={styles.details}>
          <div style={styles.left}>
            <div style={styles.el}>
              { server.domain || server.ip }:{ server.port }
            </div>
            <div className='markdown' style={styles.el} ref={(x): void => { this.description = x }} />
          </div>
          <div style={styles.right}>
            {
              this.renderPlayers(server.players)
            }
          </div>
        </div>
      </div>
    )
  }
}
