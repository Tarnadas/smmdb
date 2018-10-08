import * as React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import marked from 'marked'
import { emojify } from 'node-emoji'

import { resolve } from 'url'

import { SMMButton } from '../buttons/SMMButton'
import { ScreenSize } from '../../reducers/mediaQuery'

const UPDATE_INTERVAL = 10000

class Area extends React.PureComponent<any, any> {
  private timer: any

  private renderer: any

  private loading: any

  constructor (props: any) {
    super(props)
    this.state = {
      loading: false,
      markdown: '',
      blogId: ''
    }
    this.loadCurrentBlogPost = this.loadCurrentBlogPost.bind(this)
    this.getCurrentBlogPost = this.getCurrentBlogPost.bind(this)
    this.updateBlogPost = this.updateBlogPost.bind(this)
    this.onTextAreaChange = this.onTextAreaChange.bind(this)
    this.onGoBack = this.onGoBack.bind(this)
    this.onPublishBlogPost = this.onPublishBlogPost.bind(this)
  }
  async componentDidMount () {
    const blogPost = this.props.blogPost
    if (blogPost) {
      this.setState({
        markdown: blogPost.markdown || '',
        blogId: blogPost._id
      })
      this.timer = setInterval(this.updateBlogPost, UPDATE_INTERVAL)
      return
    }
    if (!this.props.apiKey) return
    this.loadCurrentBlogPost(this.props.apiKey)
  }
  componentWillUnmount () {
    if (this.timer) clearInterval(this.timer)
  }
  componentWillReceiveProps (nextProps: any) {
    if (this.timer || !nextProps.apiKey || this.props.apiKey === nextProps.apiKey || this.state.loading) return
    this.loadCurrentBlogPost(nextProps.apiKey)
  }
  async componentWillUpdate (nextProps: any, nextState: any) {
    if (!nextState.markdown || nextState.markdown === this.state.markdown) return
    this.renderer.innerHTML = emojify(marked(nextState.markdown))
  }
  async loadCurrentBlogPost (apiKey: string) {
    if (this.loading) return
    this.loading = true
    this.setState({
      loading: true
    })
    await this.getCurrentBlogPost(apiKey)
    this.setState({
      loading: false
    })
    this.timer = setInterval(this.updateBlogPost.bind(this), UPDATE_INTERVAL)
    this.loading = false
  }
  async getCurrentBlogPost (apiKey: string) {
    try {
      const response = await fetch(resolve(process.env.DOMAIN!, `/api/blogpost`), {
        headers: {
          'Authorization': `APIKEY ${apiKey}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          method: 'get',
          getCurrent: true
        })
      })
      if (!response.ok) throw new Error(response.statusText)
      let currentBlogPost = await response.json()
      if (currentBlogPost.length === 0) return
      currentBlogPost = currentBlogPost[0]
      console.log(currentBlogPost)
      this.setState({
        markdown: currentBlogPost.markdown || '',
        blogId: currentBlogPost._id
      })
    } catch (err) {
      console.error(err)
    }
  }
  async updateBlogPost () {
    const response = await fetch(resolve(process.env.DOMAIN!, `/api/blogpost`), {
      headers: {
        'Authorization': `APIKEY ${this.props.apiKey}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        method: 'update',
        markdown: this.state.markdown,
        blogId: this.state.blogId
      })
    })
    if (!response.ok) throw new Error(response.statusText)
    const blogPost = await response.json()
    this.setState({
      blogId: blogPost._id
    })
  }
  onTextAreaChange (e: any) {
    this.setState({
      markdown: e.target.value.replace(/<.*>/g, '')
    })
  }
  async onGoBack () {
    await this.updateBlogPost()
    this.props.history.goBack()
  }
  async onPublishBlogPost () {
    try {
      const response = await fetch(resolve(process.env.DOMAIN!, `/api/blogpost`), {
        headers: {
          'Authorization': `APIKEY ${this.props.apiKey}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          method: 'publish',
          blogId: this.state.blogId,
          markdown: this.state.markdown
        })
      })
      if (!response.ok) throw new Error(response.statusText)
      const blogPost = await response.json()
      this.props.onPublish(blogPost, !!this.props.blogPost)
      this.props.history.goBack()
    } catch (err) {
      console.error(err)
    }
  }
  render () {
    const blogPost = this.props.blogPost
    const styles: any = {
      area: {
        width: '100%',
        flex: '1 0 auto',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      },
      blog: {
        width: '100%',
        flex: '1 0 auto',
        display: 'flex',
        flexWrap: 'wrap'
      },
      buttons: {
        display: 'flex',
        flex: '0 0 auto',
        justifyContent: 'space-between',
        width: '100%',
        padding: '1rem'
      },
      widgets: {
        padding: '10px',
        fontSize: '18px'
      },
      widget: {
        cursor: 'pointer',
        margin: '5px',
        width: '24px',
        height: '24px'
      },
      editor: {
        width: '46%',
        margin: '0 2%',
        backgroundColor: '#fffff5',
        color: '#000',
        fontFamily: 'Georgia,Cambria,"Times New Roman",Times,serif',
        padding: '10px',
        resize: 'none',
        overflow: 'auto'
      },
      editorRendered: {
        width: '46%',
        margin: '0 2%',
        backgroundColor: '#fffff5',
        color: '#000',
        fontFamily: 'Georgia,Cambria,"Times New Roman",Times,serif',
        padding: '10px',
        overflow: 'auto'
      }
    }
    /* TODO as long as image upload is not implemented, services like imgur can be used
    <UploadImageArea
      type='blog'
      courseId={this.state._id}
      upload={blog.get(this.state._id)}
      onUploadComplete={null}
    />
    */
    return (
      <div style={styles.area}>
        <div style={styles.blog} className='blog'>
          <textarea style={styles.editor} value={this.state.markdown} onChange={this.onTextAreaChange} />
          <div style={styles.editorRendered} ref={x => { this.renderer = x }} />
        </div>
        <div style={styles.buttons}>
          <SMMButton
            onClick={this.onGoBack}
            text={blogPost ? 'Discard' : 'Go back and save'}
            iconSrc='/img/back.svg'
            iconColor='bright'
            padding='3px'
          />
          <SMMButton
            onClick={this.onPublishBlogPost}
            text={blogPost ? 'Update' : 'Publish'}
            iconSrc='/img/compose.svg'
            iconColor='bright'
            padding='3px'
          />
        </div>
      </div>
    )
  }
}
export const BlogPostEditArea: any = withRouter(connect((state: any) => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(Area as any) as any)
