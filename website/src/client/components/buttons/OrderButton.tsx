import * as React from 'react'
import { connect } from 'react-redux'

import { setOrder, swapOrder } from '../../actions/index'
import { ScreenSize } from '@/client/reducers/mediaQuery'

class Button extends React.PureComponent<any, any> {
  public constructor (props: any) {
    super(props)
    this.state = {
      order: 'lastmodified'
    }
    this.onClick = this.onClick.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  private onClick (): void {
    this.props.dispatch(swapOrder())
  }

  private onChange (e: any): void {
    this.setState({
      order: e.target.value
    })
    this.props.dispatch(setOrder(e.target.value))
  }

  public render (): JSX.Element {
    const { direction, screenSize, location } = this.props
    const { pathname } = location || { pathname: '' }
    const styles: any = {
      button: {
        height: 'auto'
      },
      img: {
        height: screenSize >= ScreenSize.MEDIUM ? '60px' : '30px',
        width: 'auto',
        cursor: 'pointer'
      },
      select: {
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#208971',
        padding: '2px',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    }
    return (
      <div style={styles.button}>
        <img
          style={styles.img}
          src={direction ? '/img/order_asc.svg' : '/img/order_desc.svg'}
          onClick={this.onClick}
        />
        <select
          style={styles.select}
          value={this.state.order}
          onChange={this.onChange}
        >
          <option value="lastmodified">Modified</option>
          <option value="uploaded">Uploaded</option>
          {
            pathname !== '/courses2' &&
            <option value="stars">Stars</option>
          }
        </select>
      </div>
    )
  }
}
export const OrderButton = connect(
  (state: any): any => ({
    direction: state.getIn(['order', 'dir']),
    screenSize: state.getIn(['mediaQuery', 'screenSize']),
    location: state.getIn(['router', 'location'])
  })
)(Button)
