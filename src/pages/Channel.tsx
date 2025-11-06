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
}

function ChannelPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>("");
  const [newChannelName, setNewChannelName] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const currentUser = localStorage.getItem("userName") || "";
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch("http://localhost:4000/channels", {
          headers: { Authorization: `Bearer ${token}` },
        });
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
  }, [token]);

  const createChannel = async () => {
    if (!newChannelName) return setError("Channel name is required");

    try {
      const res = await fetch("http://localhost:4000/channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newChannelName, isLocked, createdBy: currentUser }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create channel");

      setChannels([...channels, data.channel]);
      setNewChannelName("");
      setIsLocked(false);
      setError("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create channel");
    }
  };

  const handleConfirmDelete = async (channelId: string) => {
    if (!token || !currentUser) return setError("Not authenticated");

    try {
      const res = await fetch(
        `http://localhost:4000/channels/${encodeURIComponent(channelId)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete channel");

      setChannels(channels.filter((ch) => ch.pk !== channelId));
      setChannelToDelete(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete channel");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/");
  };

  return (
    <div>
      <Header />
      <div className="chat-page">
        <h3 className="title-name">Hi {currentUser}👋</h3>

        <div className="channel">
          <h1>CHANNELS</h1>
          <div className="channel-content">
            {channels.length === 0 ? (
              <p>No channels available</p>
            ) : (
              <ul className="ul-channel">
                {channels.map((channel) => (
                  <li key={channel.pk}>
                    <NavLink
                      to={`/channels/${encodeURIComponent(channel.pk)}`}
                      className="channel-link"
                    >
                      <strong>{channel.name}</strong> {channel.isLocked ? "🔒" : "🌐"}
                      <br />
                      <small>Created by: {channel.createdBy}</small>
                    </NavLink>

                    {channel.createdBy === currentUser && (
                      <>
                        {channelToDelete === channel.pk ? (
                          <div className="confirm-delete-channel">
                            <p>Delete this channel?</p>
                            <button onClick={() => handleConfirmDelete(channel.pk)}>Yes</button>
                            <button onClick={() => setChannelToDelete(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button
                            className="delete-btn"
                            onClick={() => setChannelToDelete(channel.pk)}
                            title="Delete Channel"
                          >
                            🗑️
                          </button>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

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
                      <NavLink
                        to={`/dm/${encodeURIComponent(user.userName)}`}
                        className="dm-link"
                      >
                        {user.userName}
                      </NavLink>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="create-channel">
          <h1>Create New Channel</h1>
          <div>
            <label htmlFor="channel" className="channel-name">
              Channel Name:
            </label>
            <input
              className="input"
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
            />
          </div>
          <div className="div-checkbox">
            <label id="checkbox">Locked</label>
            <input
              type="checkbox"
              checked={isLocked}
              onChange={(e) => setIsLocked(e.target.checked)}
            />
          </div>

          <button onClick={createChannel}>Create Channel</button>
        </div>

        <div className="button-div">
          <button onClick={handleLogout}>Log out</button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

export default ChannelPage;
