import * as React from 'react'
import { connect } from 'react-redux'
import { List, Map } from 'immutable'
import got from 'got'

import { resolve } from 'url'

import { SaveFilePanel } from '../panels/SaveFilePanel'
import { SaveFileDetailsPanel } from '../panels/SaveFileDetailsPanel'
import { setSelected, setSaveData } from '../../actions'

class View extends React.Component<any, any> {
  constructor (props: any) {
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
    this.setSaveCourse = this.setSaveCourse.bind(this)
    this.renderCourses = this.renderCourses.bind(this)
  }
  componentWillMount () {
    this.props.dispatch(setSelected(List()))
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp);
    (async () => {
      const ids = this.props.save.map((x: any) => x.get('smmdbId')).reduce((str: any, val: any) => (str + ',' + val))
      const courses = (await got(resolve(process.env.domain!, `/api/getcourses?ids=${ids}&filter=id,stars,starred`), Object.assign({
        json: true,
        useElectronNet: false
      }, this.props.apiKey ? {
        headers: {
          'Authorization': `APIKEY ${this.props.apiKey}`
        }
      } : null))).body
      const c: any = {}
      for (let i in courses) {
        c[courses[i].id] = courses[i]
        delete c[courses[i].id].id
      }
      const saveCourses = this.props.save.map((x: any) => x.merge(Map(c[x.get('smmdbId')])))
      this.props.dispatch(setSaveData(saveCourses))
    })()
  }
  componentWillUnmount () {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
  }
  componentWillReceiveProps (nextProps: any) {
    if (this.state.course && !nextProps.cemuSave.courses[`course${String(this.state.courseId).padStart(3, '000')}`]) {
      this.setState({
        course: null
      })
    }
  }
  onKeyDown (e: any) {
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
  onKeyUp (e: any) {
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
  onClickCtrl (i: any) {
    this.props.dispatch(setSelected(this.props.selected.get(i) ? this.props.selected.set(i, false) : this.props.selected.set(i, true)))
    this.setState({
      lastIndex: i
    })
  }
  onClickShift (i: any) {
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
    this.props
      .dispatch(setSelected(this.props.selected.set(i, true)
      .map((x: any, i: any) => i >= min && i <= max && this.props.cemuSave.courses[`course${String(i).padStart(3, '000')}`])))
  }
  showSaveDetails (course: any, save: any, courseId: any) {
    this.props.dispatch(setSelected(List()))
    this.setState({
      course,
      save,
      courseId,
      lastIndex: -1
    })
  }
  hideSaveDetails () {
    this.setState({
      course: null
    })
  }
  setSaveCourse (save: any) {
    this.setState({
      save
    })
  }
  renderCourses (courses: any) {
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
          <SaveFilePanel
            key={i}
            isSelected={selected.get(i)}
            onClick={ctrl ? self.onClickCtrl.bind(null, i) : shift ? self.onClickShift.bind(null, i) : showSaveDetails}
            course={course}
            save={save.get(String(i))}
            courseId={i}
          />
        )
      }
    })())
  }
  render () {
    const courses = this.props.cemuSave.courses
    const styles: React.CSSProperties = {
      div: {
        height: '100%',
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
        <SaveFileDetailsPanel
          course={this.state.course}
          save={this.state.save}
          courseId={this.state.courseId}
          apiKey={this.props.apiKey}
          onClick={this.hideSaveDetails}
          onSaveChange={this.setSaveCourse}
        />
        <div style={styles.ul} id='scroll'>
          {
            this.renderCourses(courses)
          }
        </div>
      </div>
    )
  }
}
export const SaveView = connect((state: any) => ({
  update: state.getIn(['electron', 'forceUpdate']),
  cemuSave: state.getIn(['electron', 'cemuSave']),
  save: state.getIn(['electron', 'appSaveData', 'cemuSaveData', state.getIn(['electron', 'currentSave']), 'save']),
  apiKey: state.getIn(['electron', 'appSaveData', 'apiKey']),
  saveFileEditor: state.getIn(['electron', 'saveFileEditor']),
  selected: state.getIn(['electron', 'selected'])
}))(View)
