import React from 'react'
import request from 'request-promise'

import * as url from 'url'

import {
    domain
} from '../../../static'

export default class StatsPanel extends React.PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            stats: null
        }
    }
    componentDidMount () {
        (async () => {
            const stats = JSON.parse(await request({
                url: url.resolve(domain, '/api/getstats')
            }));
            this.setState({
                stats
            })
        })();
    }
    render () {
        const stats = this.state.stats;
        const styles = {
            panel: {
                width: 'auto',
                height: '32px',
                lineHeight: '32px',
                color: 'rgb(255, 229, 0)',
                float: 'left',
                margin: '10px 0 0 20px',
                position: 'absolute'
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