import React from 'react'
import {
    connect
} from 'react-redux'
import got from 'got'
import stream from 'filereader-stream'
import concat from 'concat-stream'

import { resolve } from 'url'

import { domain } from '../../../static'
import {
    setCoursesUploaded
} from '../../actions'

class UploadArea extends React.PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            value: ''
        };
        this.sendCourse = this.sendCourse.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    sendCourse (course) {
        try {
            const req = got.stream.post(resolve(domain, `/api/uploadcourse?apikey=${this.props.apiKey}`), {
                headers: { "Content-Type": "application/octet-stream" }
            });
            req.pipe(concat(buf => {
                const courses = JSON.parse(new TextDecoder("utf-8").decode(buf));
                this.props.dispatch(setCoursesUploaded(courses, true));
            }));
            stream(course).pipe(req);
        } catch (err) {
            console.log(err.response.body);
        }
    }
    handleChange (e) {
        this.setState({
            value: e.target.value
        });
        this.sendCourse(e.target.files[0]);
    }
    render () {
        const styles = {
            drag: {
                height: 'auto',
                width: 'auto',
                padding: '40px 20px',
                marginBottom: '10px',
                background: '#fff',
                color: '#000',
                fontSize: '20px',
                border: ' 4px dashed #000000',
                borderRadius: '20px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            },
            input: {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                zIndex: '20',
                opacity: '0',
                cursor: 'pointer'
            }
        };
        return (
            <div style={styles.drag}>
                <input style={styles.input} type="file" value={this.state.value} onChange={this.handleChange} />
                Drag and drop or click here to upload a course (not working)
            </div>
        )
    }
}
export default connect(state => ({
    apiKey: state.getIn(['userData', 'accountData', 'apikey'])
}))(UploadArea)