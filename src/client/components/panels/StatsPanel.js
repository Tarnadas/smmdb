import React from 'react'
import {
    connect
} from 'react-redux'

class StatsPanel extends React.PureComponent {
    render () {
        const stats = this.props.stats.toJS();
        const styles = {
            panel: {
                width: 'auto',
                height: 'auto',
                color: 'rgb(255, 229, 0)',
                position: 'absolute',
                top: '16px',
                left: '20px'
            }
        };
        return (
            !!stats && (
                <div style={styles.panel}>
                    There are {stats.courses} uploaded courses and {stats.accounts} registered accounts
                </div>
            )
        )
    }
}
export default connect(state => ({
    stats: state.get('stats')
}))(StatsPanel);