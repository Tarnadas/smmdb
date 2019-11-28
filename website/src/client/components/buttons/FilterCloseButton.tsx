import * as React from 'react'
import { connect } from 'react-redux'

class Button extends React.PureComponent<any, any> {
  public render (): JSX.Element {
    const styles: any = {
      close: {
        cursor: 'pointer',
        width: '32px',
        height: '32px',
        float: 'right',
        margin: '6px',
        backgroundColor: '#11c2b0',
        borderRadius: '5px',
        padding: '2px'
      }
    }
    return (
      <div style={styles.close}>
        <img style={{width: '100%'}} src='/img/cancel.svg' />
      </div>
    )
  }
}
export const FilterCloseButton = connect()(Button) as any
