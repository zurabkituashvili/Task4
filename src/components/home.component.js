import React, { Component } from "react";
import axios from "axios";
import { FaUnlock, FaTrash } from "react-icons/fa";

export default class Home extends Component {
  state = {
    users: [],
    selectedusers: [],
  };

  componentDidMount() {
    // Fetch all users' data
    axios.get("users").then((res) => {
      this.setState({ users: res.data.users });
    });

    const { user } = this.props;

    if (user) {
      // Check user's status periodically
      this.checkUserStatusInterval = setInterval(this.checkUserStatus, 3000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.checkUserStatusInterval);
  }

  checkUserStatus = () => {
    axios.get("/check-user-status").then((res) => {
      if (res.data.status === "inactive") {
        localStorage.clear(); // Clear local storage
      }
    });
  };

  checkUserStatus = () => {
    axios.get("/check-user-status").then((res) => {
      if (res.data.status === "inactive") {
        localStorage.clear();
      }
    });
  };

  toggleSelectUser = (userId) => {
    if (this.state.selectedusers.includes(userId)) {
      this.setState((prevState) => ({
        selectedusers: prevState.selectedusers.filter((id) => id !== userId),
      }));
    } else {
      this.setState((prevState) => ({
        selectedusers: [...prevState.selectedusers, userId],
      }));
    }
  };

  toggleSelectAll = () => {
    const { users, selectedusers } = this.state;
    if (selectedusers.length === users.length) {
      this.setState({ selectedusers: [] });
    } else {
      this.setState({ selectedusers: users.map((user) => user.id) });
    }
  };

  handleDelete = () => {
    const { selectedusers } = this.state;
    if (selectedusers.length === 0) {
      alert("Please select users to delete");
      return;
    }
    axios
      .post("/delete-users", { selectedUserIds: selectedusers })
      .then((res) => {
        window.location.reload();
      })
      .catch((err) => {
        console.error("Error deleting users:", err);
      });
  };

  handleBlock = () => {
    const { selectedusers } = this.state;
    const { user } = this.props;
    if (selectedusers.length === 0) {
      alert("Please select users to block");
      return;
    }
    axios
      .post("/block-users", { selectedUserIds: selectedusers })
      .then((res) => {
        if (selectedusers.includes(user.id)) {
          localStorage.clear();
          window.location.reload();
        }
        window.location.reload();
      })
      .catch((err) => {
        console.error("Error blocking users:", err);
      });
  };

  handleUnblock = () => {
    const { selectedusers } = this.state;
    if (selectedusers.length === 0) {
      alert("Please select users to delete");
      return;
    }
    axios
      .post("/unblock-users", { selectedUserIds: selectedusers })
      .then((res) => {
        window.location.reload();
      })
      .catch((err) => {
        console.error("Error unblocking users:", err);
      });
  };

  render() {
    const { user, loading } = this.props;
    const { users, selectedusers } = this.state;
    if (loading) {
      return <h2>Loading...</h2>;
    }
    if (user) {
      const nameParts = user.name?.split(" ") || [];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ");
      return (
        <div className="users-container">
          <h2>
            Hi {firstName} {lastName}
          </h2>
          <span className="ms-auto d-flex justify-content-start mb-3">
            <div className="d-flex justify-content-start mb-3">
              <button
                onClick={() => {
                  this.handleBlock();
                  this.checkUserStatus();
                }}
                className="btn btn-danger me-2"
                user={user}
                selectedusers={selectedusers}
              >
                Block
              </button>
              <button
                onClick={this.handleUnblock}
                className="btn btn-success me-2"
                user={user}
                selectedusers={selectedusers}
              >
                <FaUnlock />
                UnBlock
              </button>
              <button
                onClick={this.handleDelete}
                className="btn btn-warning "
                user={user}
                selectedusers={selectedusers}
              >
                <FaTrash />
                Delete
              </button>
            </div>
          </span>
          <h3>All Registered Users</h3>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Last Login</th>
                <th>Registration Time</th>
                <th>Status</th>
                <th>
                  Select All
                  <input
                    type="checkbox"
                    checked={selectedusers.length === users.length}
                    onChange={this.toggleSelectAll}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((userData) => (
                <tr key={userData.id}>
                  <td>{userData.id}</td>
                  <td>{userData.name}</td>
                  <td>{userData.email}</td>
                  <td>{userData.last_login}</td>
                  <td>{userData.registration_time}</td>
                  <td>{userData.status}</td>
                  <td className="tdc">
                    <input
                      type="checkbox"
                      checked={selectedusers.includes(userData.id)}
                      onChange={() => this.toggleSelectUser(userData.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return <h2>You are not logged in</h2>;
    }
  }
}
