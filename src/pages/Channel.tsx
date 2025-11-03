import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Header from "../components/Header";
import "../pages/channel.css";
import people from "../assets/images/people.jpg"

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
                    <NavLink
                      to={`/channels/${channel.pk}`} // navigate to channel page
                      className="channel-link"
                    >
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
							<img src={people} alt="DM-icon" /></div>
					
						 <NavLink
                      to={`/dm/${user.pk}`} // navigate to direct message page
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
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default ChannelPage;
