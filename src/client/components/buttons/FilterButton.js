import React from 'react'
import {
    connect
} from 'react-redux'

import {
    showFilter
} from '../../actions'

class FilterButton extends React.PureComponent {
    constructor (props) {
        super(props);
        this.onSetFilter = this.onSetFilter.bind(this);
    }
    onSetFilter () {
        this.props.dispatch(showFilter(true));
    }
    render () {
        const styles = {
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
        };
        return (
            <div style={styles.button} onClick={this.onSetFilter}>
                <img style={styles.img} src="/img/filter.svg" />
                <div style={styles.text}>
                    Filter
                </div>
            </div>
        )
    }
}
export default connect()(FilterButton);