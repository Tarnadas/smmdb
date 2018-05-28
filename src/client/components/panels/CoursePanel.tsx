import * as React from 'react'
import LazyLoad from 'react-lazyload'
import { connect } from 'react-redux'
const QRCode = require('qrcode')
import marked from 'marked'
import { emojify } from 'node-emoji'

import { resolve } from 'url'

import { CourseDownloadButton } from '../buttons/CourseDownloadButton'
import { CourseVideoButton } from '../buttons/CourseVideoButton'
import { SMMButton, COLOR_SCHEME } from '../buttons/SMMButton'
import { ReuploadArea } from '../areas/ReuploadArea'
import { UploadImageArea } from '../areas/UploadImageArea'
import { ScreenSize } from '../../reducers/mediaQuery'
import { setCourse, setCourseSelf, setCourseUploaded } from '../../actions'
import { DIFFICULTY } from '../../reducers/courseData'

const MAX_LENGTH_TITLE = 32
const MAX_LENGTH_MAKER = 10
const MAX_LENGTH_NNID = 19
const MAX_LENGTH_VIDEOID = 12
const MAX_LENGTH_DESCRIPTION = 300
const VIDEO_ID = /^[a-z0-9A-Z| |.|\\_|\\-]+$/

class Panel extends React.PureComponent<any, any> {
  public onTitleChange: any
  public onVideoIdChange: any
  public onDifficultyChange: any
  public onMakerChange: any
  public onNintendoIdChange: any
  public renderer: any
  public full: any
  public prev: any

  constructor (props: any) {
    super(props)
    const course = props.course.toJS()
    this.state = {
      showDetails: false,
      changed: false,
      saved: false,
      title: course.title,
      maker: course.maker,
      nnId: course.nintendoid || '',
      videoId: course.videoid || '',
      difficulty: course.difficulty,
      description: course.description || '',
      shouldDelete: false
    }
    this.onShowDetails = this.onShowDetails.bind(this)
    this.onHideDetails = this.onHideDetails.bind(this)
    this.onCourseSubmit = this.onCourseSubmit.bind(this)
    this.onCourseDelete = this.onCourseDelete.bind(this)
    this.onTitleChange = this.onStringChange.bind(this, 'title', MAX_LENGTH_TITLE)
    this.onMakerChange = this.onStringChange.bind(this, 'maker', MAX_LENGTH_MAKER)
    this.onNintendoIdChange = this.onStringChange.bind(this, 'nnId', MAX_LENGTH_NNID)
    this.onVideoIdChange = this.onStringChange.bind(this, 'videoId', MAX_LENGTH_VIDEOID)
    this.onDifficultyChange = this.onSelectChange.bind(this, 'difficulty')
    this.onReuploadComplete = this.onReuploadComplete.bind(this)
    this.onUploadFullComplete = this.onUploadFullComplete.bind(this)
    this.onUploadPrevComplete = this.onUploadPrevComplete.bind(this)
    this.onStar = this.onStar.bind(this)
    this.onMarkdownChange = this.onMarkdownChange.bind(this)
  }
  componentWillReceiveProps (nextProps: any) {
    if (nextProps.course.get('title') !== this.state.title) {
      this.setState({
        title: nextProps.course.get('title')
      })
    }
    if (nextProps.course.get('maker') !== this.state.maker) {
      this.setState({
        maker: nextProps.course.get('maker')
      })
    }
    if (nextProps.course.get('nintendoid') !== this.state.nnId) {
      this.setState({
        nnId: nextProps.course.get('nintendoid') || ''
      })
    }
    if (nextProps.course.get('videoid') !== this.state.videoId) {
      this.setState({
        videoId: nextProps.course.get('videoid') || ''
      })
    }
    if (nextProps.course.get('difficulty') !== this.state.difficulty) {
      this.setState({
        difficulty: nextProps.course.get('difficulty')
      })
    }
    if (nextProps.course.get('description') !== this.state.description) {
      this.setState({
        description: nextProps.course.get('description')
      })
    }
  }
  componentWillUpdate (nextProps: any, nextState: any) {
    if (nextState.description && nextState.description !== this.state.description) {
      this.renderer.innerHTML = emojify(marked(nextState.description))
    }
  }
  onShowDetails (e: any) {
    e.stopPropagation()
    if (!this.state.showDetails) {
      this.setState({
        showDetails: true,
        shouldDelete: false
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
      this.state.maker === course.maker &&
      this.state.nnId === course.nintendoid &&
      this.state.videoId === course.videoid &&
      this.state.difficulty === course.difficulty &&
      this.state.description === course.description) return;
    (async () => {
      try {
        const update = {
          title: this.state.title,
          maker: this.state.maker,
          nintendoid: this.state.nnId,
          videoid: this.state.videoId,
          difficulty: this.state.difficulty,
          description: this.state.description
        }
        if (!VIDEO_ID.test(update.videoid) && update.videoid !== '') {
          delete update.videoid
        }
        const response = await fetch(resolve(process.env.DOMAIN!, `/api/updatecourse?id=${course.id}`), {
          headers: {
            'Authorization': `APIKEY ${this.props.apiKey}`,
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify(update)
        })
        if (!response.ok) {
          if (response.status === 400) {
            this.props.onCourseDelete(this.props.id)
            return
          }
          throw new Error(response.statusText)
        }
        const courseSMM = await response.json()
        if (this.props.uploaded) {
          this.props.dispatch(setCourseUploaded(this.props.id, courseSMM))
        } else {
          if (this.props.isSelf) {
            this.props.dispatch(setCourseSelf(this.props.id, courseSMM))
          } else {
            this.props.dispatch(setCourse(this.props.id, courseSMM))
          }
        }
        this.setState({
          changed: false,
          saved: true
        })
      } catch (err) {
        console.error(err)
      }
    })()
  }
  onCourseDelete () {
    if (this.state.shouldDelete) {
      (async () => {
        try {
          await fetch(resolve(process.env.DOMAIN!, `/api/deletecourse?id=${this.props.course.get('id')}`), {
            headers: {
              'Authorization': `APIKEY ${this.props.apiKey}`
            }
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
      this.props.dispatch(setCourseUploaded(this.props.id, course))
    } else {
      if (this.props.isSelf) {
        this.props.dispatch(setCourseSelf(this.props.id, course))
      } else {
        this.props.dispatch(setCourse(this.props.id, course))
      }
    }
  }
  onUploadFullComplete (course: any) {
    if (this.props.uploaded) {
      this.props.dispatch(setCourseUploaded(this.props.id, course))
    } else {
      if (this.props.isSelf) {
        this.props.dispatch(setCourseSelf(this.props.id, course))
      } else {
        this.props.dispatch(setCourse(this.props.id, course))
      }
    }
  }
  onUploadPrevComplete (course: any) {
    if (this.props.uploaded) {
      this.props.dispatch(setCourseUploaded(this.props.id, course))
    } else {
      if (this.props.isSelf) {
        this.props.dispatch(setCourseSelf(this.props.id, course))
      } else {
        this.props.dispatch(setCourse(this.props.id, course))
      }
    }
  }
  async onStar (e: any) {
    e.stopPropagation()
    try {
      const response = await fetch(resolve(process.env.DOMAIN!, `/api/starcourse?id=${this.props.course.get('id')}`), {
        headers: {
          'Authorization': `APIKEY ${this.props.apiKey}`
        },
        method: 'POST'
      })
      if (!response.ok) throw new Error(response.statusText)
      const course = await response.json()
      if (!course) return
      if (this.props.uploaded) {
        this.props.dispatch(setCourseUploaded(this.props.id, course))
      } else {
        if (this.props.isSelf) {
          this.props.dispatch(setCourseSelf(this.props.id, course))
        } else {
          this.props.dispatch(setCourse(this.props.id, course))
        }
      }
    } catch (err) {
      console.error(err)
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
    const style = parseInt(course.gameStyle)
    const colorScheme = this.state.changed ? COLOR_SCHEME.RED : (this.state.saved ? COLOR_SCHEME.GREEN : COLOR_SCHEME.YELLOW)
    const modified = this.props.downloadedCourse && this.props.downloadedCourse.get('modified') !== course.lastmodified
    const p = this.props.progress && this.props.progress.toJS()
    const progress = (p && (100 * p[0] / p[1])) || (this.props.downloadedCourse && 100)
    const saveId = this.props.saveId
    const downloaded = progress === 100
    const styles: React.CSSProperties = {
      panel: {
        height: this.state.showDetails ? 'auto' : '169px',
        maxWidth: '906px',
        backgroundColor: process.env.ELECTRON ? (
          downloaded ? (
            modified ? (
              '#DD8F33'
            ) : (
              saveId != null ? (
                '#6ddd83'
              ) : (
                '#9fdd96'
              )
            )
          ) : (
            '#d4dda5'
          )
        ) : (
          '#d4dda5'
        ),
        borderRadius: '10px',
        margin: '10px',
        color: '#000',
        overflow: 'hidden',
        display: 'flex'
      },
      top: {
        height: '169px',
        cursor: this.state.showDetails ? 'auto' : 'pointer',
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        verticalAlign: 'top'
      },
      rank: {
        width: '100px',
        minWidth: '100px',
        backgroundColor: '#d7db48',
        borderRadius: '10px 0 0 10px',
        display: screenSize === ScreenSize.SUPER_SMALL ? 'none' : 'block'
      },
      details: {
        width: screenSize === ScreenSize.SUPER_SMALL ? '100%' : 'calc(100% - 100px)'
      },
      theme: {
        width: '91px',
        height: '44px'
      },
      title: {
        height: '44px',
        maxWidth: 'calc(100% - 155px)',
        margin: '0 10px',
        textAlign: 'left',
        fontSize: screenSize === ScreenSize.SUPER_SMALL ? '16px' : '22px',
        display: 'flex',
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
        width: screenSize === ScreenSize.SUPER_SMALL ? '100%' : 'calc(100% - 86px)',
        height: '81px',
        overflow: 'hidden'
      },
      previewImgWrapper: {
        width: '720px',
        height: '81px',
        backgroundColor: '#cfcfab',
        textAlign: 'left'
      },
      previewImg: {
        height: '100%'
      },
      mii: {
        height: '81px',
        width: '86px',
        display: screenSize === ScreenSize.SUPER_SMALL ? 'none' : 'block'
      },
      miiImgWrapper: {
        width: '76px',
        height: '76px',
        boxShadow: '0px 5px 0px 0px rgba(0,0,0,0.4)',
        backgroundColor: '#fff',
        borderRadius: '5px'
      },
      footer: {
        height: '44px',
        width: '100%',
        lineHeight: '44px',
        fontSize: '18px',
        margin: '0 12px'
      },
      stats: {
        float: 'left',
        display: 'flex',
        alignItems: 'center',
        position: 'absolute'
      },
      statsStars: {
        width: screenSize === ScreenSize.SUPER_SMALL ? '28px' : '36px',
        height: screenSize === ScreenSize.SUPER_SMALL ? '28px' : '36px',
        margin: '0 8px',
        cursor: 'pointer'
      },
      statsDownloads: {
        width: screenSize === ScreenSize.SUPER_SMALL ? '20px' : '24px',
        height: screenSize === ScreenSize.SUPER_SMALL ? '20px' : '24px',
        margin: '0 8px'
      },
      statsText: {
        fontSize: '12px'
      },
      statsAutoScroll: {
        height: '24px',
        margin: '0 8px'
      },
      maker: {
        float: 'right',
        width: 'auto',
        display: 'flex',
        alignItems: 'center'
      },
      makerRep: {
        width: '10px',
        height: '10px',
        margin: '0 8px'
      },
      makerName: {
        color: '#000',
        fontSize: '22px',
        marginLeft: '14px'
      },
      bottom: {
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap'
      },
      edit: {
        padding: '10px',
        display: 'flex',
        flexWrap: 'wrap'
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
      },
      option: {
        width: '50%',
        padding: '10px',
        textAlign: 'left',
        fontSize: '16px'
      },
      input: {
        width: '100%',
        height: '32px',
        fontSize: '18px'
      },
      imgLarge: {
        maxWidth: '320px',
        maxHeight: '240px'
      },
      buttonPanel: {
        width: screenSize >= ScreenSize.MEDIUM ? 'calc(100% - 360px)' : 'auto',
        margin: screenSize < ScreenSize.MEDIUM ? '20px' : '0 20px',
        display: 'flex',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
      }
    }
    return (
      <div style={styles.panel} onClick={this.onShowDetails}>
        <div style={styles.rank} />
        <div style={styles.details}>
          <div style={styles.top}>
            <div style={styles.theme}>
              <img src={
                style === 0 ? (
                  '/img/smb.png'
                ) : (
                  style === 1 ? (
                    '/img/smb3.png'
                  ) : (
                    style === 2 ? (
                      '/img/smw.png'
                    ) : (
                      '/img/nsmbu.png'
                    )
                  )
                )
              } />
            </div>
            <div style={styles.title}>
              { course.title } by { course.maker }
            </div>
            <div style={styles.close} onClick={this.onHideDetails}>
              <img style={{width: '100%'}} src='/img/cancel.svg' />
            </div>
            <div style={styles.preview}>
              <div style={styles.previewImgWrapper}>
                <LazyLoad height={81} offset={100} once>
                  <img
                    style={styles.previewImg}
                    src={`/courseimg/${course.id}_full${course.vFull ? `?v=${course.vFull}` : ''}`}
                    ref={v => { this.full = v }}
                  />
                </LazyLoad>
              </div>
            </div>
            {
              false &&
              <div style={styles.mii}>
                <div style={styles.miiImgWrapper}>
                  <img style={{width: '100%'}} src='/img/mii_default.png' />
                </div>
              </div>
            }
            <div style={styles.footer}>
              <div style={styles.stats}>
                <img
                  onClick={this.onStar}
                  style={styles.statsStars}
                  src={course.starred ? '/img/starred.png' : '/img/unstarred.png'}
                />
                { course.stars } /
                <img style={styles.statsDownloads} src='/img/downloads.png' />
                { course.downloads }
                <img style={styles.statsDownloads} src={
                  course.difficulty === 0 ? (
                    '/img/easy.png'
                  ) : (
                    course.difficulty === 1 ? (
                      '/img/normal.png'
                    ) : (
                      course.difficulty === 2 ? (
                        '/img/expert.png'
                      ) : (
                        course.difficulty === 3 ? (
                          '/img/superexpert.png'
                        ) : (
                          '/img/normal.png'
                        )
                      )
                    )
                  )
                } />
                {
                  screenSize > ScreenSize.SUPER_SMALL && (
                  <div style={styles.statsText}>
                    {
                      course.difficulty === 0 ? (
                        'easy'
                      ) : (
                        course.difficulty === 1 ? (
                          'normal'
                        ) : (
                          course.difficulty === 2 ? (
                            'expert'
                          ) : (
                            course.difficulty === 3 ? (
                              's. expert'
                            ) : (
                              '-'
                            )
                          )
                        )
                      )
                    }
                  </div>
                )}
                {
                  course.autoScroll === 1 ? (
                    <img style={styles.statsAutoScroll} src='/img/slow.png' />
                  ) : (
                    course.autoScroll === 2 ? (
                      <img style={styles.statsAutoScroll} src='/img/medium.png' />
                    ) : (
                      course.autoScroll === 3 && (
                        <img style={styles.statsAutoScroll} src='/img/fast.png' />
                      )
                    )
                  )
                }
                {
                  this.props.course.autoScrollSub === 1 ? (
                    <img style={styles.statsAutoScroll} src='/img/slow.png' />
                  ) : (
                    this.props.course.autoScrollSub === 2 ? (
                      <img style={styles.statsAutoScroll} src='/img/medium.png' />
                    ) : (
                      this.props.course.autoScrollSub === 3 && (
                        <img style={styles.statsAutoScroll} src='/img/fast.png' />
                      )
                    )
                  )
                }
              </div>
              <div style={styles.maker}>
                <div style={styles.makerName}>
                  { course.uploader }
                </div>
              </div>
            </div>
          </div>
          {
            this.state.showDetails && (
            <div style={styles.bottom}>
              {
                this.props.canEdit && (
                <div style={styles.edit}>
                  <ReuploadArea courseId={course.id} upload={this.props.reupload} onUploadComplete={this.onReuploadComplete} />
                  <UploadImageArea
                    type='full'
                    courseId={course.id}
                    upload={this.props.imageFull}
                    onUploadComplete={this.onUploadFullComplete}
                  />
                  <UploadImageArea
                    type='prev'
                    courseId={course.id}
                    upload={this.props.imagePrev}
                    onUploadComplete={this.onUploadPrevComplete}
                  />
                  <div style={styles.option}>
                    <div style={styles.value}>
                      Title:
                    </div>
                    <input style={styles.input} value={this.state.title} onChange={this.onTitleChange} />
                  </div>
                  <div style={styles.option}>
                    <div style={styles.value}>
                      Maker:
                    </div>
                    <input style={styles.input} value={this.state.maker} onChange={this.onMakerChange} />
                  </div>
                  <div style={styles.option}>
                    <div style={styles.value}>
                      Nintendo ID:
                    </div>
                    <input style={styles.input} value={this.state.nnId} onChange={this.onNintendoIdChange} />
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
                  <div style={{width: '100%'}}>Editor supports <a
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
              )}
              <div className='description' style={styles.editorRendered} ref={x => {
                this.renderer = x
                if (x && this.state.description) x.innerHTML = emojify(marked(this.state.description))
              }} />
              <div style={styles.imageLarge}>
                <img
                  style={styles.imgLarge}
                  src={`/courseimg/${course.id}${course.vPrev ? `?v=${course.vPrev}` : ''}`}
                  ref={v => { this.prev = v }}
                />
              </div>
              <div style={styles.buttonPanel}>
                <CourseDownloadButton
                  courseId={course.id}
                  lastModified={course.lastmodified}
                  modified={modified}
                  progress={progress}
                  saveId={saveId}
                  screenSize={screenSize}
                />
                {
                  course.videoid &&
                  <CourseVideoButton videoId={course.videoid} screenSize={screenSize} />
                }
                {
                  !process.env.ELECTRON &&
                  <img ref={qr => {
                    if (!qr) return
                    QRCode.toDataURL(resolve(process.env.DOMAIN!, `/api/downloadcourse?id=${course.id}&type=3ds`),
                      (err: any, url: any) => {
                        if (err) console.error(err)
                        qr.src = url
                      }
                    )
                  }} />
                }
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}
export const CoursePanel = connect((state: any) => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(Panel) as any
