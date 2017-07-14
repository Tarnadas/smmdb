import React from 'react'

import SMMButton from '../../../client/components/buttons/SMMButton'

export default class SaveFileDetailsPanel extends React.PureComponent {
  render () {
    const course = this.props.course
    const path = course ? course.getPath() : null
    const styles = {
      divHide: {
        display: 'none'
      },
      overflow: {
        display: 'flex',
        position: 'absolute',
        zIndex: '100',
        top: '0',
        left: '0',
        alignItems: 'center',
        overflowY: 'scroll',
        width: '100%',
        height: '100%'
      },
      div: {
        width: 'auto',
        height: 'auto',
        backgroundColor: '#0d633d',
        border: '12px solid #42c074',
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column'
      },
      line: {
        width: '100%',
        height: '2px',
        backgroundColor: '#00452a'
      },
      header: {
        height: '40px',
        color: '#fff',
        fontSize: '18px',
        display: 'flex'
      },
      title: {
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: '1',
        margin: '0 10px'
      },
      cancel: {
        float: 'right',
        margin: '4px',
        width: '32px',
        height: '32px',
        boxSizing: 'border-box',
        borderRadius: '3px',
        backgroundColor: '#45b46a',
        cursor: 'pointer'
      },
      cancelImg: {
        width: '24px',
        height: '24px',
        margin: '4px'
      },
      body: {
        height: 'auto'
      },
      bodyImg: {
        margin: '20px',
        width: '320px',
        height: '240px'
      },
      navigation: {
        display: 'inline-block',
        verticalAlign: 'top',
        textAlign: 'center',
        height: '240px',
        margin: '20px',
        width: 'calc(100% - 400px)'
      },
      footer: {
        margin: '20px',
        width: '720px',
        height: '81px',
        overflow: 'hidden',
        textAlign: 'center'
      },
      footerImg: {
        width: 'auto',
        height: '81px'
      }
    }
    return (
      course ? (
        <div style={styles.overflow}>
          <div style={styles.div}>
            <div style={styles.header}>
              <div style={styles.title}>
                {`${course.title} by ${course.maker}`}
              </div>
              <div style={styles.cancel} onClick={this.props.onClick}>
                <img style={styles.cancelImg} src='/img/cancel.svg' />
              </div>
            </div>
            <div style={styles.line} />
            <div style={styles.body}>
              <img style={styles.bodyImg} src={`${path}/thumbnail1.jpg`} />
              <div style={styles.navigation}>
                <SMMButton type='deleteCourse' text='Delete' iconSrc='/img/delete.png' padding='3px' smmdbId={this.props.smmdbId} courseId={this.props.courseId} saveId={this.props.saveId} />
              </div>
            </div>
            <div style={styles.line} />
            <div style={styles.footer}>
              <img style={styles.footerImg} src={`${path}/thumbnail0.jpg`} />
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.divHide} />
      )
    )
  }
}
