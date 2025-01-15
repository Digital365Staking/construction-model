import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import "./CommentListener.css";

// Initialize Supabase client
const supabaseUrl = 'https://ydxelzxjsuemylifgwte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeGVsenhqc3VlbXlsaWZnd3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MDY4MzAsImV4cCI6MjA1MjE4MjgzMH0.Nnbgsp8NvJaD_DyXpsNwnvrdZUwZz4ylWzv7_fglxPo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CommentListener = () => {
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('messages')) || []);
  const [messageSender, setMessageSender] = useState('John');
  const [chatInput, setChatInput] = useState('');

  async function fetchChatGPTResponse(message) {
    try {
      var k = atob('c2stcHJvai1iV2Z5UEdZUE80OFZJMGVfQmFaSjM2ZnV1X1c5M3c1eDNhWnF0OE9XS0RObFY3RFZrMWdQQ0xaaFdZTUhKdDI5N1ZIRERZMUEwblQzQmxia0ZKckJVa0lBT0J3MFY3RU9OcXE0bllVYUduYUExVTM3SmVBYTEzNDNNYUlwUDQycEdJX1Rtd2wyTGFxV3ZFV19fWkJQc0tQUlpxWUE=');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + k
        },
        body: JSON.stringify({
          "model": "gpt-4",
          "messages": [
            { "role": "system", "content": "You are a helpful assistant." },
            { "role": "user", "content": message }
          ],
          max_tokens: 100
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error fetching ChatGPT response:', error);
      return 'Sorry, I couldn\'t process your request.';
    }
  }

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  const handleSenderChange = (name) => {
    setMessageSender(name);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (chatInput.trim() === '') return;

    const timestamp = new Date().toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });    

    const newMessage = {
      sender: messageSender,
      text: chatInput,
      timestamp,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    if(messageSender === 'John'){
      console.log('msg : ' + chatInput);
      const chatResponse = await fetchChatGPTResponse(chatInput);
      const newMessage2 = {
        sender: 'Jane',
        text: chatResponse,
        timestamp,
      }; 
      setMessages((prevMessages) => [...prevMessages, newMessage2]);     
      //setChatInput('COCO');
    }
    setChatInput('');
  };

  const handleClearChat = () => {
    localStorage.clear();
    setMessages([]);
  };

  return (
    <div className="app-container">
      <div className="person-selector">
        <button
          className={`button person-selector-button ${messageSender === 'John' ? 'active-person' : ''}`}
          onClick={() => handleSenderChange('John')}
        >
          John
        </button>
        <button
          className={`button person-selector-button ${messageSender === 'Jane' ? 'active-person' : ''}`}
          onClick={() => handleSenderChange('Jane')}
        >
          Jane
        </button>
      </div>

      <div className="chat-container">
        <h2 className="chat-header">{messageSender} chatting...</h2>

        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === 'John' ? 'blue-bg' : 'gray-bg'}`}
            >
              <div className="message-sender">{message.sender}</div>
              <div className="message-text">{message.text}</div>
              <div className="message-timestamp">{message.timestamp}</div>
            </div>
          ))}
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat-input"
            required
            placeholder={`Type here, ${messageSender}...`}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button type="submit" className="button send-button">Send</button>
        </form>

        <button className="button clear-chat-button" onClick={handleClearChat}>
          Clear Chat
        </button>
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


export default CommentListener;

