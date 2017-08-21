import React from 'react'
import {
  connect
} from 'react-redux'

import SaveFilePanel from '../panels/SaveFilePanel'
import SaveFileDetailsPanel from '../panels/SaveFileDetailsPanel'

class SaveView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      courseNames: [],
      course: null
    }
    for (let i = 0; i < 120; i++) {
      this.state.courseNames.push(`course${String(i).padStart(3, '000')}`)
    }
    this.showSaveDetails = this.showSaveDetails.bind(this)
    this.hideSaveDetails = this.hideSaveDetails.bind(this)
    this.renderCourses = this.renderCourses.bind(this)
  }
  componentWillReceiveProps (nextProps, nextContext) {
    if (this.state.course && !nextProps.cemuSave.courses[`course${String(this.state.courseId).padStart(3, '000')}`]) {
      this.setState({
        course: null
      })
    }
  }
  showSaveDetails (course, smmdbId, courseId) {
    this.setState({
      course,
      smmdbId,
      courseId
    })
  }
  hideSaveDetails () {
    this.setState({
      course: null
    })
  }
  renderCourses (courses) {
    const save = this.props.save
    const showSaveDetails = this.showSaveDetails
    return Array.from((function * () {
      for (let i = 0; i < 120; i++) {
        const courseName = `course${String(i).padStart(3, '000')}`
        const course = courses.hasOwnProperty(courseName) ? courses[courseName] : null
        yield (
          <SaveFilePanel key={i} onClick={showSaveDetails} course={course} smmdbId={save.getIn([String(i), 'smmdbId'])} courseId={i} />
        )
      }
    })())
  }
  render () {
    const courses = this.props.cemuSave.courses
    const styles = {
      div: {
        display: 'flex',
        justifyContent: 'center'
      },
      ul: {
        margin: 'auto',
        width: 'calc(100% - 180px)',
        height: 'calc(100% - 40px)',
        backgroundColor: '#07070f',
        color: '#fff',
        overflowY: 'scroll',
        border: '12px solid #6e6e85',
        listStyleType: 'none'
      }
    }
    return (
      <div style={styles.div}>
        <SaveFileDetailsPanel course={this.state.course} smmdbId={this.state.smmdbId} courseId={this.state.courseId} onClick={this.hideSaveDetails} />
        <div style={styles.ul}>
          {
            this.renderCourses(courses)
          }
        </div>
      </div>
    )
  }
}
export default connect(state => ({
  update: state.getIn(['electron', 'forceUpdate']),
  cemuSave: state.getIn(['electron', 'cemuSave']),
  save: state.getIn(['electron', 'appSaveData', 'cemuSaveData', state.getIn(['electron', 'currentSave']), 'save']),
  saveFileEditor: state.getIn(['electron', 'saveFileEditor'])
}))(SaveView)
