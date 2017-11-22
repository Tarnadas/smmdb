import React from 'react'
import { connect } from 'react-redux'

import { ScreenSize } from '../../reducers/mediaQuery'

class BlogPostArea extends React.PureComponent {
  render () {
    console.log(this.props.blogPost)
    return (
      <div />
    )
  }
}
export default connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(BlogPostArea)
