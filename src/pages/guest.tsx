import { useEffect, useState } from "react";
import Header from "../components/Header";
import "../pages/channel.css";
import people from "../assets/images/people.jpg";
import { NavLink } from "react-router-dom";

interface Channel {
  pk: string;
  name: string;
  createdBy: string;
  isLocked: boolean;
}

interface User {
  pk: string;
  userName: string;
}

function GuestPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>("");
  const [dmMessage, setDmMessage] = useState<string>(""); 
  
  useEffect(() => {
    const fetchPublicChannels = async () => {
      try {
        const res = await fetch("http://localhost:4000/channels/public");
        const data = await res.json();
        setChannels(data);
      } catch (err) {
        console.error(err);
        setError("Could not fetch channels");
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:4000/users/public"); 
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError("Could not fetch users");
      }
    };

    fetchPublicChannels();
    fetchUsers();
  }, []);

  const handleUserClick = (userName: string) => {
    // Show message instead of opening DM
    setDmMessage(`You cannot open private messages with ${userName} as a guest.`);
  };

  return (
    <div>
      <Header />
      <div className="chat-page">

        <div className="channel DM">
          <h1>PUBLIC CHANNELS</h1>
          <div className="channel-content">
            {channels.length === 0 ? (
              <p>No channels available</p>
            ) : (
              <ul className="ul-channel">
                {channels.map((channel) => (
                  <li key={channel.pk}>
                    <NavLink
                      to={`/guest/channels/${encodeURIComponent(channel.pk)}`}
                      className="channel-link"
                    >
                      <strong>{channel.name}</strong> {channel.isLocked ? "(Locked)" : "🌐"}
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
          <h1>USERS</h1>
          <div className="dm-content">
            {users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <ul className="ul-dm">
                {users.map((user) => (
                  <li key={user.pk}>
                    <div
                      className="dm-div"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleUserClick(user.userName)}
                    >
                      <div className="image-div">
                        <img src={people} alt="DM-icon" />
                      </div>
                      <span className="dm-link">{user.userName}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Display guest DM warning message */}
          {dmMessage && <p className="error-guest-dm">{dmMessage}</p>}
        </div>

        <div className="home-button">
          <NavLink to={"/"}>Home</NavLink>
        </div>

      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default GuestPage;
