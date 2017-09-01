import React from 'react'

export default class LegalNoticeView extends React.PureComponent {
  render () {
    const styles = {
      view: {
        fontSize: '14px',
        textAlign: 'left',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        color: '#000',
        overflow: 'auto'
      },
      header: {
        margin: '10px 20px',
        fontSize: '20px',
        fontWeight: 'bold',
        height: 'auto'
      },
      smallHeader: {
        margin: '10px',
        fontSize: '15px',
        fontWeight: 'bold',
        height: 'auto'
      },
      text: {
        margin: '10px 0',
        height: 'auto'
      }
    }
    return (
      <div id='scroll' style={styles.view}>
        <div style={styles.header}>
          Legal Notice
        </div>
        <div style={styles.text}>
          Mario Reder<br />
          Muldstraße 9<br />
          67550 Worms<br />
          Germany<br /><br />
          Tel.: +49 170 9058393<br />
          E-Mail: mreder1289@gmail.com
        </div>
      </div>
    )
  }
}