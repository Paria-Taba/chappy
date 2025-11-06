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
  createdAt: string;
}

function GuestChannelChat() {
  const { channelId } = useParams();
  const decodedChannelId = decodeURIComponent(channelId || "");
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [channelName, setChannelName] = useState<string>("");

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/channels/public/${encodeURIComponent(decodedChannelId)}/messages`
        );
        const data: ChannelMessage[] = await res.json();
        setMessages(
          data.sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
        );
      } catch (err) {
        console.error("Could not fetch public messages", err);
      }
    };
    fetchMessages();
  }, [decodedChannelId]);

  // Fetch channel metadata
  useEffect(() => {
    const fetchChannelName = async () => {
      try {
        const res = await fetch("http://localhost:4000/channels/public");
        const data: Channel[] = await res.json();
        const channel = data.find((c) => c.pk === decodedChannelId);
        if (channel) setChannelName(channel.name);
      } catch (err) {
        console.error("Could not fetch channel metadata", err);
      }
    };
    fetchChannelName();
  }, [decodedChannelId]);

  return (
    <div>
      <Header />
      <div className="channel-chat-container">
        <h1>Channel: {channelName || decodedChannelId}</h1>

        <div className="channel-messages">
          {messages.map((msg, i) => (
            <p
              key={i}
              className={i % 2 === 0 ? "guest-message-left" : "guest-message-right"}
            >
              <strong>{msg.senderId}</strong>: {msg.content}
            </p>
          ))}
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
