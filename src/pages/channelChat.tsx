import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import Header from "../components/Header";
import "./channelChat.css";

interface ChannelMessage {
  senderId: string;
  content: string;
  timestamp: string;
}

interface ChannelMeta {
  pk: string;
  sk: string;
  name: string;
  createdBy: string;
  isLocked: boolean;
  createdAt: string;
}

function ChannelChat() {
  const { channelId } = useParams();
  const decodedChannelId = decodeURIComponent(channelId || "");
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [channelName, setChannelName] = useState<string>(""); // Store channel name
  const token = localStorage.getItem("token");
  const currentUser = localStorage.getItem("userName");

  // Fetch channel metadata once
  useEffect(() => {
    const fetchChannelName = async () => {
      if (!decodedChannelId || !token) return;
      try {
        // Fetch all channels (you can optimize later to fetch a single channel)
        const res = await fetch("http://localhost:4000/channels", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: ChannelMeta[] = await res.json();
        const channel = data.find((c) => c.pk === decodedChannelId);
        if (channel) setChannelName(channel.name); // Set channel name
      } catch (err) {
        console.error("Could not fetch channel metadata", err);
      }
    };
    fetchChannelName();
  }, [decodedChannelId, token]);

  // Fetch messages every 2 seconds
  useEffect(() => {
    const fetchMessages = async () => {
      if (!decodedChannelId || !token) return;
      try {
        const res = await fetch(
          `http://localhost:4000/channels/${decodedChannelId}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data: ChannelMessage[] = await res.json();
        setMessages(
          data.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
        );
      } catch (err) {
        console.error("Could not fetch messages", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [decodedChannelId, token]);

  const sendMessage = async () => {
    if (!newMessage || !decodedChannelId || !token) return;

    try {
      await fetch(
        `http://localhost:4000/channels/${decodedChannelId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: newMessage }),
        }
      );
      setNewMessage("");
    } catch (err) {
      console.error("Could not send message", err);
    }
  };

  return (
    <div>
      <Header />
      <div className="channel-chat-container">
        <h1>Channel: {channelName || decodedChannelId}</h1>

        <div className="channel-messages">
          {messages.map((msg, i) => (
            <p
              key={i}
              className={msg.senderId === currentUser ? "self" : "other"}
            >
              <strong>{msg.senderId}</strong>: {msg.content}
            </p>
          ))}
        </div>

        <div className="channel-input-container">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>

        <div style={{ marginTop: "10px" }}>
          <NavLink to="/channels">Back to Channels</NavLink>
        </div>
      </div>
    </div>
  );
}

export default ChannelChat;
