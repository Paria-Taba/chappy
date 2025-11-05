// src/pages/DMPage.tsx
import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import "./dmPage.css";
import Header from "../components/Header";
import people from "../assets/images/people.jpg";

interface DMMessage {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

function DMPage() {
  const { userId } = useParams();
  const decodedUserId = decodeURIComponent(userId || ""); // decode username
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const token = localStorage.getItem("token");
  const currentUser = localStorage.getItem("userName");

  // Fetch messages initially and every 2 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [decodedUserId]);

  const fetchMessages = async () => {
    if (!currentUser || !decodedUserId) return;
    try {
      const res = await fetch(
        `http://localhost:4000/dm/${currentUser}/${decodedUserId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data: DMMessage[] = await res.json();
      // Sort messages by timestamp
      setMessages(
        data.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      );
    } catch (err) {
      console.error("Could not fetch DMs", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage || !currentUser || !decodedUserId) return;
    try {
      await fetch(`http://localhost:4000/dm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderId: currentUser,
          receiverId: decodedUserId,
          content: newMessage,
        }),
      });
      setNewMessage("");
      fetchMessages(); // refresh after sending
    } catch (err) {
      console.error("Could not send DM", err);
    }
  };

  return (
    <div>
      <Header />
      <div className="div-user">
        <img src={people} alt="user-idon" />
        <h1>Chat with {decodedUserId}</h1>
      </div>

      <div className="dm-container">
        <div className="dm-messages">
          {messages.map((msg, i) => (
            <p
              key={i}
              className={`dm-message ${
                msg.senderId === currentUser ? "self" : "other"
              }`}
            >
              <strong>{msg.senderId}</strong>: {msg.content}
            </p>
          ))}
        </div>

        <div className="dm-input-container">
          <input
            className="dm-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button className="dm-send-btn" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>

      <div className="button-div">
        <button>
          <NavLink to="/channel">Back</NavLink>
        </button>
      </div>
    </div>
  );
}

export default DMPage;
