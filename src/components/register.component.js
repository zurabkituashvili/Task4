import React, { Component } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

export default class Register extends Component {
  state = {
    registrationSuccess: false,
    errors: {},
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      password: this.password,
      password_confirm: this.confirmPassword,
    };
    const errors = {};
    if (!this.firstName) {
      errors.firstName = "Please enter your first name";
    }
    if (!this.lastName) {
      errors.lastName = "Please enter your last name";
    }
    if (!this.email) {
      errors.email = "Please enter your email";
    }
    if (!this.password) {
      errors.password = "Please enter your password";
    }
    if (!this.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    }
    if (this.password !== this.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }
    axios
      .post("register", data)
      .then((res) => {
        console.log(res);
        this.setState({ registrationSuccess: true });
      })
      .catch((err) => {
        console.log(err);
        if (
          err.response &&
          err.response.data.error === "Email already registered."
        ) {
          this.setState({
            errors: {
              ...this.state.errors,
              email: "Email is already registered. Please use another email.",
            },
          });
        }
      });
  };

  render() {
    if (this.state.registrationSuccess) {
      return <Navigate to="/login" />;
    }
    return (
      <form onSubmit={this.handleSubmit}>
        <h3>Sign up</h3>
        <div className="mb-3">
          <label>First Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="First Name"
            onChange={(e) => (this.firstName = e.target.value)}
          />
          {this.state.errors.firstName && (
            <div className="text-danger">{this.state.errors.firstName}</div>
          )}
        </div>
        <div className="mb-3">
          <label>Last Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Last Name"
            onChange={(e) => (this.lastName = e.target.value)}
          />
          {this.state.errors.lastName && (
            <div className="text-danger">{this.state.errors.lastName}</div>
          )}
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="Email"
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
          {this.state.errors.password && (
            <div className="text-danger">{this.state.errors.password}</div>
          )}
        </div>
        <div className="mb-3">
          <label>Confirm Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Confirm Password"
            onChange={(e) => (this.confirmPassword = e.target.value)}
          />
          {this.state.errors.confirmPassword && (
            <div className="text-danger">
              {this.state.errors.confirmPassword}
            </div>
          )}
        </div>

        <button className="btn btn-primary w-100">Sign Up</button>
      </form>
    );
  }
}
