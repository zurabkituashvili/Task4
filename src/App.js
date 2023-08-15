import React, { Component } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./index.css";
import Home from "./components/home.component";
import Nav from "./components/nav.component";
import Login from "./components/login.component";
import Register from "./components/register.component";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Navigate } from "react-router-dom";

export default class App extends Component {
  state = {
    user: null,
    loading: true,
    selectedUsers: [],
  };

  componentDidMount = () => {
    axios.get("user").then(
      (res) => {
        this.setState({
          user: res.data.user,
          loading: false,
        });
      },
      (err) => {
        console.log(err);
        this.setState({
          loading: false,
        });
      }
    );
  };

  setUser = (user) => {
    this.setState({
      user: user,
    });
  };

  render() {
    const { user, loading, selectedUsers } = this.state;
    return (
      <BrowserRouter>
        <div className="App">
          <Nav user={this.state.user} />
          <div className="auth-wrapper">
            <div className="auth-inner">
              <Routes>
                <Route
                  exact
                  path="/"
                  Component={() => (
                    <Home
                      user={user}
                      loading={loading}
                      selectedUsers={selectedUsers}
                    />
                  )}
                />
                <Route
                  exact
                  path="/login"
                  Component={() => (
                    <>
                      {this.state.user ? (
                        <Navigate to="/" />
                      ) : (
                        <Login setUser={this.setUser} />
                      )}
                    </>
                  )}
                />
                <Route
                  exact
                  path="/register"
                  Component={() => (
                    <>
                      {this.state.user ? <Navigate to="/" /> : <Register />}
                      {this.state.user &&
                        this.state.user.registrationSuccess && (
                          <Navigate to="/login" />
                        )}
                    </>
                  )}
                />{" "}
              </Routes>
            </div>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}
