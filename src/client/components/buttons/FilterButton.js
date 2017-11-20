import React from 'react'
import { Link } from 'react-router-dom'

export default class FilterButton extends React.PureComponent {
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
        fontSize: '16px',
        color: '#6dd3bd'
      }
    }
    return (
      <Link to='/courses/filter'>
        <div style={styles.button} onClick={this.onSetFilter}>
          <img style={styles.img} src='/img/filter.svg' />
          <div style={styles.text}>
            Filter
          </div>
        </div>
      </Link>
    )
  }
}
