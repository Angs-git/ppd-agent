// src/CrisisModal.jsx
import React, { useState } from "react";

export default function CrisisModal({ onConnect, onClose }) {
  const [confirmCancel, setConfirmCancel] = useState(false);

  // FIRST STAGE — initial crisis alert
  if (!confirmCancel) {
    return (
      <div style={styles.overlay}>
        <div style={styles.card}>
          <h2 style={styles.title}>I'm really concerned about you 💛</h2>

          <p style={styles.text}>
            It sounds like you might be going through something very heavy right now.
            You deserve immediate support, and connecting with a specialist could help
            you feel safer and more supported in this moment.
          </p>

          <p style={styles.text}>
            You’re not alone — help is available.
          </p>

          <div style={styles.buttonsRow}>
            <button style={styles.primary} onClick={onConnect}>
              Connect to Specialist
            </button>

            <button
              style={styles.secondary}
              onClick={() => setConfirmCancel(true)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SECOND STAGE — gentle persuasion before final cancel
  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h2 style={styles.title}>Before you go…</h2>

        <p style={styles.text}>
          I understand wanting to close this — truly.  
          But what you’re feeling right now is important, and talking to a specialist
          can bring real relief and safety.
        </p>

        <p style={styles.text}>
          You don’t have to face this alone.  
          Would you like to connect anyway?
        </p>

        <div style={styles.buttonsRow}>
          <button style={styles.primary} onClick={onConnect}>
            Connect Anyway
          </button>

          <button style={styles.secondary} onClick={onClose}>
            Still Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  card: {
    width: "90%",
    maxWidth: 420,
    background: "#fff",
    padding: "24px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  title: {
    marginTop: 0,
    marginBottom: "12px",
    textAlign: "center",
  },
  text: {
    fontSize: "15px",
    lineHeight: "1.5",
    marginBottom: "16px",
    textAlign: "center",
  },
  buttonsRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  primary: {
    background: "#d9534f",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    flex: 1,
    marginRight: "10px",
  },
  secondary: {
    background: "#e2e6ea",
    color: "#333",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    flex: 1,
  },
};
