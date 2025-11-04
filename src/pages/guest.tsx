import { useEffect, useState } from "react";
import Header from "../components/Header";
import "../pages/channel.css";
import people from "../assets/images/people.jpg";
import { NavLink } from "react-router";

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
  userName: string;
}

function GuestPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>("");

 // public endpoint
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
                    <strong>{channel.name}</strong>{" "}
                    {channel.isLocked ? "(Locked)" : "🌐"}
                    <br />
                    <small>Created by: {channel.createdBy}</small>
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
                      <span className="dm-link">{user.userName}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
		<div className="home-button">
			<NavLink to={"/"} >Home</NavLink>
		</div>
		
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default GuestPage;
