import React from 'react'

import Net64ServerArea from '../../../client/components/areas/Net64ServerArea'

export default class BrowseView extends React.PureComponent {
  render () {
    const styles = {
      main: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#24997e',
        flex: '1 1 auto'
      }
    }
    return (
      <div style={styles.main}>
        <Net64ServerArea isNet64 />
      </div>
    )
  }
}
