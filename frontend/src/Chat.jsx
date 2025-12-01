// src/Chat.jsx
import React from "react";
import EPDSModal from "./EPDSModal";
import CrisisModal from "./CrisisModal";
import Header from "./Header";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { postMessage, postEPDS, postEscalate, deleteSession, deleteMemory } from "./api";
import "./index.css";

export default function Chat({ userId, consent }) {
  const [messages, setMessages] = React.useState([]);
  const [text, setText] = React.useState("");
  const [showEPDS, setShowEPDS] = React.useState(false);
  const [crisisText, setCrisisText] = React.useState(null);
  const [listening, setListening] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef(null);
  const recognitionRef = React.useRef(null);

  React.useEffect(()=> {
    // scroll on messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  React.useEffect(()=>{
    if (consent?.consent_audio && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const r = new SR();
      r.lang = 'en-US';
      r.onresult = (ev)=> {
        const t = ev.results[0][0].transcript;
        handleSend(t);
      };
      recognitionRef.current = r;
    }
  }, [consent]);

  async function handleSend(msgText){
    if(!msgText) return;
    // append user
    setMessages(m=>[...m, {from:'user', text:msgText, time: new Date().toISOString()}]);
    setText("");
    setIsTyping(true);

    try {
      const res = await postMessage(userId, msgText);
      // small delay to simulate "thinking"
      await new Promise(r => setTimeout(r, 300));
      setMessages(m=>[...m, {from:'assistant', text:res.assistant, time: new Date().toISOString()}]);
      if(res.crisis){
        setCrisisText(res.assistant || "Immediate help recommended.");
      } else {
        if (consent?.consent_audio && window.speechSynthesis){
          try {
            const u = new SpeechSynthesisUtterance(res.assistant);
            window.speechSynthesis.speak(u);
          } catch(e){}
        }
      }
    } catch(e){
      setMessages(m=>[...m, {from:'assistant', text:'(Error contacting backend)', time: new Date().toISOString()}]);
    } finally {
      setIsTyping(false);
    }
  }

  async function handleEPDSSubmit(answers){
    setShowEPDS(false);
    try {
      const res = await postEPDS(userId, answers);
      setMessages(m=>[...m, {from:'assistant', text:`EPDS score: ${res.score}. ${res.interpretation}`, time: new Date().toISOString()}]);
      if(res.crisis?.is_crisis) setCrisisText("EPDS flagged possible self-harm — immediate help recommended.");
    } catch(e){
      setMessages(m=>[...m, {from:'assistant', text:'(EPDS submission failed)', time: new Date().toISOString()}]);
    }
  }

  function startListening(){
    const r = recognitionRef.current;
    if(!r) return alert("SpeechRecognition not available in this browser.");
    setListening(true);
    r.start();
    r.onend = ()=> setListening(false);
  }

  async function escalate(){
    try{
      await postEscalate({user_id:userId, reason:"User requested human handoff"});
      setMessages(m=>[...m, {from:'assistant', text:'Escalation logged. A clinician will be notified (demo).', time: new Date().toISOString()}]);
      setCrisisText(null);
    }catch(e){
      setMessages(m=>[...m, {from:'assistant', text:'Failed to log escalation.', time: new Date().toISOString()}]);
    }
  }

  async function handleDeleteData() {
    const ok = window.confirm(
      "Delete my data: This will permanently remove your session history and saved memories from this prototype. This action cannot be undone. Do you want to continue?"
    );
    if (!ok) return;

    setMessages(m => [...m, { from: "assistant", text: "Deleting your data...", time: new Date().toISOString() }]);

    try {
      await deleteSession(userId);
      await deleteMemory(userId);

      setMessages(mprev => [
        ...mprev,
        { from: "assistant", text: "All local session history and memories have been deleted.", time: new Date().toISOString() }
      ]);
      alert("Your data has been deleted from this prototype (sessions + memory).");
    } catch (err) {
      console.error("Delete failed", err);
      setMessages(mprev => [...mprev, { from: "assistant", text: "Failed to delete data — please try again.", time: new Date().toISOString() }]);
      alert("Failed to delete data. See console for details.");
    }
  }

  // crisis modal handlers
  const handleConnect = React.useCallback(() => { escalate(); }, [userId]);
  const handleCloseCrisis = React.useCallback(() => { setCrisisText(null); }, []);

  return (
    <div className="chat-root">
      <Header subtitle={crisisText ? "Crisis detected — immediate help recommended" : "Support for postpartum parents"} />

      <main className="chat-main">
        <aside className="chat-left">
  <div className="info-card">
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
      <strong style={{fontSize:15}}>Quick actions</strong>
      <small style={{fontSize:12, color:'#6b7280'}}>Tips & tools</small>
    </div>

    <div className="quick-actions">
      <div className="quick-item" role="button" onClick={() => setShowEPDS(true)}>
        <div className="icon">📝</div>
        <div className="meta">
          <div className="label">EPDS screener</div>
          <div className="desc">Take a short 10-question check to see how you’re doing.</div>
        </div>
      </div>

      <div className="quick-item" role="button" onClick={() => {
          setMessages(m=>[...m, {from:'assistant', text:'Here are two quick breathing steps: 1) Breathe in 4s 2) Breathe out 6s — repeat twice.', time: new Date().toISOString()}]);
        }}>
        <div className="icon">🧘‍♀️</div>
        <div className="meta">
          <div className="label">Grounding break</div>
          <div className="desc">A tiny breathing exercise or grounding step to feel calmer right now.</div>
        </div>
      </div>

      <div className="quick-item" role="button" onClick={handleDeleteData}>
        <div className="icon">🗑️</div>
        <div className="meta">
          <div className="label">Delete my data</div>
          <div className="desc">Remove local session history & saved memories from this prototype.</div>
        </div>
      </div>
    </div>

    <div className="quick-ctas">
      <button className="btn btn-calm small" onClick={() => setShowEPDS(true)}>Take EPDS</button>
      <button className="btn btn-soft small" onClick={() => {
          setMessages(m=>[...m, {from:'assistant', text:'Tip: take a 2-minute walk, notice three things you can see.', time: new Date().toISOString()}]);
        }}>2-min tip</button>
      <button className="btn btn-soft small" onClick={handleDeleteData}>Delete</button>
    </div>

  </div>
</aside>


        <section className="chat-panel">
          <div className="messages" ref={scrollRef}>
            {messages.length === 0 && <div className="empty">Say hi — I'm here to listen.</div>}
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.from} text={m.text} time={m.time} />
            ))}
            {isTyping && <div className="assistant-typing"><TypingIndicator/></div>}
          </div>

          <div className="composer">
            <input
              aria-label="Type a message"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(text); }}
              placeholder="Write something or press Record"
              className="composer-input"
            />
            <div className="composer-actions">
  <button className="btn btn-primary" onClick={() => handleSend(text)}>Send</button>
  <button className="btn btn-calm" onClick={() => setShowEPDS(true)}>EPDS</button>
  {consent?.consent_audio && (
    <button className="btn btn-calm" onClick={startListening}>
      {listening ? 'Listening…' : 'Record'}
    </button>
  )}
</div>

          </div>
        </section>
      </main>

      {crisisText && <CrisisModal onConnect={handleConnect} onClose={handleCloseCrisis} />}
      {showEPDS && <EPDSModal onClose={()=>setShowEPDS(false)} onSubmit={handleEPDSSubmit} />}
    </div>
  );
}
