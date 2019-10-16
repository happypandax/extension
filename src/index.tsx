import React from 'react';
import ReactDOM from 'react-dom';

if (typeof !global.chrome === "undefined") {
    global.browser = require("webextension-polyfill")
}

if (typeof global.browser === "undefined") { // to make it work outside of add-on context
    global.browser = null
}

/*eslint-disable */
import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
/*eslint-enable */

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
