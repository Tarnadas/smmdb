import * as React from 'react'
import { connect, Dispatch } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import { push } from 'react-router-redux'

import { SMMButton } from '../buttons/SMMButton'
import { FilterCloseButton } from '../buttons/FilterCloseButton'
import { ScreenSize } from '../../reducers/mediaQuery'
import { Filter2, Difficulty2, GameStyle2, CourseTheme2, AutoScroll2 } from '@/client/models/Course2'
import { State } from '@/client/models/State'

const MAX_LENGTH_TITLE = 0x20
const MAX_LENGTH_UPLOADER = 0x20

interface Filter2AreaProps {
  filter: Filter2
  applyFilter: any
  screenSize: number
  dispatch: Dispatch<State>
}

type Filter2AreaState = Filter2

class Filter2Area extends React.PureComponent<Filter2AreaProps, Filter2AreaState> {
  private onTitleChange: any
  private onUploaderChange: any
  private onLastModifiedFromChange: any
  private onLastModifiedToChange: any
  private onUploadedFromChange: any
  private onUploadedToChange: any
  private onDifficultyChange: any
  private onDifficultyToChange: any
  private onGameStyleChange: any
  private onCourseThemeChange: any
  private onCourseThemeSubChange: any
  private onAutoScrollChange: any

  public constructor (props: Filter2AreaProps) {
    super(props)
    this.state = {
      ...props.filter
    }
    this.getFilter = this.getFilter.bind(this)
    this.setFilter = this.setFilter.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.onTitleChange = this.onStringChange.bind(this, 'title', MAX_LENGTH_TITLE)
    this.onUploaderChange = this.onStringChange.bind(this, 'uploader', MAX_LENGTH_UPLOADER)
    this.onLastModifiedFromChange = this.onDateChange.bind(this, 'lastmodifiedfrom')
    this.onLastModifiedToChange = this.onDateChange.bind(this, 'lastmodifiedto')
    this.onUploadedFromChange = this.onDateChange.bind(this, 'uploadedfrom')
    this.onUploadedToChange = this.onDateChange.bind(this, 'uploadedto')
    this.onDifficultyChange = this.onSelectChange.bind(this, 'difficulty')
    this.onGameStyleChange = this.onSelectChange.bind(this, 'gamestyle')
    this.onCourseThemeChange = this.onSelectChange.bind(this, 'coursetheme')
    this.onCourseThemeSubChange = this.onSelectChange.bind(this, 'coursethemesub')
    this.onAutoScrollChange = this.onSelectChange.bind(this, 'autoscroll')
  }

  private getFilter (): Filter2 {
    return this.state
  }

  private setFilter (): void {
    const filter = this.getFilter()
    this.props.applyFilter(filter)
    this.props.dispatch(push('/courses2'))
  }

  private handleKeyPress ({ key }: React.KeyboardEvent<HTMLInputElement>): void {
    if (key !== 'Enter') return
    this.setFilter()
  }

  private onStringChange (value: any, limit: any, { target }: any): void {
    if (!target) return
    let val = target.value
    if (val.length > limit) {
      val = val.substr(0, limit)
    }
    const res: any = {}
    res[value] = val
    this.setState(res)
  }

  private onDateChange (value: string, e: any): void {
    const offset = (new Date()).getTimezoneOffset() * -1
    const sign = (new Date()).getTimezoneOffset() >= 0 ? '-' : '+'
    const res: any = {}
    res[value] = (new Date(`${e.target.value}T00:00:00${sign}${String(offset / 60).padStart(2, '00')}:${String(offset % 60).padStart(2, '00')}`)).valueOf()
    if (value.includes('to')) {
      res[value] += 1000 * 60 * 60 * 24 - 1
    }
    this.setState(res)
  }

  private onSelectChange (value: any, e: any): void {
    const val = e.target.value
    const res: any = {}
    res[value] = val
    this.setState(res)
  }

  public render (): JSX.Element {
    const { screenSize } = this.props
    const { title, uploader, lastmodifiedfrom, lastmodifiedto, uploadedfrom, uploadedto, difficulty, gamestyle, coursetheme, coursethemesub, autoscroll } = this.state
    const styles: any = {
      area: {
        textAlign: 'left',
        position: 'fixed',
        width: '1050px',
        height: 'auto',
        maxWidth: '100%',
        maxHeight: '100%',
        overflow: 'auto',
        top: screenSize < ScreenSize.MEDIUM ? '0' : '',
        left: screenSize < ScreenSize.MEDIUM ? '0' : '',
        backgroundColor: '#ffcf00',
        borderRadius: '12px',
        boxShadow: '0px 0px 4px 12px rgba(0,0,0,0.1)',
        fontSize: '24px',
        padding: '15px 5px',
        zIndex: '101'
      },
      title: {
        width: 'calc(100% - 44px)',
        textAlign: 'center',
        fontSize: '34px',
        height: '40px',
        lineHeight: '40px'
      },
      option: {
        height: 'auto',
        width: '50%',
        padding: '10px'
      },
      value: {
        height: '32px',
        lineHeight: '32px'
      },
      input: {
        width: '100%',
        height: '32px',
        fontSize: '18px'
      },
      date: {
        height: 'auto'
      },
      dateInput: {
        width: 'auto',
        height: '32px',
        maxWidth: '100%',
        maxHeight: '100%',
        fontSize: '18px'
      }
    }
    return (
      <div style={styles.area}>
        <div style={styles.title}>
          Filters
        </div>
        <Link to='/courses2' style={{width: 'auto'}}>
          <FilterCloseButton getFilter={this.getFilter} />
        </Link>
        <div style={styles.option}>
          <div style={styles.value}>
            Title:
          </div>
          <input
            style={styles.input}
            value={title}
            onChange={this.onTitleChange}
            onKeyPress={this.handleKeyPress}
          />
        </div>
        <div style={styles.option}>
          <div style={styles.value}>
            Uploader:
          </div>
          <input
            style={styles.input}
            value={uploader}
            onChange={this.onUploaderChange}
            onKeyPress={this.handleKeyPress}
          />
        </div>
        {/* <div style={styles.option}>
          <div style={styles.value}>
            Last modified:
          </div>
          <div style={styles.date}>
            <span>from </span>
            <input
              style={styles.dateInput}
              type='date'
              value={!lastmodifiedfrom ? ''
                : (new Date(lastmodifiedfrom - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, -14)
              }
              onChange={this.onLastModifiedFromChange}
            /><br />
            <span>to </span>
            <input
              style={styles.dateInput}
              type='date'
              value={!lastmodifiedto ? ''
                : (new Date(lastmodifiedto - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, -14)
              }
              onChange={this.onLastModifiedToChange}
            />
          </div>
        </div>
        <div style={styles.option}>
          <div style={styles.value}>
            Uploaded:
          </div>
          <div style={styles.date}>
            <span>from </span>
            <input
              style={styles.dateInput}
              type='date'
              value={!uploadedfrom ? ''
                : (new Date(uploadedfrom - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, -14)
              }
              onChange={this.onUploadedFromChange}
            /><br />
            <span>to </span>
            <input
              style={styles.dateInput}
              type='date'
              value={!uploadedto ? ''
                : (new Date(uploadedto - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, -14)
              }
              onChange={this.onUploadedToChange}
            />
          </div>
        </div> */}
        <div style={styles.option}>
          <div style={styles.value}>
            Difficulty:
          </div>
          <div style={styles.date}>
            <select style={styles.dateInput} value={difficulty} onChange={this.onDifficultyChange}>
              <option value='' />
              {
                Object.entries(Difficulty2).map(([key, value]) => (
                  <option value={value} key={key}>{key}</option>
                ))
              }
            </select>
          </div>
        </div><br />
        {/* <div style={styles.option}>
          <div style={styles.value}>
            Game Style:
          </div>
          <div style={styles.date}>
            <select style={styles.dateInput} value={gamestyle} onChange={this.onGameStyleChange}>
              <option value='' />
              {
                Object.entries(GameStyle2).map(([key, value]) => (
                  <option value={key} key={key}>{value}</option>
                ))
              }
            </select>
          </div>
        </div><br />
        <div style={styles.option}>
          <div style={styles.value}>
            Course Theme:
          </div>
          <div style={styles.date}>
            <select style={styles.dateInput} value={coursetheme} onChange={this.onCourseThemeChange}>
              <option value='' />
              {
                Object.entries(CourseTheme2).map(([key, value]) => (
                  <option value={key} key={key}>{value}</option>
                ))
              }
            </select>
          </div>
        </div>
        <div style={styles.option}>
          <div style={styles.value}>
            Subcourse Theme:
          </div>
          <div style={styles.date}>
            <select style={styles.dateInput} value={coursethemesub} onChange={this.onCourseThemeSubChange}>
              <option value='' />
              {
                Object.entries(GameStyle2).map(([key, value]) => (
                  <option value={key} key={key}>{value}</option>
                ))
              }
            </select>
          </div>
        </div>
        <div style={styles.option}>
          <div style={styles.value}>
            Autoscroll:
          </div>
          <div style={styles.date}>
            <select style={styles.dateInput} value={autoscroll} onChange={this.onAutoScrollChange}>
              <option value='' />
              {
                Object.entries(AutoScroll2).map(([key, value]) => (
                  <option value={key} key={key}>{value}</option>
                ))
              }
            </select>
          </div>
        </div><br /> */}
        <SMMButton text='Apply' iconSrc='/img/filter.svg' fontSize='13px' padding='3px' onClick={this.setFilter} />
      </div>
    )
  }
}
export default withRouter(connect((state: any): any => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(Filter2Area as any) as any) as any
