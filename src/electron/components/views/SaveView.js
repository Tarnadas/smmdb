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
      this.state.courseNames.push(`course${pad(i, 3)}`)
    }
    this.showSaveDetails = this.showSaveDetails.bind(this)
    this.hideSaveDetails = this.hideSaveDetails.bind(this)
  }
  showSaveDetails (course, smmdbId, courseId, saveId) {
    this.setState({
      course,
      smmdbId,
      courseId,
      saveId
    })
  }
  hideSaveDetails () {
    this.setState({
      course: null
    })
  }
  componentWillReceiveProps (nextProps, nextContext) {
    if (!!this.state.course && !nextProps.courses[`course${pad(this.state.course.id, 3)}`]) {
      this.setState({
        course: null
      })
    }
  }
  render () {
    const courses = this.props.cemuSave.courses
    const save = this.props.save ? this.props.save.toJS() : null
    const styles = {
      div: {
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden'
      },
      ul: {
        margin: 'auto',
        width: 'calc(100% - 180px)',
        height: 'calc(100% - 80px)',
        backgroundColor: '#07070f',
        color: '#fff',
        overflowY: 'scroll',
        border: '12px solid #6e6e85',
        listStyleType: 'none'
      }
    }
    const self = this;
    return (
      <div style={styles.div}>
        <SaveFileDetailsPanel course={this.state.course} smmdbId={this.state.smmdbId} courseId={this.state.courseId} saveId={this.state.saveId} onClick={this.hideSaveDetails} />
        <ul style={styles.ul}>
          {
            Array.from((function* () {
              for (let i = 0; i < 120; i++) {
                let course = courses[self.state.courseNames[i]]
                yield <SaveFilePanel onClick={self.showSaveDetails} course={course} smmdbId={
                  save && save[i] && save[i].smmdbId && save[i].smmdbId
                } courseId={
                  save && save[i] && save[i].courseId && save[i].courseId
                } saveId={i} key={self.state.courseNames[i]} />
              }
            })())
          }
        </ul>
      </div>
    )
  }
}
export default connect(state => ({
  cemuSave: state.getIn(['electron', 'cemuSave']),
  save: state.getIn(['electron', 'appSaveData', 'cemuSaveData', state.get('currentSave'), 'save']),
  saveFileEditor: state.getIn(['electron', 'saveFileEditor'])
}))(SaveView)

const pad = (n, size) => {
  let s = String(n)
  while (s.length < (size || 2)) {
    s = '0' + s
  }
  return s
}
