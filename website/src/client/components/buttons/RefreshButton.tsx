import * as React from 'react'
import { connect } from 'react-redux'

import { applyFilter } from '../../actions'

class Button extends React.PureComponent<any, any> {
  public constructor (props: any) {
    super(props)
    this.onApplyFilter = this.onApplyFilter.bind(this)
  }

  private onApplyFilter (): void {
    this.props.dispatch(applyFilter())
  }

  public render (): JSX.Element {
    const styles: any = {
      button: {
        height: 'auto',
        cursor: 'pointer'
      },
      img: {
        height: '60px',
        width: 'auto'
      },
      text: {
        width: 'auto',
        height: '22px',
        lineHeight: '22px',
        display: 'block',
        marginTop: '5px',
        fontSize: '16px'
      }
    }
    return (
      <div style={styles.button} onClick={this.onApplyFilter}>
        <img style={styles.img} src='/img/refresh.svg' />
        <div style={styles.text}>
          Refresh
        </div>
      </div>
    )
  }
}
export const RefreshButton = connect()(Button)
