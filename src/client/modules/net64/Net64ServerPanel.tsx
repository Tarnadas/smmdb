import * as React from 'react'
import marked from 'marked'
import { emojify } from 'node-emoji'
import { sanitize } from 'dompurify'

import {
  Country,
  Description,
  DescriptionText,
  DescriptionToggle,
  Details,
  DetailsWrapper,
  Header,
  HeaderImg,
  Panel,
  Player,
  PlayerList,
  Players,
  ServerName
} from './Net64ServerStyles'

interface Server {
  id?: string
  domain?: string
  ip: string
  port: number
  name?: string
  description?: string
  players?: any[]
  countryCode?: string
  gameMode?: number
  version?: string
  passwordRequired?: boolean | null
  isDedicated?: boolean
}

interface ServerPanelProps {
  server: Server
}

interface ServerPanelState {
  display: boolean
  displayDescription: boolean
}

const CHARACTER_IMAGES = [
  'mario.png',
  'luigi.png',
  'yoshi.png',
  'wario.png',
  'peach.png',
  'toad.png',
  'waluigi.png',
  'rosalina.png',
  'sonic.png',
  'knuckles.png',
  'goomba.png',
  'kirby.png'
]

enum GameModeType {
    NONE = 0,
    DEFAULT = 1,
    THIRD_PERSON_SHOOTER = 2,
    INTERACTIONLESS = 3,
    PROP_HUNT = 4,
    BOSS_RUSH = 5,
    TAG = 6,
    WARIO_WARE = 8
}

interface Player {
    username?: string
    characterId?: number
}

export class Net64ServerPanel extends React.PureComponent<ServerPanelProps, ServerPanelState> {
  public constructor (public props: ServerPanelProps) {
    super(props)
    this.state = {
      display: false,
      displayDescription: true
    }
    this.onToggle = this.onToggle.bind(this)
    this.handleDescriptionToggle = this.handleDescriptionToggle.bind(this)
    this.renderPlayers = this.renderPlayers.bind(this)
  }

  private getDescription = (): string => {
    if (!this.props.server.description) return ''
    return sanitize(emojify(marked(this.props.server.description)))
  }

  private onToggle (): void {
    this.setState(prevState => ({
      display: !prevState.display
    }))
  }

  private handleDescriptionToggle (): void {
    this.setState(prevState => ({
      displayDescription: !prevState.displayDescription
    }))
  }

  private getGameMode (server: Server): string {
    switch (server.gameMode) {
      case GameModeType.DEFAULT:
        return 'Regular'
      case GameModeType.INTERACTIONLESS:
        return 'Interactionless'
      case GameModeType.THIRD_PERSON_SHOOTER:
        return '3rd Person Shooter'
      case GameModeType.PROP_HUNT:
        return 'Prop Hunt'
      case GameModeType.TAG:
        return 'Tag'
      case GameModeType.BOSS_RUSH:
        return 'Boss Rush'
      case GameModeType.WARIO_WARE:
        return 'Wario Ware'
    }
    return ''
  }

  private getGameModeImgSrc (server: Server): string | undefined {
    switch (server.gameMode) {
      case GameModeType.DEFAULT:
        return 'img/regular.svg'
      case GameModeType.INTERACTIONLESS:
        return 'img/interactionless.svg'
      case GameModeType.THIRD_PERSON_SHOOTER:
        return 'img/shooter.svg'
      case GameModeType.PROP_HUNT:
        return 'img/prop_hunt.svg'
      case GameModeType.TAG:
        return 'img/tag.svg'
      case GameModeType.BOSS_RUSH:
        return 'img/boss_rush.png'
      case GameModeType.WARIO_WARE:
        return 'img/wario_ware.png'
    }
  }

  private renderPlayers (players: Player[]): JSX.Element[] {
    return players
      .filter(player => player)
      .map(
        (player, index) =>
          <Player key={index}>
            <div className='img'>
              <img src={`img/${CHARACTER_IMAGES[player.characterId || 0]}`} />
            </div>
            <div className='name'>
              { player.username }
            </div>
          </Player>
      )
  }

  public render (): JSX.Element {
    const { server } = this.props
    const { display, displayDescription } = this.state
    const players = server.players || []
    const gameMode: string | undefined = this.getGameModeImgSrc(server)
    return (
      <Panel>
        <Header
          onClick={this.onToggle}
        >
          <HeaderImg>
            <img src={`${
              server.isDedicated
                ? 'img/server.svg'
                : 'img/pc.svg'
            }`} />
          </HeaderImg>
          <Country>
            { server.countryCode || '' }
          </Country>
          {
            gameMode &&
            <HeaderImg>
              <img src={gameMode} />
            </HeaderImg>
          }
          <ServerName>
            { server.name || `${server.ip}:${server.port}` }
          </ServerName>
          <Players>
            { players.filter(player => player).length } / 24
          </Players>
        </Header>
        <DetailsWrapper className={`${!display ? 'global-hidden' : ''}`}>
          <Details>
            <Description
              active={displayDescription}
            >
              <DescriptionToggle
                active={displayDescription}
                onClick={this.handleDescriptionToggle}
              >
                <img src='img/arrow.svg' style={{ width: '100%' }} />
              </DescriptionToggle>
              <DescriptionText
                active={displayDescription}
              >
                <div>
                  { server.domain || server.ip }:{ server.port }
                </div>
                {
                  gameMode &&
                  <div>
                    Game Mode: { this.getGameMode(server) }
                  </div>
                }
                <div
                  className='markdown'
                  dangerouslySetInnerHTML={{ __html: this.getDescription() }}
                />
              </DescriptionText>
            </Description>
            <PlayerList>
              {
                this.renderPlayers(players)
              }
            </PlayerList>
          </Details>
        </DetailsWrapper>
      </Panel>
    )
  }
}
