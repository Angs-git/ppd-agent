// src/api.js
const API_BASE = "http://127.0.0.1:8000";

export async function postMessage(userId, text) {
  const res = await fetch(`${API_BASE}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, text }),
  });
  return res.json();
}

export async function postEPDS(userId, answers) {
  const res = await fetch(`${API_BASE}/epds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, answers }),
  });
  return res.json();
}

export async function postEscalate(payload) {
  const res = await fetch(`${API_BASE}/escalate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteSession(userId) {
  const res = await fetch(`${API_BASE}/session/${userId}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function deleteMemory(userId) {
  const res = await fetch(`${API_BASE}/memory/${userId}`, {
    method: "DELETE",
  });
  return res.json();
}


export default { postMessage, postEPDS, postEscalate };
