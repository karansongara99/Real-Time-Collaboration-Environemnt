import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api service/api";
import { io } from "socket.io-client";
import "../assets/styles/Chat.css";

const Chat = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  const socket = useMemo(() => {
    const token = localStorage.getItem("token");
    return io("http://localhost:5000", { auth: { token } });
  }, []);
  const bottomRef = useRef(null);

  useEffect(() => {
    API.get("/auth/me").then(res => setMe(res.data)).catch(() => navigate("/login"));
    API.get("/rooms").then(res => setRooms(res.data));
  }, [navigate]);

  useEffect(() => {
    if (!roomId) return;
    API.get(`/rooms/${roomId}/users`).then(res => setRoomUsers(res.data));
    API.get(`/rooms/${roomId}/messages`).then(res => setMessages(res.data));
    socket.emit("joinRoom", { roomId });
  }, [roomId, socket]);

  useEffect(() => {
    const onMsg = (msg) => setMessages(prev => [...prev, msg]);
    const onPresence = ({ count }) => setCount(count);
    socket.on("message", onMsg);
    socket.on("presence", onPresence);
    return () => {
      socket.off("message", onMsg);
      socket.off("presence", onPresence);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    socket.emit("message", { roomId, text });
    setText("");
  };

  return (
    <div className="chat-page">
      <div className="sidebar">
        <div className="sidebar-section">
          <h3>Users ({count})</h3>
          <ul>
            {roomUsers.map(u => (
              <li key={u._id}>{u.name}</li>
            ))}
          </ul>
        </div>
        <div className="sidebar-section">
          <h3>Workspaces</h3>
          <ul>
            {rooms.map(r => (
              <li key={r._id} className={r._id === roomId ? "active" : ""} onClick={() => navigate(`/room/${r._id}`)}>
                {r.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <h2>Group Chat</h2>
        </div>

        <div className="chat-body">
          {messages.map((m) => {
            const self = m.sender?._id === me?._id;
            return (
              <div key={m._id} className={`chat-message ${self ? "self" : ""}`}>
                <div className="chat-user">{self ? "You" : m.sender?.name}</div>
                <div className="chat-text">{m.text}</div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="chat-footer">
          <input
            type="text"
            placeholder="Type your message..."
            className="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="chat-send" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;