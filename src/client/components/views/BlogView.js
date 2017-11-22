import React from 'react'
import { connect } from 'react-redux'
import { Route, withRouter } from 'react-router-dom'
import got from 'got'

import { resolve } from 'url'

import SMMButton from '../buttons/SMMButton'
import BlogPostArea from '../areas/BlogPostArea'
import BlogPostEditArea from '../areas/BlogPostEditArea'
// import UploadImageArea from '../areas/UploadImageArea'
import { ScreenSize } from '../../reducers/mediaQuery'

class BlogView extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      blogPosts: [],
      loading: false
    }
    this.onComposeBlogPost = this.onComposeBlogPost.bind(this)
    this.getBlogPosts = this.getBlogPosts.bind(this)
  }
  async componentWillMount () {
    if (process.env.IS_SERVER) return
    if (!this.props.apiKey) return
    this.setState({
      loading: true
    })
    this.getBlogPosts(this.props.apiKey)
    this.setState({
      loading: false
    })
  }
  async componentWillReceiveProps (nextProps, nextState) {
    if (!nextProps.apiKey || this.props.apiKey === nextProps.apiKey || nextState.loading) return
    this.setState({
      loading: true
    })
    await this.getBlogPosts(nextProps.apiKey)
    this.setState({
      loading: false
    })
  }
  onComposeBlogPost () {
    this.props.history.push('/blog/compose')
  }
  async getBlogPosts (apiKey) {
    try {
      const blogPosts = (await got(resolve(process.env.DOMAIN, `/api/blogpost`), {
        headers: {
          'Authorization': `APIKEY ${apiKey}`
        },
        method: 'POST',
        body: {
          method: 'get',
          skip: 0, // TODO
          limit: 10
        },
        json: true,
        useElectronNet: false
      })).body
      console.log(blogPosts)
      this.setState({
        blogPosts
      })
    } catch (err) {
      if (err.response) {
        console.error(err.response.body)
      } else {
        console.error(err)
      }
    }
  }
  renderBlogPosts (blogPosts) {
    return blogPosts.map(blogPost => (
      <BlogPostArea key={blogPost._id} blogPost={blogPost} />
    ))
  }
  render () {
    const screenSize = this.props.screenSize
    const styles = {
      blog: {
        height: '100%',
        padding: '3% 5%',
        color: '#000',
        display: 'flex',
        textAlign: 'left',
        flexDirection: 'column'
      },
      main: {
        flex: '1 0 0%',
        padding: screenSize === ScreenSize.SUPER_SMALL ? '20px 10px' : '20px',
        fontSize: '16px',
        backgroundColor: 'rgba(59,189,159,1)',
        boxShadow: '0px 0px 10px 10px rgba(59,189,159,1)',
        overflow: screenSize < ScreenSize.MEDIUM ? 'hidden' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      },
      header: {
        height: 'auto',
        margin: '6px 0',
        fontSize: '18px',
        padding: '6px 12px',
        backgroundColor: '#fff8af',
        borderRadius: '6px',
        border: '4px solid #f8ca00',
        boxShadow: '0 0 0 4px black'
      },
      content: {
        height: 'auto',
        margin: '10px 0 26px 0',
        fontSize: '14px',
        lineHeight: '20px'
      }
    }
    return (
      <div style={styles.blog}>
        <div style={styles.main} id='scroll'>
          {
            this.props.apiKey &&
            <Route exact path='/blog' render={() => (
              <SMMButton
                onClick={this.onComposeBlogPost}
                text='Compose new Blog post'
                iconSrc='/img/compose.svg'
                iconColor='bright'
                padding='3px'
              />
            )} />
          }
          {
            this.props.apiKey &&
            <Route path='/blog/compose' render={() => (
              <BlogPostEditArea apiKey={this.props.apiKey} />
            )} />
          }
          {
            this.renderBlogPosts(this.state.blogPosts)
          }
        </div>
      </div>
    )
  }
}
export default withRouter(connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize']),
  apiKey: state.getIn(['userData', 'accountData', 'apikey'])
}))(BlogView))
