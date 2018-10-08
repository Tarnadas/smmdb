import * as React from 'react'

export class ProgressPanel extends React.PureComponent<any, any> {
  render () {
    const course = this.props.course.toJS()
    const styles: any = {
      panel: {
        height: '169px',
        width: 'calc(100% - 20px)',
        maxWidth: '906px',
        backgroundColor: '#d4dda5',
        borderRadius: '10px',
        margin: '10px',
        color: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        flexDirection: 'column'
      },
      progress: {
        margin: '20px',
        background: `linear-gradient(90deg, #33cc33 ${course.percentage}%, #000 ${course.percentage}%)`,
        height: '50px'
      }
    }
    return (
      <div style={styles.panel}>
        <div style={{ width: 'auto', height: 'auto' }}>
          { course.title } - ETA: { course.eta }s
        </div>
        <div style={styles.progress} />
      </div>
    )
  }
}
