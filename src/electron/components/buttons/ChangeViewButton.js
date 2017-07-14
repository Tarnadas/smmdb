import React from 'react'

const SAVE_FOLDER_VIEW = 0
const SMMDB_VIEW = 1

export default class ChangeViewButton extends React.Component {
  render () {
    const styles = {
      outer: {
        float: 'left',
        margin: '14px',
        zIndex: '10',
        height: '32px',
        width: 'auto',
        backgroundColor: '#fff',
        borderRadius: '4px',
        boxSizing: 'border-box',
        textAlign: 'center',
        color: '#fff',
        cursor: 'pointer'
      },
      inner: {
        margin: '4px',
        float: 'left',
        width: '160px',
        height: '24px',
        lineHeight: '24px',
        backgroundColor: '#685d8c',
        boxSizing: 'border-box',
        borderRadius: '2px'
      },
      divImg: {
        float: 'left',
        width: '32px',
        height: '32px',
      },
      divImgInner: {
        margin: '4px 4px 0 0',
        borderRadius: '12px',
        width: '24px',
        height: '24px',
        boxSizing: 'border-box',
        backgroundColor: '#e4e6e4'
      },
      img: {
        width: '16px',
        height: '16px',
        marginTop: '5px'
      }
    }
    return (
      <div style={styles.outer} onClick={this.props.onClick}>
        <div style={styles.inner}>
          {
            this.props.view === SAVE_FOLDER_VIEW ? 'MY COURSES' : 'SMMDB COURSES'
          }
        </div>
        <div style={styles.divImg}>
          <div style={styles.divImgInner}>
            <img style={styles.img} src='/img/arrow_down.svg' />
          </div>
        </div>
      </div>
    )
  }
}
