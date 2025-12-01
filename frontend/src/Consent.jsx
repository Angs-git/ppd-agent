// src/Consent.jsx
import React from "react";

export default function Consent({ onDone }) {
  const [audioOk, setAudioOk] = React.useState(false);
  const [dataOk, setDataOk] = React.useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!dataOk) { alert("Please consent to local storage of data for this prototype."); return; }
    onDone({ consent_audio: audioOk, consent_data: dataOk });
  }

  return (
    <div style={{padding:20, maxWidth:800, margin:"0 auto"}}>
      <h2>PPD Support — Prototype</h2>
      <p>
        This prototype is a supportive tool and <strong>not a medical diagnosis</strong>.
        It uses a short screener (EPDS) and a rule-based crisis detector to suggest next steps.
      </p>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom:10}}>
          <label>
            <input type="checkbox" checked={audioOk} onChange={e=>setAudioOk(e.target.checked)} />{" "}
            I consent to audio recording for this session (optional).
          </label>
        </div>
        <div style={{marginBottom:10}}>
          <label>
            <input type="checkbox" checked={dataOk} onChange={e=>setDataOk(e.target.checked)} />{" "}
            I consent to local storage of anonymous events & scores (required for demo).
          </label>
        </div>
        <div style={{marginTop:12}}>
          <button type="submit">Start support</button>
        </div>
      </form>
      <hr />
      <small>
        For production, make sure to use secure encrypted storage, clinician review for flagged crises,
        and to localize emergency numbers.
      </small>
    </div>
  );
}
