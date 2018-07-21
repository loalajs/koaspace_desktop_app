import React from "react";
import ReactDOM from "react-dom";
import "bootstrap";
import style from "./index.scss"; // eslint-disable-line no-unused-vars

const Index = () => (
  <div id="welcome_msg">
    <h1>Hello World</h1>
  </div>
);

ReactDOM.render(<Index />, document.getElementById("index")); // eslint-disable-line no-undef
