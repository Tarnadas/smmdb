import * as React from 'react'

export default class ButtonSub extends React.PureComponent<any, any> {
  public render (): JSX.Element {
    const styles: any = {
      img: {
        width: this.props.noText ? 'auto' : '100%',
        height: '100%'
      },
      text: {
        color: this.props.hover ? '#fff' : '#323245',
        float: 'left',
        width: 'auto',
        paddingRight: '5px'
      }
    }
    return (
      <div>
        <div style={this.props.iconStyle}>
          <img style={styles.img} src={this.props.iconSrc} />
        </div>
        <div style={styles.text}>{this.props.text}</div>
      </div>
    )
  }
}
