import React from 'react'
import {
    connect
} from 'react-redux'

import {
    ScreenSize
} from '../../reducers/mediaQuery'

class UploadView extends React.PureComponent {
    render () {
        const screenSize = this.props.screenSize;
        const styles = {
            upload: {
                width: screenSize === ScreenSize.LARGE ? 'calc(100% - 260px)' : '100%',
                height: screenSize === ScreenSize.LARGE ? 'calc(100% - 40px)' : 'auto',
                overflow: 'hidden',
                position: screenSize === ScreenSize.LARGE ? 'absolute' : '',
                zIndex: '10',
                top: screenSize === ScreenSize.LARGE ? '40px' : '',
                left: screenSize === ScreenSize.LARGE ? '140px' : '',
                marginTop: screenSize === ScreenSize.LARGE ? '' : '30px',
                color: '#fff'
            },
            flex: {
                overflow: 'hidden',
                display: screenSize === ScreenSize.LARGE ? 'flex' : 'block',
                flexDirection: screenSize === ScreenSize.LARGE ? 'column' : ''
            },
            option: {
                height: 'auto',
                width: 'auto',
                padding: '10px'
            }
        };
        return (
            <div style={styles.upload}>
                <div style={styles.flex}>
                        Under construction
                </div>
            </div>
        )
    }
}
export default connect(state => ({
    screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(UploadView)