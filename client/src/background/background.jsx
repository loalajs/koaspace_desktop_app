import React from "react";
import ReactDOM from "react-dom";

const Background = () => <p>Background process running </p>;

ReactDOM.render(<Background />, document.getElementById("index")); // eslint-disable-line no-undef
