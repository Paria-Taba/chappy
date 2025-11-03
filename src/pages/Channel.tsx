import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../pages/channel.css";
import people from "../assets/images/people.jpg";

interface Channel {
  pk: string;
  sk: string;
  name: string;
  isLocked: boolean;
  createdBy: string;
  createdAt: string;
}

interface User {
  pk: string;
  sk: string;
  userName: string;
  createdAt: string;
}

function ChannelPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const navigate = useNavigate();
  const currentUser = localStorage.getItem("userName") || "";

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch("http://localhost:4000/channels");
        const data = await res.json();
        setChannels(data);
      } catch (err) {
        console.error(err);
        setError("Could not fetch channels");
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:4000/users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError("Could not fetch users");
      }
    };

    fetchChannels();
    fetchUsers();
  }, []);

  const deleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token || !currentUser) throw new Error("Not authenticated");

      const res = await fetch(`http://localhost:4000/users/${currentUser}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");

      // Clear localStorage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete account");
    }
  };

  return (
    <div>
      <Header />
      <div className="chat-page">
        {/* Channels Section */}
        <div className="channel">
          <h1>CHANNELS</h1>
          <div className="channel-content">
            {channels.length === 0 ? (
              <p>No channels available</p>
            ) : (
              <ul className="ul-channel">
                {channels.map((channel) => (
                  <li key={channel.pk}>
                    <NavLink to={`/channels/${channel.pk}`} className="channel-link">
                      <strong>{channel.name}</strong> {channel.isLocked ? "(Locked)" : "(Public)"}
                      <br />
                      <small>Created by: {channel.createdBy}</small>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Direct Messages Section */}
        <div className="DM">
          <h1>DIRECT MESSAGES</h1>
          <div className="dm-content">
            {users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <ul className="ul-dm">
                {users.map((user) => (
                  <li key={user.pk}>
                    <div className="dm-div">
                      <div className="image-div">
                        <img src={people} alt="DM-icon" />
                      </div>
                      <NavLink to={`/dm/${user.pk}`} className="dm-link">
                        {user.userName}
                      </NavLink>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="button-div">
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}>Delete my account</button>
          ) : (
            <div className="confirm-delete">
              <p>Are you sure you want to delete your account?</p>
              <button onClick={deleteAccount}>Yes, delete</button>
              <button onClick={() => setConfirmDelete(false)}>Cancel</button>
            </div>
          )}
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

export default ChannelPage;
