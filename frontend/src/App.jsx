// src/App.jsx
import React from "react";
import Consent from "./Consent";
import Chat from "./Chat";

export default function App(){
  const [consentData, setConsentData] = React.useState(null);
  const userId = "demo";
  if(!consentData) return <Consent onDone={setConsentData} />;
  return <Chat userId={userId} consent={consentData} />;
}

