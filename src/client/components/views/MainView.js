import React from 'react'

export default class MainView extends React.PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            courses: []
        }
    }
    componentDidMount () {
        (async () => {
            const courses =
            this.setState({
                courses
            });
        })();
    }
    render () {

    }
}