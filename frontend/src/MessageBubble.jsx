// src/MessageBubble.jsx
import React from "react";

function humanTime(iso){
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  } catch { return ""; }
}

export default function MessageBubble({ role, text, time }) {
  const isUser = role === 'user';
  return (
    <div className={`msg-row ${isUser ? 'msg-right' : 'msg-left'}`}>
      {!isUser && <div className="avatar">A</div>}
      <div className={`bubble ${isUser ? 'bubble-user' : 'bubble-assistant'}`}>
        <div className="bubble-text">{text}</div>
        {time && <div className="bubble-meta">{humanTime(time)}</div>}
      </div>
      {isUser && <div className="avatar user">You</div>}
    </div>
  );
}
