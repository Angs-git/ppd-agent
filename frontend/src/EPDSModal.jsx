// src/EPDSModal.jsx
import React from "react";

const QUESTIONS = [
  "1. I have been able to laugh and see the funny side of things",
  "2. I have looked forward with enjoyment to things",
  "3. I have blamed myself unnecessarily when things went wrong",
  "4. I have been anxious or worried for no good reason",
  "5. I have felt scared or panicky for no very good reason",
  "6. Things have been getting on top of me",
  "7. I have been so unhappy that I have had difficulty sleeping",
  "8. I have felt sad or miserable",
  "9. I have been so unhappy that I have been crying",
  "10. The thought of harming myself has occurred to me"
];

export default function EPDSModal({ onClose, onSubmit }) {
  const [answers, setAnswers] = React.useState(Array(10).fill(0));

  function setAns(i,v){ const a=[...answers]; a[i]=v; setAnswers(a); }

  return (
    <div style={{position:'fixed',left:20,top:20,right:20,bottom:20,background:'#fff',padding:20,overflow:'auto',border:'1px solid #ccc',zIndex:9999}}>
      <h3>EPDS Screener — 10 items</h3>
      <p>This is a screening tool, not a diagnosis. Choose 0 (Never) to 3 (Always).</p>
      {QUESTIONS.map((q,i)=>(
        <div key={i} style={{marginBottom:14}}>
          <div style={{fontWeight:500}}>{q}</div>
          <div style={{marginTop:6}}>
            {[0,1,2,3].map(v=>(
              <label key={v} style={{marginRight:10}}>
                <input type="radio" name={`q${i}`} checked={answers[i]===v} onChange={()=>setAns(i,v)} /> {v}
              </label>
            ))}
          </div>
        </div>
      ))}
      <div style={{marginTop:12}}>
        <button onClick={()=>onSubmit(answers)}>Submit</button>
        <button onClick={onClose} style={{marginLeft:8}}>Cancel</button>
      </div>
    </div>
  );
}
