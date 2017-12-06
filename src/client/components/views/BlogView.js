import React from 'react'
import { connect } from 'react-redux'
import { Route, withRouter } from 'react-router-dom'
import { List } from 'immutable'
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
      blogPosts: List(),
      editBlogPost: null,
      loading: false
    }
    this.onComposeBlogPost = this.onComposeBlogPost.bind(this)
    this.getBlogPosts = this.getBlogPosts.bind(this)
    this.onPublishBlogPost = this.onPublishBlogPost.bind(this)
    this.onEditBlogPost = this.onEditBlogPost.bind(this)
    this.onDeleteBlogPost = this.onDeleteBlogPost.bind(this)
  }
  async componentWillMount () {
    if (process.env.IS_SERVER) return
    this.setState({
      loading: true
    })
    this.getBlogPosts(this.props.apiKey)
    this.setState({
      loading: false
    })
  }
  async componentWillReceiveProps (nextProps, nextState) {
    if (this.props.apiKey === nextProps.apiKey || nextState.loading) return
    this.setState({
      loading: true
    })
    await this.getBlogPosts(nextProps.apiKey)
    this.setState({
      loading: false
    })
  }
  onComposeBlogPost () {
    this.setState({
      editBlogPost: null
    })
    this.props.history.push('/blog/compose')
  }
  async getBlogPosts (apiKey) {
    try {
      const blogPosts = (await got(resolve(process.env.DOMAIN, `/api/blogpost`), Object.assign({
        method: 'POST',
        body: {
          method: 'get',
          skip: 0, // TODO
          limit: 100
        },
        json: true,
        useElectronNet: false
      }, apiKey ? {
        headers: {
          'Authorization': `APIKEY ${apiKey}`
        }
      } : {}))).body
      this.setState({
        blogPosts: List(blogPosts)
      })
    } catch (err) {
      if (err.response) {
        console.error(err.response.body)
      } else {
        console.error(err)
      }
    }
  }
  onPublishBlogPost (blogPost, isUpdate = false) {
    if (isUpdate) {
      const [key] = this.state.blogPosts.findEntry(blog => blog._id === blogPost._id)
      this.setState(prevState => ({
        blogPosts: prevState.blogPosts.set(key, blogPost)
      }))
    } else {
      this.setState(prevState => ({
        blogPosts: prevState.blogPosts.unshift(blogPost)
      }))
    }
  }
  onEditBlogPost (blogId) {
    let editBlogPost
    for (const blogPost of this.state.blogPosts) {
      if (blogPost._id === blogId) {
        editBlogPost = blogPost
        break
      }
    }
    if (!editBlogPost) return
    this.setState({
      editBlogPost
    })
  }
  onDeleteBlogPost (blogId) {
    const blogPosts = this.state.blogPosts.filter(blog => blog._id !== blogId)
    this.setState({
      blogPosts
    })
  }
  renderBlogPosts (blogPosts) {
    console.log(blogPosts.toJS())
    return blogPosts.map(blogPost => (
      <BlogPostArea
        key={blogPost._id}
        blogPost={blogPost}
        accountId={this.props.accountId}
        apiKey={this.props.apiKey}
        onEdit={this.onEditBlogPost}
        onDelete={this.onDeleteBlogPost}
      />
    )).toJS()
  }
  render () {
    const screenSize = this.props.screenSize
    const editBlogPost = this.state.editBlogPost
    const styles = {
      blog: {
        height: '100%',
        padding: '3% 5%',
        color: '#000',
        display: 'flex',
        textAlign: 'left',
        flexDirection: 'column',
        overflow: 'auto'
      },
      main: {
        flex: '1 0 auto',
        padding: screenSize === ScreenSize.SUPER_SMALL ? '20px 10px' : '20px',
        fontSize: '16px',
        backgroundColor: 'rgba(59,189,159,1)',
        boxShadow: '0px 0px 10px 10px rgba(59,189,159,1)',
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
      <div style={styles.blog} id='scroll'>
        <div style={styles.main}>
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
              <BlogPostEditArea blogPost={editBlogPost} apiKey={this.props.apiKey} onPublish={this.onPublishBlogPost} />
            )} />
          }
          <Route exact path='/blog' render={() => this.renderBlogPosts(this.state.blogPosts)} />
        </div>
      </div>
    )
  }
}
export default withRouter(connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize']),
  apiKey: state.getIn(['userData', 'accountData', 'apikey']),
  accountId: state.getIn(['userData', 'accountData', 'id'])
}))(BlogView))
