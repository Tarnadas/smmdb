import * as React from 'react'
import { connect } from 'react-redux'
import LazyLoad from 'react-lazyload'
import got from 'got'
import marked from 'marked'
import { emojify } from 'node-emoji'

import { resolve } from 'url'

import { CourseDownloadButton } from '../buttons/CourseDownloadButton'
import { CourseVideoButton } from '../buttons/CourseVideoButton'
import { SMMButton, COLOR_SCHEME } from '../buttons/SMMButton'
import { ReuploadArea } from '../areas/ReuploadArea'
import { UploadImageArea } from '../areas/UploadImageArea'
import { setCourse64, setCourseSelf64, setCourseUploaded64 } from '../../actions'
import { ScreenSize } from '../../reducers/mediaQuery'
import { DIFFICULTY, N64_THEME } from '../../reducers/courseData'

const MAX_LENGTH_TITLE = 32
const MAX_LENGTH_VIDEOID = 12
const MAX_LENGTH_DESCRIPTION = 300
const VIDEO_ID = /^[a-z0-9A-Z| |.|\\_|\\-]+$/

class Panel extends React.PureComponent<any, any> {
  public onTitleChange: any
  public onVideoIdChange: any
  public onDifficultyChange: any
  public onStarsChange: any
  public onThemeChange: any

  constructor (props: any) {
    super(props)
    const course = props.course.toJS()
    this.state = {
      showDetails: false,
      changed: false,
      saved: false,
      title: course.title,
      videoId: course.videoid || '',
      difficulty: course.difficulty,
      stars: 0,
      theme: '',
      description: course.description || '',
      shouldDelete: false
    }
    this.onShowDetails = this.onShowDetails.bind(this)
    this.onHideDetails = this.onHideDetails.bind(this)
    this.onCourseSubmit = this.onCourseSubmit.bind(this)
    this.onCourseDelete = this.onCourseDelete.bind(this)
    this.onTitleChange = this.onStringChange.bind(this, 'title', MAX_LENGTH_TITLE)
    this.onVideoIdChange = this.onStringChange.bind(this, 'videoId', MAX_LENGTH_VIDEOID)
    this.onDifficultyChange = this.onSelectChange.bind(this, 'difficulty')
    this.onStarsChange = this.onIntegerChange.bind(this, 'stars', 0, 99)
    this.onThemeChange = this.onSelectChange.bind(this, 'theme')
    this.onReuploadComplete = this.onReuploadComplete.bind(this)
    this.onUploadImageComplete = this.onUploadImageComplete.bind(this)
    this.onStar = this.onStar.bind(this)
    this.onMarkdownChange = this.onMarkdownChange.bind(this)
  }
  componentWillReceiveProps (nextProps: any) {
    const course = nextProps.course.toJS()
    if (course.title !== this.state.title) {
      this.setState({
        title: course.title
      })
    }
    if (course.videoid !== this.state.videoId) {
      this.setState({
        videoId: course.videoid || ''
      })
    }
    if (course.difficulty !== this.state.difficulty) {
      this.setState({
        difficulty: course.difficulty
      })
    }
    if (course.courseStars !== this.state.stars) {
      this.setState({
        stars: course.courseStars
      })
    }
    if (course.theme !== this.state.theme) {
      this.setState({
        theme: course.theme || ''
      })
    }
    if (course.description !== this.state.description) {
      this.setState({
        description: course.description
      })
    }
  }
  onShowDetails (e: any) {
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
      this.state.difficulty === course.difficulty &&
      this.state.stars === course.stars &&
      this.state.theme === course.theme &&
      this.state.description === course.description) return;
    (async () => {
      try {
        const update = {
          title: this.state.title,
          videoid: this.state.videoId,
          difficulty: this.state.difficulty,
          stars: this.state.stars,
          theme: this.state.theme,
          description: this.state.description
        }
        if (!VIDEO_ID.test(update.videoid) && update.videoid !== '') {
          delete update.videoid
        }
        const res = (await got(resolve(process.env.DOMAIN!, `/api/updatecourse64?id=${course.id}`), {
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
          await got(resolve(process.env.DOMAIN!, `/api/deletecourse64?id=${this.props.course.get('id')}`), {
            headers: {
              'Authorization': `APIKEY ${this.props.apiKey}`
            },
            useElectronNet: false
          })
          this.props.onCourseDelete(this.props.id)
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
    } else {
      this.setState({
        shouldDelete: true
      })
    }
  }
  onStringChange (value: any, limit: any, e: any) {
    let val = e.target.value
    if (val.length > limit) {
      val = val.substr(0, limit)
    }
    const res: any = {
      changed: true,
      saved: false
    }
    res[value] = val
    this.setState(res)
  }
  onIntegerChange (value: any, min: any, max: any, e: any) {
    const val = parseInt(e.target.value)
    if (Number.isNaN(val)) return
    if (val < min || val > max) return
    const res: any = {
      changed: true,
      saved: false
    }
    res[value] = String(val)
    this.setState(res)
  }
  onSelectChange (value: any, e: any) {
    const val = e.target.value
    const res: any = {
      changed: true,
      saved: false
    }
    res[value] = val
    this.setState(res)
  }
  onReuploadComplete (course: any) {
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
  onUploadImageComplete (course: any) {
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
  async onStar (e: any) {
    e.stopPropagation()
    try {
      const course = (await got(resolve(process.env.DOMAIN!, `/api/starcourse64?id=${this.props.course.get('id')}`), {
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
  onMarkdownChange (e: any) {
    this.setState({
      description: e.target.value.replace(/<.*>/g, '').substr(0, MAX_LENGTH_DESCRIPTION),
      changed: true,
      saved: false
    })
  }
  render () {
    const screenSize = this.props.screenSize
    const course = this.props.course.toJS()
    const canEdit = this.props.canEdit
    const colorScheme = this.state.changed ? COLOR_SCHEME.RED : (this.state.saved ? COLOR_SCHEME.GREEN : COLOR_SCHEME.YELLOW)
    const styles: React.CSSProperties = {
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
      theme: {
        width: 'auto'
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
        width: '100%',
        overflow: 'hidden'
      },
      previewImgWrapper: {
        backgroundColor: '#cfcfab',
        display: 'flex'
      },
      previewImg: {
        width: '100%',
        lineHeight: '100px',
        textAlign: 'center'
      },
      stars: {
        height: '100%',
        margin: '0 4px',
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
        margin: '0 8px'
      },
      courseStars: {
        width: '32px',
        marginLeft: '6px',
        padding: '4px'
      },
      uploader: {
        width: '100%',
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
        width: '100%',
        fontSize: '18px'
      },
      editor: {
        width: 'calc(100% - 20px)',
        height: '150px',
        margin: '10px',
        backgroundColor: '#fffff5',
        color: '#000',
        fontFamily: 'Georgia,Cambria,"Times New Roman",Times,serif',
        padding: '10px',
        resize: 'none',
        overflow: 'auto',
        textAlign: 'left'
      },
      editorRendered: {
        display: this.state.description ? 'block' : 'none',
        width: 'calc(100% - 20px)',
        margin: '10px',
        color: '#000',
        overflow: 'auto',
        textAlign: 'left',
        fontSize: '16px'
      }
    }
    return (
      <div style={styles.panel}>
        <div style={styles.display} onClick={this.onShowDetails}>
          <div style={styles.header}>
            {
              course.theme != null && course.theme !== 0 &&
              <img style={styles.theme} src={
                course.theme === N64_THEME.CAVE ? (
                  '/img/cave.png'
                ) : (
                  course.theme === N64_THEME.FACTORY ? (
                    '/img/factory.png'
                  ) : (
                    course.theme === N64_THEME.DESERT ? (
                      '/img/desert.png'
                    ) : (
                      course.theme === N64_THEME.SNOW ? (
                        '/img/snow.png'
                      ) : (
                        course.theme === N64_THEME.VOID ? (
                          '/img/void.png'
                        ) : (
                          course.theme === N64_THEME.LAVA ? (
                            '/img/lava.png'
                          ) : (
                            course.theme === N64_THEME.BEACH ? (
                              '/img/beach.png'
                            ) : (
                              course.theme === N64_THEME.GRASS ? (
                                '/img/grass.png'
                              ) : (
                                course.theme === N64_THEME.LAVAROOM ? (
                                  '/img/lavaroom.png'
                                ) : (
                                  course.theme === N64_THEME.SKY ? (
                                    '/img/sky.png'
                                  ) : (
                                    course.theme === N64_THEME.FORTRESS ? (
                                      '/img/fortress.png'
                                    ) : (
                                      ''
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              } />
            }
            <div style={styles.title}>
              { course.title }
            </div>
            <div style={styles.close} onClick={this.onHideDetails}>
              <img style={{width: '100%'}} src='/img/cancel.svg' />
            </div>
          </div>
          <div style={styles.main}>
            <div style={styles.preview}>
              <div style={styles.previewImgWrapper}>
                <LazyLoad height={225} offset={200} once>
                  <img
                    style={styles.previewImg}
                    alt='no image'
                    src={`${process.env.DOMAIN}/course64img/${course.id}${course.vImg ? `?v=${course.vImg}` : ''}`}
                    ref={v => { (this as any).full = v }}
                  />
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
            { course.courseStars ? <img style={styles.courseStars} src='/img/coursestar.png' /> : null }
            { course.courseStars ? course.courseStars : null }
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
              <div style={styles.option}>
                <div style={styles.value}>
                  Star amount:
                </div>
                <input style={styles.input} value={this.state.stars} onChange={this.onStarsChange} />
              </div>
              <div style={styles.option}>
                <div style={styles.value}>
                  Theme:
                </div>
                <select style={styles.input} value={this.state.theme} onChange={this.onThemeChange}>
                  <option value={N64_THEME.NONE}>-</option>
                  <option value={N64_THEME.CAVE}>Cave</option>
                  <option value={N64_THEME.FACTORY}>Factory</option>
                  <option value={N64_THEME.DESERT}>Desert</option>
                  <option value={N64_THEME.SNOW}>Snow</option>
                  <option value={N64_THEME.VOID}>Void</option>
                  <option value={N64_THEME.LAVA}>Lava</option>
                  <option value={N64_THEME.BEACH}>Beach</option>
                  <option value={N64_THEME.GRASS}>Grass</option>
                  <option value={N64_THEME.LAVAROOM}>Lava room</option>
                  <option value={N64_THEME.SKY}>Sky</option>
                  <option value={N64_THEME.FORTRESS}>Fortress</option>
                </select>
              </div>
              <div style={styles.option} />
              <div style={{width: '100%'}}>
                Editor supports <a
                  target='_blank'
                  href='https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet'
                >Markdown</a> and <a
                  target='_blank'
                  href='https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json'
                >:emojis:</a></div>
              <textarea style={styles.editor} value={this.state.description} onChange={this.onMarkdownChange} />
              <SMMButton
                text='Save'
                iconSrc='/img/submit.png'
                fontSize='13px'
                padding='3px'
                colorScheme={colorScheme}
                onClick={this.onCourseSubmit}
              />
              <SMMButton
                text={this.state.shouldDelete ? 'Click again' : 'Delete'}
                iconSrc='/img/delete.png'
                fontSize='13px'
                padding='3px'
                onClick={this.onCourseDelete}
              />
            </div>
          }
          <div className='description' style={styles.editorRendered} ref={x => {
            (this as any).renderer = x
            if (x && this.state.description) x.innerHTML = emojify(marked(this.state.description))
          }} />
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
export const Course64Panel = connect((state: any) => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(Panel) as any
