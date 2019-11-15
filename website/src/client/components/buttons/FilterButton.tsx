import * as React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import { ScreenSize } from '@/client/reducers/mediaQuery'

class FilterButton extends React.PureComponent<any, any> {
  public onSetFilter: any

  public render (): JSX.Element {
    const { screenSize } = this.props
    const styles: any = {
      button: {
        height: 'auto',
        cursor: 'pointer'
      },
      img: {
        height: screenSize >= ScreenSize.MEDIUM ? '60px' : '30px',
        width: 'auto'
      },
      text: {
        width: 'auto',
        height: '22px',
        lineHeight: '22px',
        display: 'block',
        marginTop: '5px',
        fontSize: '16px',
        color: '#6dd3bd'
      }
    }
    return (
      <Link to="/courses/filter">
        <div style={styles.button} onClick={this.onSetFilter}>
          <img style={styles.img} src="/img/filter.svg" />
          <div style={styles.text}>Filter</div>
        </div>
      </Link>
    )
  }
}
export default connect(
  (state: any): any => ({
    screenSize: state.getIn(['mediaQuery', 'screenSize'])
  })
)(FilterButton as any)
