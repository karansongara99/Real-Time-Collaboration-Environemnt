// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../api service/api";
import "../assets/styles/Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    API.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => alert("Not authorized"));

    // Fetch created rooms
    API.get("/rooms")
      .then((res) => setRooms(res.data))
      .catch(() => console.error("Failed to load rooms"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleChat = () => {
    window.location.href = "/chat";
  };

  const handleSetting = () => {
    window.location.href = "/setting";
  };

  const handleJoinRoom = async () => {
    const id = prompt("Enter Room ID to join:");
    if (id) {
      try {
        await API.post(`/rooms/${id}/join`);
        window.location.href = `/room/${id}`;
      } catch {
        alert("Failed to join room");
      }
    }
  };

  const handleCreateRoom = async () => {
    const name = prompt("Enter room name:");
    if (name) {
      try {
        const { data } = await API.post("/rooms", { name });
        window.location.href = `/room/${data._id}`;
      } catch {
        alert("Error creating room");
      }
    }
  };



  const handleOpenRoom = (id) => {
    window.location.href = `/room/${id}`;
  };

  const handleShareRoom = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${id}`);
    alert("Room link copied to clipboard!");
  };

  return (
    <div className="dashboard-container">
      {/* ===== HEADER ===== */}
      <header className="dashboard-header">
        <div className="logo">SyncFive Group Chat</div>
        <div className="user-section">
          {user && <span className="username">Hi, {user.name}</span>}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
          <button className="logout-btn" onClick={handleChat}>Chat</button>
          <button className="logout-btn" onClick={handleSetting}>Setting</button>
        </div>

      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="dashboard-main">
        <div className="actions">
          <button className="create-room-btn" onClick={handleCreateRoom}>
            ➕ Create Room
          </button>
          <button className="join-room-btn" onClick={handleJoinRoom}>
            🔗 Join Room
          </button>
        </div>

        <div className="room-list">
          <h3>Your Rooms</h3>
          {rooms.length > 0 ? (
            <ul>
              {rooms.map((room) => (
                <li key={room._id} className="room-item">
                  <div>
                    <strong>{room.name}</strong>
                    <p>ID: {room._id}</p>
                  </div>
                  <div className="room-actions">
                    <button
                      className="open-btn"
                      onClick={() => handleOpenRoom(room._id)}
                    >
                      Open
                    </button>
                    <button
                      className="share-btn"
                      onClick={() => handleShareRoom(room._id)}
                    >
                      Share
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-rooms">No rooms created yet.</p>
          )}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="dashboard-footer">
        <p>© 2025 Common Collaboration | Build. Share. Collaborate.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
