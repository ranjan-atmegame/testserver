import React, { Component } from 'react';
import { API_URL } from '../constants/api';

class App extends Component {

    componentDidMount() {
        console.log('fetch category api')
        fetch(`${API_URL}/category?isMainMenu=true&order=order:asc&limit=10`)
            .then(result => {
                console.log(result)
            })
    }

    render() {
        return (
            <div>Hi App</div>
        )
    }
}

export default App;