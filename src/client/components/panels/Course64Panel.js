import React from 'react'
import {
  connect
} from 'react-redux'
import LazyLoad from 'react-lazyload'
import got from 'got'

import { resolve } from 'url'

import CourseDownloadButton from '../buttons/CourseDownloadButton'
import CourseVideoButton from '../buttons/CourseVideoButton'
import SMMButton, { COLOR_SCHEME } from '../buttons/SMMButton'
import ReuploadArea from '../areas/ReuploadArea'
import UploadImageArea from '../areas/UploadImageArea'
import {
  setCourse64, setCourseSelf64, setCourseUploaded64
} from '../../actions'
import {
  ScreenSize
} from '../../reducers/mediaQuery'
import {
  DIFFICULTY
} from '../../reducers/courseData'
import {
  domain
} from '../../../static'

const MAX_LENGTH_TITLE = 32
const MAX_LENGTH_VIDEOID = 12
const VIDEO_ID = /^[a-z0-9A-Z| |.|\\_|\\-]+$/

class Course64Panel extends React.PureComponent {
  constructor (props) {
    super(props)
    const course = props.course.toJS()
    this.state = {
      showDetails: false,
      changed: false,
      saved: false,
      title: course.title,
      videoId: course.videoid ? course.videoid : '',
      difficulty: course.difficulty,
      shouldDelete: false
    }
    this.onShowDetails = this.onShowDetails.bind(this)
    this.onHideDetails = this.onHideDetails.bind(this)
    this.onCourseSubmit = this.onCourseSubmit.bind(this)
    this.onCourseDelete = this.onCourseDelete.bind(this)
    this.onTitleChange = this.onStringChange.bind(this, 'title', MAX_LENGTH_TITLE)
    this.onVideoIdChange = this.onStringChange.bind(this, 'videoId', MAX_LENGTH_VIDEOID)
    this.onDifficultyChange = this.onSelectChange.bind(this, 'difficulty')
    this.onReuploadComplete = this.onReuploadComplete.bind(this)
    this.onUploadImageComplete = this.onUploadImageComplete.bind(this)
    this.onStar = this.onStar.bind(this)
  }
  componentWillReceiveProps (nextProps, nextContext) {
    const course = nextProps.course.toJS()
    if (course.title !== this.state.title) {
      this.setState({
        title: course.title
      })
    }
    if (course.videoid !== this.state.videoId) {
      this.setState({
        videoId: course.videoid ? course.videoid : ''
      })
    }
    if (course.difficulty !== this.state.difficulty) {
      this.setState({
        difficulty: course.difficulty
      })
    }
  }
  onShowDetails (e) {
    e.stopPropagation()
    if (!this.state.showDetails) {
      this.setState({
        showDetails: true
      })
    }
  }
  onHideDetails () {
    this.setState({
      showDetails: false
    })
  }
  onCourseSubmit () {
    const course = this.props.course.toJS()
    if (this.state.title === course.title &&
      this.state.videoId === course.videoid &&
      this.state.difficulty === course.difficulty) return;
    (async () => {
      try {
        const update = {
          title: this.state.title,
          videoid: this.state.videoId,
          difficulty: this.state.difficulty
        }
        if (!VIDEO_ID.test(update.videoid) && update.videoid !== '') {
          delete update.videoid
        }
        const res = (await got(resolve(domain, `/api/updatecourse64?id=${course.id}`), {
          headers: {
            'Authorization': `APIKEY ${this.props.apiKey}`
          },
          method: 'POST',
          body: update,
          json: true,
          useElectronNet: false
        })).body
        if (this.props.uploaded) {
          this.props.dispatch(setCourseUploaded64(this.props.id, res))
        } else {
          if (this.props.isSelf) {
            this.props.dispatch(setCourseSelf64(this.props.id, res))
          } else {
            this.props.dispatch(setCourse64(this.props.id, res))
          }
        }
        this.setState({
          changed: false,
          saved: true
        })
      } catch (err) {
        if (err.response) {
          if (err.response.body.includes('not found')) {
            this.props.onCourseDelete(this.props.id)
          } else {
            console.error(err.response.body)
          }
        } else {
          console.error(err)
        }
      }
    })()
  }
  onCourseDelete () {
    if (this.state.shouldDelete) {
      (async () => {
        try {
          await got(resolve(domain, `/api/deletecourse64?id=${this.props.course.get('id')}`), {
            headers: {
              'Authorization': `APIKEY ${this.props.apiKey}`
            },
            useElectronNet: false
          })
          this.props.onCourseDelete(this.props.id)
        } catch (err) {
          if (err.response.body.includes('not found')) {
            this.props.onCourseDelete(this.props.id)
          } else {
            console.error(err.response.body)
          }
        }
      })()
    } else {
      this.setState({
        shouldDelete: true
      })
    }
  }
  onStringChange (value, limit, e) {
    let val = e.target.value
    if (val.length > limit) {
      val = val.substr(0, limit)
    }
    const res = {
      changed: true,
      saved: false
    }
    res[value] = val
    this.setState(res)
  }
  onSelectChange (value, e) {
    const val = e.target.value
    const res = {
      changed: true,
      saved: false
    }
    res[value] = val
    this.setState(res)
  }
  onReuploadComplete (course) {
    if (this.props.uploaded) {
      this.props.dispatch(setCourseUploaded64(this.props.id, course))
    } else {
      if (this.props.isSelf) {
        this.props.dispatch(setCourseSelf64(this.props.id, course))
      } else {
        this.props.dispatch(setCourse64(this.props.id, course))
      }
    }
  }
  onUploadImageComplete (course) {
    if (this.props.uploaded) {
      this.props.dispatch(setCourseUploaded64(this.props.id, course))
    } else {
      if (this.props.isSelf) {
        this.props.dispatch(setCourseSelf64(this.props.id, course))
      } else {
        this.props.dispatch(setCourse64(this.props.id, course))
      }
    }
  }
  async onStar (e) {
    e.stopPropagation()
    try {
      const course = (await got(resolve(domain, `/api/starcourse64?id=${this.props.course.get('id')}`), {
        headers: {
          'Authorization': `APIKEY ${this.props.apiKey}`
        },
        method: 'POST',
        json: true,
        useElectronNet: false
      })).body
      if (course != null) {
        if (this.props.uploaded) {
          this.props.dispatch(setCourseUploaded64(this.props.id, course))
        } else {
          if (this.props.isSelf) {
            this.props.dispatch(setCourseSelf64(this.props.id, course))
          } else {
            this.props.dispatch(setCourse64(this.props.id, course))
          }
        }
      }
    } catch (err) {
      if (err.response) {
        console.error(err.response.body)
      } else {
        console.error(err)
      }
    }
  }
  render () {
    const screenSize = this.props.screenSize
    const course = this.props.course.toJS()
    const canEdit = this.props.canEdit
    const colorScheme = this.state.changed ? COLOR_SCHEME.RED : (this.state.saved ? COLOR_SCHEME.GREEN : COLOR_SCHEME.YELLOW)
    const styles = {
      panel: {
        height: 'auto',
        minWidth: screenSize === ScreenSize.SUPER_SMALL ? '300px' : '350px',
        maxWidth: '500px',
        flex: '1 0 0%',
        backgroundColor: '#d4dda5',
        borderRadius: '10px',
        margin: '10px',
        color: '#000',
        overflow: 'hidden'
      },
      display: {
        display: 'flex',
        flexDirection: 'column',
        cursor: this.state.showDetails ? 'auto' : 'pointer'
      },
      details: {
        display: this.state.showDetails ? 'flex' : 'none',
        flexWrap: 'wrap'
      },
      header: {
        display: 'flex'
      },
      main: {
        display: 'flex'
      },
      footer: {
        display: 'flex',
        height: '32px',
        lineHeight: '32px',
        whiteSpace: 'nowrap'
      },
      title: {
        height: '44px',
        width: '0',
        maxWidth: 'calc(100% - 64px)',
        margin: '0 10px',
        textAlign: 'left',
        fontSize: '18px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: '1'
      },
      close: {
        display: this.state.showDetails ? '' : 'none',
        cursor: 'pointer',
        width: '32px',
        height: '32px',
        margin: '6px',
        backgroundColor: '#11c2b0',
        borderRadius: '5px',
        padding: '6px'
      },
      preview: {
        // height: '225px',
        overflow: 'hidden'
      },
      previewImgWrapper: {
        backgroundColor: '#cfcfab',
        textAlign: 'left',
        display: 'flex'
      },
      previewImg: {
        lineHeight: '100px',
        textAlign: 'center'
      },
      stars: {
        margin: '0 4px',
        width: 'auto',
        cursor: 'pointer'
      },
      downloads: {
        margin: '4px',
        width: 'auto',
        height: '24px'
      },
      difficulty: {
        padding: '4px',
        width: 'auto',
        marginLeft: '8px'
      },
      uploader: {
        textAlign: 'right',
        padding: '0 10px',
        fontSize: '14px'
      },
      edit: {
        height: 'auto',
        padding: '10px',
        display: 'flex',
        flexWrap: 'wrap'
      },
      option: {
        height: 'auto',
        width: '50%',
        padding: '10px',
        textAlign: 'left',
        fontSize: '16px'
      },
      value: {
        height: 'auto',
        width: 'auto'
      },
      input: {
        height: '32px',
        fontSize: '18px'
      }
    }
    return (
      <div style={styles.panel}>
        <div style={styles.display} onClick={this.onShowDetails}>
          <div style={styles.header}>
            <div style={styles.title}>
              { course.title }
            </div>
            <div style={styles.close} onClick={this.onHideDetails}>
              <img src='/img/cancel.svg' />
            </div>
          </div>
          <div style={styles.main}>
            <div style={styles.preview}>
              <div style={styles.previewImgWrapper}>
                <LazyLoad height={225} offset={200} once>
                  <img style={styles.previewImg} alt='no image' src={`${domain}/course64img/${course.id}${course.vImg ? `?v=${course.vImg}` : ''}`} ref={v => { this.full = v }} />
                </LazyLoad>
              </div>
            </div>
          </div>
          <div style={styles.footer}>
            <img onClick={this.onStar} style={styles.stars} src={course.starred ? '/img/starred.png' : '/img/unstarred.png'} />
            { course.stars } /
            <img style={styles.downloads} src='/img/downloads.png' />
            { course.downloads }
            <img style={styles.difficulty} src={
              course.difficulty === DIFFICULTY.EASY ? (
                '/img/easy.png'
              ) : (
                course.difficulty === DIFFICULTY.NORMAL ? (
                  '/img/normal.png'
                ) : (
                  course.difficulty === DIFFICULTY.EXPERT ? (
                    '/img/expert.png'
                  ) : (
                    course.difficulty === DIFFICULTY.SUPER_EXPERT ? (
                      '/img/superexpert.png'
                    ) : (
                      '/img/normal.png'
                    )
                  )
                )
              )
            } />
            <div style={styles.uploader}>
              { course.uploader }
            </div>
          </div>
        </div>
        <div style={styles.details}>
          {
            canEdit &&
            <div style={styles.edit}>
              <ReuploadArea is64 courseId={course.id} onUploadComplete={this.onReuploadComplete} />
              <UploadImageArea type='64' courseId={course.id} onUploadComplete={this.onUploadImageComplete} />
              <div style={styles.option}>
                <div style={styles.value}>
                  Title:
                </div>
                <input style={styles.input} value={this.state.title} onChange={this.onTitleChange} />
              </div>
              <div style={styles.option}>
                <div style={styles.value}>
                  YouTube ID:
                </div>
                <input style={styles.input} value={this.state.videoId} onChange={this.onVideoIdChange} />
              </div>
              <div style={styles.option}>
                <div style={styles.value}>
                  Estimated difficulty:
                </div>
                <select style={styles.input} value={this.state.difficulty} onChange={this.onDifficultyChange}>
                  <option value={DIFFICULTY.EASY}>Easy</option>
                  <option value={DIFFICULTY.NORMAL}>Normal</option>
                  <option value={DIFFICULTY.EXPERT}>Expert</option>
                  <option value={DIFFICULTY.SUPER_EXPERT}>Super Expert</option>
                </select>
              </div>
              <div style={styles.option} />
              <SMMButton text='Save' iconSrc='/img/submit.png' fontSize='13px' padding='3px' colorScheme={colorScheme} onClick={this.onCourseSubmit} />
              <SMMButton text={this.state.shouldDelete ? 'Click again' : 'Delete'} iconSrc='/img/delete.png' fontSize='13px' padding='3px' onClick={this.onCourseDelete} />
            </div>
          }
          <CourseDownloadButton is64 courseId={course.id} screenSize={screenSize} />
          {
            course.videoid &&
            <CourseVideoButton videoId={course.videoid} screenSize={screenSize} />
          }
        </div>
      </div>
    )
  }
}
export default connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(Course64Panel)
