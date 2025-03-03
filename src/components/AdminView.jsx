import React, { useState, useEffect, useRef } from 'react';
import "../styles/AdminView.css";

const lstMsgRef = useRef(null);

const AdminView = () => {
    

return (
    <div className="app-container">
      <div class="header-container">
          <div class="header-left">
              <img style={{maxHeight: import.meta.env.VITE_MAX_HEIGHT_LOGO}} src={import.meta.env.VITE_LOGO_URL} alt="Logo"/>
          </div>
          <div class="header-right">
              <div class="header-top"><h4></h4></div>
              <div class="header-bottom">C. de Miguel Arredondo, 4, Local 7, Arganzuela, 28045 Madrid</div>
          </div>
      </div>
      <div className="chat-container">       
        
        <div ref={lstMsgRef} className="chat-messages">
            <div > 
              <div className="message blue-bg">
              <b>VVVVVVVVVVV</b><br/><br/>
              {GetMsgDateHourCita('')}<b className='color-cita'>{GetUTCDate(new Date(curCita1.dateCita)).toLocaleString(codeLang(''), { weekday: "short", day: "2-digit", month: "2-digit", hour: '2-digit', minute: '2-digit' })}</b><br/>
              {GetMsgTypeCita('')}<b className='color-cita'>{curCita1.labelService}</b><br/>
              {GetMsgContactCita('')}<b className='color-cita'><a href={"https://wa.me/" + import.meta.env.VITE_WHATSAPP + "?text="}>{"+" + import.meta.env.VITE_WHATSAPP}</a></b><br/><br/>
              {GetMsgUpdateCita('')}
              </div>
            </div>
          {messages.map((message, index) => (            
            <div
              key={index}
              className={`message ${message.sender === curMe ? 'blue-bg' : 'gray-bg'}`}>
              <div className="message-sender">{message.sender}
              <button 
        onClick={() => copyToClipboard(message.text)} 
        className="clipboard-icon"
      >
        📋
      </button>
      <span className={`copied-message ${copied ? "visible" : ""}`}>{labelCopied}</span>
              </div>               
              <div className="message-text">                                
                {message.lines && message.lines.length > 0
                  ? message.lines.map((line, lineIndex) => (
                      <span key={lineIndex}>
                        {line} 
                      <br/>                       
                      </span>
                    ))
                  : message.text}                  
                  <br/><a style={{ color: 'white' }} href={message.lnkWhatsapp}>{message.whatsapp}</a>
              </div>      
              <div className="message-timestamp">{message.timestamp}</div>
              <div style={{marginTop: "10px",height: "20vh",display : (message.sender === curAI("") && curCateg === 0 && message.text !== GetMsgInitInfo("")) ? "block" : "none"}}>
              
              
              
                  <a href="#popup" onClick={() => setIsFormSendOpen(false)}>
                    <img style={{height:"20vh"}} src="https://www.dropbox.com/scl/fi/99txh27z4jk70pue85rmb/ed0.JPG?rlkey=jgtbu2w4b8yj5h1q50tf0zbbm&st=wgj33nd1&dl=1" alt="My Image"/>
                   </a>
                  
              </div>
            </div>
          ))}
          <div class="cita-container">
          {linesDay.map((lin, idxLin) => (
              <div key={idxLin} className="button-line">  
                {lin.map((col, idxCol) => (
                  <button 
                    key={idxCol}  
                    className="cita-button button send-button"
                    onClick={(e) => manageCita(e)} value={col.split("-").length > 2 ? col.split("-")[0] + "-" + col.split("-")[1] + "-" + col.split("-")[2] : col.split("-")[0] }
                  >
                    {col.split("-").length > 2 ? GetUTCDate(new Date(col)).toLocaleString(codeLang(''), { weekday: "short", day: "2-digit", month: "2-digit" }) : (col.split("-").length > 1 ? col.split("-")[1] : new Date('2000-01-01T' + col + ":00").toLocaleString(selLang, { hour: '2-digit', minute: '2-digit' })) } 
                  </button>
                ))}
                <br/>
              </div>
            ))}
            
            </div>
        </div>
        {isFormSendOpen && (
        <div class="fixed-bottom">
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <textarea id="message" name="message" rows="5" cols="50" disabled={(curCateg === 2 && curCita1.stepCita < 3) || (curCita1.contact !== "")} className="chat-input" value={chatInput} placeholder={`${curTypeHere}, ${messageSender}...`} onFocus={handleFocus} onChange={(e) => setChatInput(e.target.value)}></textarea>          
          <input
            type="text"
            name="usr"
            value=""
            onChange={handleUsr}     
            onFocus={handleFocus}        
            style={{ display: "none" }} // Hide from users
            tabIndex="-1" // Avoid focus by keyboard users
            autoComplete="off"
          />
          <button type="submit" disabled={(curCateg === 2 && curCita1.stepCita < 3) || (curCita1.contact !== "")} className="button send-button">{curSend}</button>
        </form>
        <div className='displayElements1'>
          {/* Left-aligned button */}
          <button className="button send-button" onClick={handleClearChat}>
            {curCita1.contact === "" ? curClear : curCancel}
          </button>
          <div>
            {/* Radio Button 1 */}
            <input
              type="radio"
              id="en"
              name="options"
              checked={selLang === "en"}
              style={{ display: "none" }}
            />
            <label htmlFor="EN" className="label" onClick={() => handleChangeLang("en")}>
              <span className={`radio ${selLang === "en" ? "selected" : ""}`}></span>
              EN
            </label>

            {/* Radio Button 2 */}
            <input
              type="radio"
              id="fr"
              name="options"
              checked={selLang === "fr"}
              style={{ display: "none" }}
            />
            <label htmlFor="FR" className="label" onClick={() =>  handleChangeLang("fr")}>
              <span className={`radio ${selLang === "fr" ? "selected" : ""}`}></span>
              FR
            </label>

            {/* Radio Button 3 */}
            <input
              type="radio"
              id="es"
              name="options"
              checked={selLang === "es"}
              style={{ display: "none" }}
            />
            <label htmlFor="ES" className="label" onClick={() => handleChangeLang("es")}>
              <span className={`radio ${selLang === "es" ? "selected" : ""}`}></span>
              ES
            </label>
          </div>          
        </div>
        {/* Right-aligned buttons */}
        <div className="displayElements2">
            <button style={displayInfo} className="button send-button" onClick={() => handleChat(0)}>
              {curInfo}
            </button>
            <button style={displayBudget} className="button send-button" onClick={() => handleChat(1)}>
              {curBudget}
            </button>
            <button style={displayCita} className="button send-button" onClick={() => handleChat(2)}>
              {curLabelCita}
            </button>
          </div>
        </div>
        )}
        
      </div>
    </div>
  );
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    // Subscribe to the "COMMENT" table for new row insertions
    const channels = supabase.channel('custom-all-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'COMMENT' },
      (payload) => {
        console.log('Change received!', payload);
        setCommentText(payload.new.text);
      }
    )
    .subscribe()

    /*const subscription = supabase
      .channel('realtime:public:COMMENT')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'COMMENT' },
        (payload) => {
          console.log('New row added:', payload.new);
          setCommentText(payload.new.text); // Update state with the new row's "text" field
        }
      )
      .subscribe();*/

    // Cleanup subscription on component unmount
    return () => {
      channels.unsubscribe();
    };
  }, []);
    
  return (
    <div>
      <h1>Latest Comment</h1>
      <div>{commentText || 'No comments yet...'}</div>
    </div>
  );
};


export default AdminView;

