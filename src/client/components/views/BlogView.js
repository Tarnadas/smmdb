import React from 'react'
import {
  connect
} from 'react-redux'
import got from 'got'
import marked from 'marked'
import { emojify } from 'node-emoji'

import { resolve } from 'url'

import SMMButton from '../buttons/SMMButton'
import UploadImageArea from '../areas/UploadImageArea'
import {
  ScreenSize
} from '../../reducers/mediaQuery'
import {
  domain
} from '../../../static'

const UPDATE_INTERVAL = 10000

class BlogView extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      compose: false,
      md: '',
      _id: ''
    }
    this.doUpdate = this.doUpdate.bind(this)
    this.onCompose = this.onCompose.bind(this)
    this.onChange = this.onChange.bind(this)
  }
  componentWillMount () {
    if (process.env.IS_SERVER) return
    if (!this.props.apiKey) return
    this.doUpdate(this.props.apiKey)
  }
  componentWillUnmount () {
    if (this.timer) clearInterval(this.timer)
  }
  componentWillUpdate (nextProps, nextState, nextContext) {
    if (nextState.md !== this.state.md) {
      this.renderer.innerHTML = emojify(marked(nextState.md))
    }
    if (nextProps.apiKey && nextState.compose && (nextState.compose !== this.state.compose)) {
      this.doUpdate(nextProps.apiKey)
    }
  }
  async doUpdate (apiKey) {
    const res = (await got(resolve(domain, `/api/blogpost`), {
      headers: {
        'Authorization': `APIKEY ${apiKey}`
      },
      method: 'POST',
      body: {
        method: 'get'
      },
      json: true,
      useElectronNet: false
    })).body
    this.setState({
      md: res.md,
      _id: res._id
    })
  }
  onCompose () {
    this.setState({
      compose: true
    })
    this.timer = setInterval(this.updateBlogPost.bind(this), UPDATE_INTERVAL)
  }
  async updateBlogPost () {
    const res = (await got(resolve(domain, `/api/blogpost`), {
      headers: {
        'Authorization': `APIKEY ${this.props.apiKey}`
      },
      method: 'POST',
      body: {
        method: 'update',
        md: this.state.md,
        _id: this.state._id
      },
      json: true,
      useElectronNet: false
    })).body
    this.setState({
      _id: res._id
    })
  }
  onChange (e) {
    this.setState({
      md: e.target.value.replace(/<.*>/g, '')
    })
  }
  render () {
    const screenSize = this.props.screenSize
    const blog = this.props.blog
    const styles = {
      social: {
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
        overflow: screenSize < ScreenSize.MEDIUM ? 'hidden' : 'auto'
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
      },
      blogWrap: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      },
      blog: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap'
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
    return (
      <div style={styles.social}>
        <div style={styles.main} id='scroll'>
          {
            this.props.apiKey &&
            <div style={styles.blogWrap}>
              {
                this.state.compose ? (
                  <div style={styles.blog} className='blog'>
                    <UploadImageArea type='blog' courseId={this.state._id} upload={blog.get(this.state._id)} onUploadComplete={null} />
                    <textarea style={styles.editor} value={this.state.md} onChange={this.onChange} />
                    <div style={styles.editorRendered} ref={x => { this.renderer = x }} />
                  </div>
                ) : (
                  <SMMButton onClick={this.onCompose} text='Compose new Blog post' iconSrc='/img/compose.svg' iconColor='bright' padding='3px' />
                )
              }
            </div>
          }
        </div>
      </div>
    )
  }
}
export default connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize']),
  apiKey: state.getIn(['userData', 'accountData', 'apikey']),
  blog: state.get('blog')
}))(BlogView)
