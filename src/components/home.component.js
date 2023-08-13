import React, { Component } from "react";
import axios from "axios";
import { FaUnlock, FaTrash } from "react-icons/fa";

export default class Home extends Component {
  state = {
    users: [],
    selectedUsers: [],
  };

  componentDidMount() {
    axios.get("users").then((res) => {
      this.setState({ users: res.data.users });
    });
    const { user } = this.props;
    if (user) {
      this.checkUserStatusInterval = setInterval(this.checkUserStatus, 3000);
    }
  }
  componentWillUnmount() {
    clearInterval(this.checkUserStatusInterval);
  }

  checkUserStatus = () => {
    axios.get("/check-user-status").then((res) => {
      if (res.data.status === "inactive") {
        localStorage.clear();
      }
    });
  };

  toggleSelectUser = (userId) => {
    if (this.state.selectedUsers.includes(userId)) {
      this.setState((prevState) => ({
        selectedUsers: prevState.selectedUsers.filter((id) => id !== userId),
      }));
    } else {
      this.setState((prevState) => ({
        selectedUsers: [...prevState.selectedUsers, userId],
      }));
    }
  };

  toggleSelectAll = () => {
    const { users, selectedUsers } = this.state;
    if (selectedUsers.length === users.length) {
      this.setState({ selectedUsers: [] });
    } else {
      this.setState({ selectedUsers: users.map((user) => user.id) });
    }
  };

  handleDelete = () => {
    const { selectedUsers } = this.state;
    if (selectedUsers.length === 0) {
      alert("Please select users to delete");
      return;
    }
    axios
      .post("/delete-users", { selectedUserIds: selectedUsers })
      .then((res) => {
        window.location.reload();
      })
      .catch((err) => {
        console.error("Error deleting users:", err);
      });
  };

  handleBlock = () => {
    const { selectedUsers } = this.state;
    const { user } = this.props;
    if (selectedUsers.length === 0) {
      alert("Please select users to block");
      return;
    }
    axios
      .post("/block-users", { selectedUserIds: selectedUsers })
      .then((res) => {
        if (selectedUsers.includes(user.id)) {
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
    const { selectedUsers } = this.state;
    if (selectedUsers.length === 0) {
      alert("Please select users to delete");
      return;
    }
    axios
      .post("/unblock-users", { selectedUserIds: selectedUsers })
      .then((res) => {
        window.location.reload();
      })
      .catch((err) => {
        console.error("Error unblocking users:", err);
      });
  };

  render() {
    const { user, loading } = this.props;
    const { users, selectedUsers } = this.state;
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
                onClick={this.handleBlock}
                className="btn btn-danger me-2"
                user={user}
                selectedUsers={selectedUsers}
              >
                Block
              </button>
              <button
                onClick={this.handleUnblock}
                className="btn btn-success me-2"
                user={user}
                selectedUsers={selectedUsers}
              >
                <FaUnlock />
                UnBlock
              </button>
              <button
                onClick={this.handleDelete}
                className="btn btn-warning "
                user={user}
                selectedUsers={selectedUsers}
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
                    checked={selectedUsers.length === users.length}
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
                      checked={selectedUsers.includes(userData.id)}
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
      return <h2>You are logged in</h2>;
    }
  }
}
