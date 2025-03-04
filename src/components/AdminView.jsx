import React, { useState, useEffect, useRef } from 'react';
import "../styles/AdminView.css";



const AdminView = () => {
    
    const lstMsgRef = useRef(null);
    const [messages, setMessages] = useState([]);
    
    const [selLang, setSelLang] = useState(import.meta.env.VITE_LANG);
    const curAI = selLang === 'es' ? 'Asistente virtual' : (selLang === 'en' ? 'Virtual assistant' : 'Assistant virtuel');
    const curMe = selLang === 'es' ? 'Yo' : (selLang === 'en' ? 'Me' : 'Moi');

    useEffect(() => {
        setMessages([]);
        let fruits = [
            "Apple", "Banana", "Cherry", "Mango", "Pineapple", 
            "Strawberry", "Blueberry", "Grapes", "Orange", "Pear", 
            "Peach", "Plum", "Kiwi", "Watermelon", "Papaya", 
            "Pomegranate", "Lemon", "Lime", "Fig", import.meta.env.VITE_LIMIT_LIST_ADMIN
        ];
        for (let fruit of fruits) {
            loadMessage(curAI,fruit,"");
        }
        
    }, []);

    const loadMessage = (sender,msg,lang) => {
        const curFormat = lang === "" ? (selLang === 'es' ? 'es-ES' : (selLang === 'en' ? 'en-US' : 'fr-FR')) : (lang === 'es' ? 'es-ES' : (lang === 'en' ? 'en-US' : 'fr-FR'));
        const timestamp = new Date().toLocaleString(curFormat, {
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour24: true,
        });
        const newMsg = {
          sender: sender,
          text: msg,
          lines: [],
          whatsapp:"",
          lnkWhatsapp:"",
          timestamp,
        };
        setMessages((prevMessages) => [...prevMessages, newMsg]);
        //setMessageSender(curMe);
      };

    return (
    <div className="app-container">      
      <div className="chat-container">       
        
        <div ref={lstMsgRef} className="chat-messages">           
          {messages.map((message, index) => (            
            <div
              key={index}
              className={`message ${message.sender === curMe ? 'blue-bg' : 'gray-bg'}`}>
              <div className="message-sender">✉️​{message.text}
              <div className="message-timestamp">{message.timestamp}</div>
              </div> 
               

            </div>
          ))}
        
        </div>

      </div>
    </div>
  );
  const [commentText, setCommentText] = useState('');


 
    
  return (
    <div>
      <h1>Latest Comment</h1>
      <div>{commentText || 'No comments yet...'}</div>
    </div>
  );
};


export default AdminView;

