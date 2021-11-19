import React from 'react'
import {
  connect
} from 'react-redux'
import {
  Map
} from 'immutable'
import got from 'got'

import { resolve } from 'url'

import SMMButton from '../../../client/components/buttons/SMMButton'
import {
  deleteCourse, setSaveCourse
} from '../../actions'
import {
  domain
} from '../../../static'

class SaveFileDetailsPanel extends React.PureComponent {
  constructor (props) {
    super(props)
    this.onDeleteCourse = this.onDeleteCourse.bind(this)
    this.onStarCourse = this.onStarCourse.bind(this)
  }
  onDeleteCourse () {
    this.props.dispatch(deleteCourse(this.props.save ? this.props.save.get('smmdbId') : null, this.props.courseId))
  }
  async onStarCourse () {
    try {
      const course = (await got(resolve(domain, `/api/starcourse?id=${this.props.save.get('smmdbId')}`), {
        headers: {
          'Authorization': `APIKEY ${this.props.apiKey}`
        },
        method: 'POST',
        json: true,
        rejectUnauthorized: false
      })).body
      if (course != null) {
        const save = Map(this.props.save.merge({ stars: course.stars, starred: !!course.starred }))
        this.props.dispatch(setSaveCourse(this.props.courseId, save))
        this.props.onSaveChange(save)
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
    const course = this.props.course
    const save = this.props.save && this.props.save.toJS()
    if (!course) return null
    const path = course ? course.getPath() : null
    const styles = {
      divHide: {
        display: 'none'
      },
      overflow: {
        height: '100%',
        display: 'flex',
        position: 'absolute',
        zIndex: '100',
        top: '0'
      },
      div: {
        backgroundColor: '#0d633d',
        border: '12px solid #42c074',
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column'
      },
      line: {
        width: '100%',
        height: '2px',
        backgroundColor: '#00452a'
      },
      header: {
        height: '40px',
        color: '#fff',
        fontSize: '18px',
        display: 'flex'
      },
      title: {
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: '1',
        margin: '0 10px'
      },
      cancel: {
        float: 'right',
        margin: '4px',
        width: '32px',
        height: '32px',
        boxSizing: 'border-box',
        borderRadius: '3px',
        backgroundColor: '#45b46a',
        cursor: 'pointer'
      },
      cancelImg: {
        width: '24px',
        height: '24px',
        margin: '4px'
      },
      body: {
      },
      bodyImg: {
        margin: '20px',
        width: '320px',
        height: '240px'
      },
      navigation: {
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        verticalAlign: 'top',
        height: '240px',
        margin: '20px',
        width: 'calc(100% - 400px)'
      },
      stars: {
        color: '#fff',
        fontSize: '18px',
        margin: '0 10px 10px 10px'
      },
      footer: {
        margin: '20px',
        width: '720px',
        height: '81px',
        overflow: 'hidden',
        textAlign: 'center'
      },
      footerImg: {
        height: '81px'
      }
    }
    return (
      <div style={styles.overflow}>
        <div style={styles.div}>
          <div style={styles.header}>
            <div style={styles.title}>
              {`${course.title} by ${course.maker}`}
            </div>
            <div style={styles.cancel} onClick={this.props.onClick}>
              <img style={styles.cancelImg} src='/img/cancel.svg' />
            </div>
          </div>
          <div style={styles.line} />
          <div style={styles.body}>
            <img style={styles.bodyImg} src={`${path}/thumbnail1.jpg`} />
            <div style={styles.navigation}>
              {
                save && save.smmdbId &&
                <div style={styles.stars}>{ save.stars } stars on SMMDB</div>
              }
              {
                save && save.smmdbId && this.props.apiKey &&
                <SMMButton
                  text={`${save.starred ? 'Unstar' : 'Star'} course on SMMDB`}
                  iconSrc='/img/starred.png'
                  padding='3px'
                  onClick={this.onStarCourse} />
              }
              <SMMButton text='Delete course' iconSrc='/img/delete.png' padding='3px' onClick={this.onDeleteCourse} />
            </div>
          </div>
          <div style={styles.line} />
          <div style={styles.footer}>
            <img style={styles.footerImg} src={`${path}/thumbnail0.jpg`} />
          </div>
        </div>
      </div>
    )
  }
}
export default connect()(SaveFileDetailsPanel)
