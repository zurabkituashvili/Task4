import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Nav extends Component {
  handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    let buttons;
    if (this.props.user) {
      buttons = (
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link to={"/"} onClick={this.handleLogout} className="nav-link">
              Logout
            </Link>
          </li>
        </ul>
      );
    } else {
      buttons = (
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link to={"/login"} className="nav-link">
              Login
            </Link>
          </li>
          <li className="nav-item">
            <Link to={"/register"} className="nav-link">
              Sign up
            </Link>
          </li>
        </ul>
      );
    }
    return (
      <nav
        className="navbar navbar-expand navbar-light fixed-top position-sticky"
        style={{ width: "auto" }}
      >
        <div className="container">
          <Link to={"/"} className="navbar-brand">
            Home
          </Link>
          <div className="collapse navbar-collapse">{buttons}</div>
        </div>
      </nav>
    );
  }
}
