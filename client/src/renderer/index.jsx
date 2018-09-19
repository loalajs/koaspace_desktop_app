import React from "react";
import ReactDOM from "react-dom";

import style from "./index.scss"; // eslint-disable-line no-unused-vars

const electron = window.require("electron");
const ipcRenderer = electron.ipcRenderer;

class Index extends React.Component {
  constructor() {
    super();
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  handleButtonClick(event) {
    // Add a reference to this function.
    this.funcName = "handleButtonClick";
    console.log(`Button is clicked: ${event}`);
    ipcRenderer.on("responseOnButtonClick", (__, arg) => {
      console.log(arg); // prints "pong"
    });
    ipcRenderer.send("buttonClick", "Message from renderer process.");
  }

  render() {
    return (
      <section className="banner-area relative">
        <div className="overlay overlay-bg" />
        <div className="container">
          <div className="row fullscreen justify-content-center align-items-center">
            <div className="col-lg-8">
              <div className="banner-content text-center">
                <p className="text-uppercase text-white">Koaspace Beta 1.0</p>
                <h1 className="text-uppercase text-white">
                  Custom & On-Demand Personal Files Synchronization App
                </h1>
                <button
                  onClick={this.handleButtonClick}
                  className="primary-btn banner-btn"
                >
                  Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

ReactDOM.render(<Index />, document.getElementById("index")); // eslint-disable-line no-undef
