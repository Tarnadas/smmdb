import React from 'react'
import {
  connect
} from 'react-redux'
import {
  List
} from 'immutable'

import SaveFilePanel from '../panels/SaveFilePanel'
import SaveFileDetailsPanel from '../panels/SaveFileDetailsPanel'
import {
  setSelected
} from '../../actions'

class SaveView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      courseNames: [],
      course: null,
      ctrl: false,
      shift: false,
      lastIndex: -1
    }
    for (let i = 0; i < 120; i++) {
      this.state.courseNames.push(`course${String(i).padStart(3, '000')}`)
    }
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
    this.onClickCtrl = this.onClickCtrl.bind(this)
    this.onClickShift = this.onClickShift.bind(this)
    this.showSaveDetails = this.showSaveDetails.bind(this)
    this.hideSaveDetails = this.hideSaveDetails.bind(this)
    this.renderCourses = this.renderCourses.bind(this)
  }
  componentWillMount () {
    this.props.dispatch(setSelected(List()))
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
  }
  componentWillUnmount () {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
  }
  componentWillReceiveProps (nextProps, nextContext) {
    if (this.state.course && !nextProps.cemuSave.courses[`course${String(this.state.courseId).padStart(3, '000')}`]) {
      this.setState({
        course: null
      })
    }
  }
  onKeyDown (e) {
    if (e.key === 'Control' && !this.state.ctrl) {
      this.setState({
        ctrl: true
      })
    }
    if (e.key === 'Shift' && !this.state.shift) {
      this.setState({
        shift: true
      })
    }
  }
  onKeyUp (e) {
    if (e.key === 'Control' && this.state.ctrl) {
      this.setState({
        ctrl: false
      })
    }
    if (e.key === 'Shift' && this.state.shift) {
      this.setState({
        shift: false
      })
    }
  }
  onClickCtrl (i) {
    this.props.dispatch(setSelected(this.props.selected.get(i) ? this.props.selected.set(i, false) : this.props.selected.set(i, true)))
    this.setState({
      lastIndex: i
    })
  }
  onClickShift (i) {
    let min = i
    let max = i
    if (this.state.lastIndex !== -1) {
      if (i < this.state.lastIndex) {
        min = i
        max = this.state.lastIndex
      } else if (i > this.state.lastIndex) {
        min = this.state.lastIndex
        max = i
      }
    } else {
      this.setState({
        lastIndex: i
      })
    }
    this.props.dispatch(setSelected(this.props.selected.set(i, true).map((x, i) => i >= min && i <= max && this.props.cemuSave.courses[`course${String(i).padStart(3, '000')}`])))
  }
  showSaveDetails (course, smmdbId, courseId) {
    this.props.dispatch(setSelected(List()))
    this.setState({
      course,
      smmdbId,
      courseId,
      lastIndex: -1
    })
  }
  hideSaveDetails () {
    this.setState({
      course: null
    })
  }
  renderCourses (courses) {
    const self = this
    const save = this.props.save
    const ctrl = this.state.ctrl
    const shift = this.state.shift
    const showSaveDetails = this.showSaveDetails
    const selected = this.props.selected
    return Array.from((function * () {
      for (let i = 0; i < 120; i++) {
        const courseName = `course${String(i).padStart(3, '000')}`
        const course = courses.hasOwnProperty(courseName) ? courses[courseName] : null
        yield (
          <SaveFilePanel key={i} isSelected={selected.get(i)} onClick={ctrl ? self.onClickCtrl.bind(null, i) : shift ? self.onClickShift.bind(null, i) : showSaveDetails} course={course} smmdbId={save.getIn([String(i), 'smmdbId'])} courseId={i} />
        )
      }
    })())
  }
  render () {
    const courses = this.props.cemuSave.courses
    const styles = {
      div: {
        display: 'flex',
        justifyContent: 'center',
        padding: '30px',
        background: 'linear-gradient(to right, rgba(252,234,187,1) 0%, rgba(250,236,77,1) 50%, rgba(247,206,0,1) 50%, rgba(251,223,147,1) 100%)'
      },
      ul: {
        display: 'flex',
        flexWrap: 'wrap',
        backgroundColor: '#07070f',
        color: '#fff',
        overflowY: 'scroll',
        border: '12px solid #6e6e85',
        borderRadius: '10px',
        justifyContent: 'space-around'
      }
    }
    return (
      <div style={styles.div}>
        <SaveFileDetailsPanel course={this.state.course} smmdbId={this.state.smmdbId} courseId={this.state.courseId} onClick={this.hideSaveDetails} />
        <div style={styles.ul} id='scroll'>
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
  saveFileEditor: state.getIn(['electron', 'saveFileEditor']),
  selected: state.getIn(['electron', 'selected'])
}))(SaveView)
