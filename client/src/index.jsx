import React from "react";
import ReactDOM from "react-dom";
// import "bootstrap";
import style from "./index.scss"; // eslint-disable-line no-unused-vars

const Index = () => (
  <section className="banner-area relative">
    <div className="overlay overlay-bg" />
    <div className="container">
      <div className="row fullscreen justify-content-center align-items-center">
        <div className="col-lg-8">
          <div className="banner-content text-center">
            <p className="text-uppercase text-white">Koaspace Beta 0.1</p>
            <h1 className="text-uppercase text-white">
              Custom & On-Demand Personal Files Synchronization App
            </h1>
            <button href className="primary-btn banner-btn">
              Sync
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

ReactDOM.render(<Index />, document.getElementById("index")); // eslint-disable-line no-undef
