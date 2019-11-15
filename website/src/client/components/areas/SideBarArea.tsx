import * as React from 'react'
import { connect } from 'react-redux'

import { OrderButton } from '../buttons/OrderButton'
import FilterButton from '../buttons/FilterButton'
import { ScreenSize } from '@/client/reducers/mediaQuery'

class SideBarArea extends React.PureComponent<any, any> {
  public render (): JSX.Element {
    const { is64, screenSize } = this.props
    const styles: any = {
      sideBar: {
        display: 'flex',
        flexDirection: screenSize >= ScreenSize.MEDIUM ? 'column' : 'row',
        justifyContent: 'space-between',
        width: '100px',
        height: screenSize >= ScreenSize.MEDIUM ? '220px' : 'auto',
        margin: screenSize >= ScreenSize.MEDIUM ? '0 30px' : '0 15px',
        color: '#6dd3bd',
        boxShadow:
          screenSize >= ScreenSize.MEDIUM
            ? '0px 0px 4px 12px rgba(0,0,0,0.1)'
            : undefined,
        borderRadius: '8px',
        padding: screenSize >= ScreenSize.MEDIUM ? '10px' : '10px 0 0 0'
      }
    }
    return (
      <div style={styles.sideBar}>
        <OrderButton />
        {!is64 && <FilterButton />}
      </div>
    )
  }
}
export default connect((state: any): any => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(SideBarArea as any) as any
