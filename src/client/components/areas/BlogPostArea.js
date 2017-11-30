import React from 'react'
import { connect } from 'react-redux'
import got from 'got'
import marked from 'marked'
import { emojify } from 'node-emoji'

import { resolve } from 'url'

import SMMButton from '../buttons/SMMButton'
import { ScreenSize } from '../../reducers/mediaQuery'

class BlogPostArea extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      renderer: null,
      collapsed: false,
      canDelete: false
    }
    this.onEditBlogPost = this.onEditBlogPost.bind(this)
    this.onDeleteBlogPost = this.onDeleteBlogPost.bind(this)
    this.onToggleCollapse = this.onToggleCollapse.bind(this)
  }
  componentDidMount () {
    this.renderer.innerHTML = emojify(marked(this.props.blogPost.markdown))
  }
  onEditBlogPost () {

  }
  async onDeleteBlogPost () {
    if (!this.state.canDelete) {
      this.setState({
        canDelete: true
      })
      return
    }
    try {
      const res = (await got(resolve(process.env.DOMAIN, `/api/blogpost`), {
        headers: {
          'Authorization': `APIKEY ${this.props.apiKey}`
        },
        method: 'POST',
        body: {
          method: 'delete',
          blogId: this.props.blogPost._id
        },
        json: true,
        useElectronNet: false
      })).body
      console.log(res)
      this.props.onDelete(this.props.blogPost._id)
    } catch (err) {
      if (err.response) {
        console.error(err.response.body)
      } else {
        console.error(err)
      }
    }
  }
  onToggleCollapse () {
    this.setState(prevState => ({
      collapsed: !prevState.collapsed
    }))
  }
  render () {
    // console.log(this.props.blogPost)
    const collapsed = this.state.collapsed
    const canDelete = this.state.canDelete
    const blogPost = this.props.blogPost
    const date = new Date()
    date.setTime(blogPost.published * 1000)
    const localeDate = date.toLocaleDateString()
    const isOwner = this.props.accountId === blogPost.accountId
    const styles = {
      blogWrapper: {
        display: 'flex',
        flexDirection: 'column',
        maxHeight: collapsed ? '' : '250px',
        width: '100%',
        margin: '20px 0',
        overflow: 'hidden'
      },
      toggleButton: {

      },
      blog: {
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        backgroundColor: '#fffff5',
        color: '#000'
      },
      header: {
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#ccc',
        padding: '0 10px',
        lineHeight: '56px'
      },
      owner: {
        flex: '1 0 auto',
        fontSize: '24px'
      },
      date: {
        padding: '0 20px'
      },
      renderer: {
        fontFamily: 'Georgia,Cambria,"Times New Roman",Times,serif',
        padding: '10px',
        flex: '1 0 auto'
      }
    }
    return (
      <div style={styles.blogWrapper}>
        <div style={styles.blog} className='blog'>
          <div style={styles.header}>
            <div style={styles.owner}>
              { blogPost.ownerName }
            </div>
            <div style={styles.date}>
              { localeDate }
            </div>
            {
              isOwner &&
              <SMMButton
                onClick={this.onEditBlogPost}
                text='Edit'
                iconSrc='/img/compose.svg'
                iconColor='bright'
                padding='3px'
                noMargin
              />
            }
            <div style={{margin: '0 5px'}} />
            {
              isOwner &&
              <SMMButton
                onClick={this.onDeleteBlogPost}
                text={canDelete ? 'Click again' : 'Delete'}
                iconSrc='/img/delete.png'
                iconColor='bright'
                padding='3px'
                noMargin
              />
            }
          </div>
          <div style={styles.renderer} ref={x => { this.renderer = x }} />
        </div>
        <div style={styles.toggleButton} onClick={this.onToggleCollapse}>
          Show full blog post
        </div>
      </div>
    )
  }
}
export default connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(BlogPostArea)
