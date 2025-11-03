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
  const [newChannelName, setNewChannelName] = useState("");
const [isLocked, setIsLocked] = useState(false);

  const navigate = useNavigate();
  const currentUser = localStorage.getItem("userName") || "";
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchChannels = async () => {
      try {
       const res = await fetch("http://localhost:4000/channels", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
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
  }, []);

  const deleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    if (!token || !currentUser) {
      setError("Not authenticated");
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/users/${currentUser}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");

      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete account");
    }
  };
  const createChannel = async () => {
  if (!newChannelName) {
    setError("Channel name is required");
    return;
  }
  if (!token || !currentUser) {
    setError("You must be logged in");
    return;
  }

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

    setChannels([...channels, data.channel]); // اضافه کردن کانال جدید به لیست
    setNewChannelName("");
    setIsLocked(false);
    setError("");
  } catch (err: any) {
    console.error(err);
    setError(err.message || "Failed to create channel");
  }
};

  return (
    <div>
      <Header />
      <div className="chat-page">
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
                      <strong>{channel.name}</strong>{" "}
                      {channel.isLocked ? "(Locked)" : "(Public)"}
                      <br />
                      <small>Created by: {channel.createdBy}</small>
                    </NavLink>
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
<div className="create-channel">
  <h1>Create New Channel</h1>
  <div>
	 <label htmlFor="channel" className="channel-name">Channel Name:</label>
  <input className="input"
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
