import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import Header from "../components/Header";
import "./channelChat.css";

interface ChannelMessage {
  senderId: string;
  content: string;
  timestamp: string;
}

interface Channel {
  pk: string;
  name: string;
  createdBy: string;
  isLocked: boolean;
}

function GuestChannelChat() {
  const { channelId } = useParams();
  const decodedChannelId = decodeURIComponent(channelId || "");
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [channelName, setChannelName] = useState(""); // start empty

  // Fetch channel metadata to get the name
  useEffect(() => {
    const fetchChannelMeta = async () => {
      try {
        const res = await fetch("http://localhost:4000/channels/public");
        const channels: Channel[] = await res.json();
        const channel = channels.find((c) => c.pk === decodedChannelId);
        if (channel) setChannelName(channel.name);
      } catch (err) {
        console.error("Could not fetch channel info", err);
        setChannelName("Unknown Channel");
      }
    };
    fetchChannelMeta();
  }, [decodedChannelId]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/channels/public/${encodeURIComponent(decodedChannelId)}/messages`
        );
        const data: ChannelMessage[] = await res.json();
        setMessages(
          data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        );
      } catch (err) {
        console.error("Could not fetch public messages", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [decodedChannelId]);

  // Send message as guest
  const sendMessage = async () => {
    if (!newMessage) return;

    try {
      await fetch(
        `http://localhost:4000/channels/public/${encodeURIComponent(decodedChannelId)}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderId: "Guest", content: newMessage }),
        }
      );
      setNewMessage("");
    } catch (err) {
      console.error("Could not send public message", err);
    }
  };

  return (
    <div>
      <Header />
      <div className="channel-chat-container">
        <h1>{channelName || "Loading..."}</h1>

        <div className="channel-messages">
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${msg.senderId === "Guest" ? "self" : "other"}`}
              >
                <strong>{msg.senderId}</strong>: {msg.content}
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="channel-input-container">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>

        <div className="button-div">
          <button>
            <NavLink to="/guest">Back to Channels</NavLink>
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuestChannelChat;
