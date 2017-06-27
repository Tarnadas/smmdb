import React from 'react'
import request from 'request-promise'
import {
    connect
} from 'react-redux'

import { resolve } from 'url'

import {
    setStats
} from '../../actions'
import {
    domain
} from '../../../static'

class StatsPanel extends React.PureComponent {
    /*constructor (props) {
        super(props);
        if (!!window) {
            if (!!window.__STATS__) {
                const stats = window.__STATS__;
                delete window.__STATS__;
                this.props.dispatch(setStats(stats));
            } else {
                (async () => {
                    const stats = await request({
                        uri: resolve(domain, '/api/getstats'),
                        json: true
                    });
                    this.props.dispatch(setStats(stats));
                })();
            }
        }
    }*/
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