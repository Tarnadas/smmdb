import React from 'react'

export default class FAQView extends React.PureComponent {
  render () {
    const styles = {
      faq: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        padding: '20px 40px'
      },
      question: {
        height: 'auto',
        margin: '10px 0',
        fontSize: '18px'
      },
      answer: {
        height: 'auto',
        margin: '10px 0',
        fontSize: '14px',
        lineHeight: '20px'
      }
    }
    return (
      <div style={styles.faq}>
        <div style={styles.question}>
          How do I use the website with my Wii U?
        </div>
        <div style={styles.answer}>
          Unfortunately there is currently no easy solution for Wii U. However you can export your Super Mario Maker save file with the Homebrew app Saviine.
          You can then use <a href='https://github.com/Tarnadas/cemu-smmdb/releases'>Cemu SMMDB</a> to edit your save save file and reimport it to your Wii U with the Homebrew app Loadiine.
        </div>
        <div style={styles.question}>
          How do I use the website with my 3DS?
        </div>
        <div style={styles.answer}>
          You need Homebrew on your 3DS. You also need the Homebrew app <a href='https://github.com/MarcuzD/OCDM'>OCDM</a>.
          To import courses you can simply use your 3DS to scan the QR Code provided for every course. OCDM can then import courses from your SD Card.
          Exporting is also done with OCDM.
          Exported courses can be easily uploaded on the website, so you would need to transfer your exported course to an external device, because the website does not support the in-built 3DS web browser.
        </div>
      </div>
    )
  }
}
