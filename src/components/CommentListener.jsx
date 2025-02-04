import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import "../styles/CommentListener.css";
import * as XLSX from "xlsx"; // For reading XLSX files
import * as pdfjsLib from "pdfjs-dist";
import Papa from 'papaparse';

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// Initialize Supabase client
const supabaseUrl = 'https://ydxelzxjsuemylifgwte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeGVsenhqc3VlbXlsaWZnd3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MDY4MzAsImV4cCI6MjA1MjE4MjgzMH0.Nnbgsp8NvJaD_DyXpsNwnvrdZUwZz4ylWzv7_fglxPo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CommentListener = () => {
  
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('messages')) || []);
  const [messageSender, setMessageSender] = useState('John');
  const [chatInput, setChatInput] = useState('');
  const [displayHeader, setDisplayHeader] = useState('none');

  //Examples of CSV
  const [contactInfo, setContactInfo] = useState(null);
  const keyPaths = "/files/Mathematical database development_.pdf";

  async function callChatGPT(prefix, message) {
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
            { "role": "user", "content": prefix + (prefix === "" ? "" :
              `\nBased on the previous text and/or CSV report, provide a natural and conversational response to the following question :  `
            ) + message }
          ],
          max_tokens: 200
        })
      });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  const removeEmptyLines = (text) => {
    return text
      .split("\n") // Split by newline
      .filter(line => line.trim() !== "") // Remove empty lines
      .join("\n"); // Join back into a string
  };

  async function prepareQuery(message, tableName, headers) {
    try {
    let req = `
      How should I request a supabase table "${tableName}" with the headers "${headers}" if I have to answer to the question : "${message}" ? Give as anwer only the select string and the filter string in the JSON format model 
      {
        "select": "Account",
        "filter": "Contact name=%Bertrand VANNE%"
      }. Follow the previous JSON model strictly.
      `;
      const jsonContact = await callChatGPT("",req);
      console.log(jsonContact);
      let selectRequest = "";
      let filterRequest = "";
      let selectRequest2 = "";
      let filterRequest2 = "";
      let tab = jsonContact.split("{");
      let parsedData = null;
      let ct = 0;      
      if(tab.length > 1){
        tab = tab[1].split("}");
        if(tab.length > 0){          
          let jsonText = tab[0].replace("eq.","");
          console.log("jsonText : " + jsonText);
          parsedData = JSON.parse(`{${jsonText}}`);
          
          let tabFilter = parsedData.filter.split(",");          
          tabFilter.forEach(filter => {
            let tabFilter = filter.split("=");
            console.log(tabFilter[0]);
            if(tabFilter.length > 1){
              if(ct === 0){
                selectRequest = parsedData.select;
                filterRequest = !filter.includes("%") ? `${tabFilter[0]}=%${tabFilter[1]}%` : `${tabFilter[0]}=${tabFilter[1]}`;
                console.log(filterRequest);
              }else{
                selectRequest2 = parsedData.select;
                filterRequest2 = !filter.includes("%") ? `${tabFilter[0]}=%${tabFilter[1]}%` : `${tabFilter[0]}=${tabFilter[1]}`;
              }              
              ct++;                      
            }                 
          });
        }
        
      }
      console.log(selectRequest + "\n" + filterRequest);
      const { data, error } = await supabase.rpc('getcontact_csv_1', { selectcontact: selectRequest, filtercontact: filterRequest });
      if (error) {
        throw new Error(`Supabase RPC Error: ${error.message}`);
      }
      let csv2 = "";      
      if(data.length === 0)
        return "";      
      const csv = data[0].TITLE; //Papa.unparse();  
      console.log(data[0].TITLE);    
      if(ct >= 2){
        console.log(selectRequest2 + "\n" + filterRequest2);
        const { data2, error2 } = await supabase.rpc('getcontact_csv_1', { selectcontact: selectRequest2, filtercontact: filterRequest2 });
        if (error2) {
          throw new Error(`Supabase RPC Error: ${error2.message}`);
        }
        if(data2.length === 0)
          return csv;
        csv2 = csv + '\n' + data2[0].TITLE;//Papa.unparse(data2[0]);
      }else{
        csv2 = csv;
      }
      csv2 = removeEmptyLines(csv2);
      console.log(csv2);
      return csv2;
      } catch (err) {
        console.error(err);
      } 
      
  }

  async function fetchChatGPTResponse(message) {
    try {
      let csv = await prepareQuery(message,"contact_csv","Contact name,Job title,Business phone,Account,Email,Mobile phone,Modified on,Data entry compliance");

      for (let i = 0; i < textArray.length; i++) {
        const ret = await callChatGPT(textArray[i],message);
        console.log(ret);
        if(ret.includes("not mention") || ret.includes("not include") || ret.includes("not contain") || ret.includes("sorry")){
          continue;
        }else{
          csv = csv + "\n" + ret;
        }         
      }

      return csv;

    } catch (error) {
      console.error('Error fetching ChatGPT response:', error);
      return 'Sorry, I couldn\'t process your request.';
    }
  }

  const contentRef = useRef(null);

  const [textArray, setTextArray] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try{
      // Fetch file paths from the backend
      const pathFiles = keyPaths.split(";");
      // Fetch all files concurrently
      const fileFetches = pathFiles.map((path) =>
        fetch(path)
          .then((response) => {
            if (path.endsWith(".txt")) {
              return response.text(); // Read as text for TXT files
            } else if (path.endsWith(".pdf")) {
              return response.arrayBuffer(); // Read as binary for PDF files
            }
          })
          .catch((error) => console.error("Error fetching file:", error))
      );
      // Wait for all fetches to resolve
      const fileBuffers = await Promise.all(fileFetches);

      // Process the files based on their type
      const processedFiles = await Promise.all(
        fileBuffers.map((buffer, index) => {
          const fileUrl = pathFiles[index];
          if (fileUrl.endsWith(".txt")) {
            return buffer; // TXT: Just return the text content
          } else if (fileUrl.endsWith(".pdf")) {
            return processPdf(buffer); // Process PDF file
          }
        })
      );
      
      // Set the processed contents to the state
      setTextArray(processedFiles);
      } catch (err) {
        console.error("Error in fetchFiles function:", err);
      }
    };

    fetchFiles();
  }, []);

  // Process PDF files
  const processPdf = async (arrayBuffer) => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      text += pageText + "\n";
    }
    return text;
  };

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  // Scroll to the bottom whenever messages are updated
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [messages]); // This effect runs when the messages array changes

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
      setDisplayHeader('flex');
      const chatResponse = await fetchChatGPTResponse(chatInput);
      const newMessage2 = {
        sender: 'Jane',
        text: chatResponse,
        timestamp,
      }; 
      setMessages((prevMessages) => [...prevMessages, newMessage2]);     
      setDisplayHeader('none');
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
        <div className="chat-header typing-indicator" style={{ display: displayHeader }}>
          <h2 className="chat-header">{messageSender} chatting</h2>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <div ref={contentRef} className="chat-messages">
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
          <textarea id="message" name="message" rows="5" cols="50" className="chat-input" value={chatInput} placeholder={`Type here, ${messageSender}...`} onChange={(e) => setChatInput(e.target.value)}></textarea>          
          <button type="submit" className="button send-button">Send</button>
        </form>

        <button className="button send-button" onClick={handleClearChat}>
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

