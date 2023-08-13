import React, { Component } from "react";
import axios from "axios";

export default class Login extends Component {
  state = {
    errors: {},
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      email: this.email,
      password: this.password,
      status: this.status,
    };
    axios
      .post("login", data)
      .then((res) => {
        const token = res.data.token;
        localStorage.setItem("token", token);
        window.location.reload();
        this.props.setUser(res.data.user);
      })
      .catch((err) => {
        if (
          err.response &&
          (err.response.data.error === "Invalid credentials" ||
            err.response.data.error === "User not found")
        ) {
          this.setState({
            errors: {
              email: "Email or password is incorrect.",
            },
          });
        } else if (
          err.response &&
          err.response.data.error === "User is inactive"
        ) {
          this.setState({
            errors: {
              email: "User is blocked.",
            },
          });
        } else {
          console.log(err);
        }
      });
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <h3>Log in</h3>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            onChange={(e) => (this.email = e.target.value)}
          />
          {this.state.errors.email && (
            <div className="text-danger">{this.state.errors.email}</div>
          )}
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            onChange={(e) => (this.password = e.target.value)}
          />
        </div>
        <button className="btn btn-primary w-100">Login</button>
      </form>
    );
  }
}
