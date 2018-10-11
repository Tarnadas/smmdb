import * as React from 'react'
import { connect } from 'react-redux'
import { Route, withRouter } from 'react-router-dom'
import { List } from 'immutable'

import { resolve } from 'url'

import { SMMButton } from '../buttons/SMMButton'
import { BlogPostArea } from '../areas/BlogPostArea'
import { BlogPostEditArea } from '../areas/BlogPostEditArea'
import { ScreenSize } from '../../reducers/mediaQuery'

class BlogView extends React.PureComponent<any, any> {
  public constructor (props: any) {
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

  // eslint-disable-next-line
  public async UNSAFE_componentWillMount (): Promise<void> {
    if (process.env.IS_SERVER) return
    this.setState({
      loading: true
    })
    this.getBlogPosts(this.props.apiKey)
    this.setState({
      loading: false
    })
  }

  // eslint-disable-next-line
  public async UNSAFE_componentWillReceiveProps (nextProps: any, nextState: any): Promise<void> {
    if (this.props.apiKey === nextProps.apiKey || nextState.loading) return
    this.setState({
      loading: true
    })
    await this.getBlogPosts(nextProps.apiKey)
    this.setState({
      loading: false
    })
  }

  private onComposeBlogPost (): void {
    this.setState({
      editBlogPost: null
    })
    this.props.history.push('/blog/compose')
  }

  private async getBlogPosts (apiKey: any): Promise<void> {
    try {
      const response = await fetch(resolve(process.env.DOMAIN || '', `/api/blogpost`), {
        method: 'POST',
        body: JSON.stringify({
          method: 'get',
          skip: 0, // TODO
          limit: 100
        }),
        headers: apiKey
          ? {
            'Authorization': `APIKEY ${apiKey}`,
            'Content-Type': 'application/json'
          }
          : {
            'Content-Type': 'application/json'
          }
      })
      if (!response.ok) throw new Error(response.statusText)
      const blogPosts = await response.json()
      this.setState({
        blogPosts: List(blogPosts)
      })
    } catch (err) {
      console.error(err)
    }
  }

  private onPublishBlogPost (blogPost: any, isUpdate = false): void {
    if (isUpdate) {
      const [key] = this.state.blogPosts.findEntry((blog: any): boolean => blog._id === blogPost._id)
      this.setState((prevState: any): any => ({
        blogPosts: prevState.blogPosts.set(key, blogPost)
      }))
    } else {
      this.setState((prevState: any): any => ({
        blogPosts: prevState.blogPosts.unshift(blogPost)
      }))
    }
  }

  private onEditBlogPost (blogId: any): void {
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

  private onDeleteBlogPost (blogId: any): void {
    const blogPosts = this.state.blogPosts.filter((blog: any): boolean => blog._id !== blogId)
    this.setState({
      blogPosts
    })
  }

  private renderBlogPosts (blogPosts: any): JSX.Element[] {
    console.log(blogPosts.toJS())
    return blogPosts.map((blogPost: any): JSX.Element => (
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

  public render (): JSX.Element {
    const { screenSize } = this.props
    const { editBlogPost } = this.state
    const styles: any = {
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
            <Route exact path='/blog' render={(): JSX.Element => (
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
            <Route path='/blog/compose' render={(): JSX.Element => (
              <BlogPostEditArea blogPost={editBlogPost} apiKey={this.props.apiKey} onPublish={this.onPublishBlogPost} />
            )} />
          }
          <Route exact path='/blog' render={(): JSX.Element[] => this.renderBlogPosts(this.state.blogPosts)} />
        </div>
      </div>
    )
  }
}
export default withRouter(connect((state: any): any => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize']),
  apiKey: state.getIn(['userData', 'accountData', 'apikey']),
  accountId: state.getIn(['userData', 'accountData', 'id'])
}))(BlogView) as any) as any
