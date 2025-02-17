import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import "../styles/CommentListener.css";
import * as pdfjsLib from "pdfjs-dist";
import Papa from 'papaparse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createPerplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';
import { HfInference } from "@huggingface/inference";

const perplexity = createPerplexity({
  apiKey: import.meta.env.VITE_PERPLEXITY_API_KEY,
});


pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// Initialize ENV Variables
const public_holidays = import.meta.env.VITE_PUBLIC_HOLIDAYS_2025;
const chatgpt_api_url = import.meta.env.VITE_CHATGPT_URL;
const chatgpt_api_key = import.meta.env.VITE_CHATGPT_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CommentListener = () => {
  
  const [userInteracted, setUserInteracted] = useState(false);
  const [services, setServices] = useState([]);
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('messages')) || []);
  const [linesDay, setLinesDay] = useState(() => {
    const savedLinesDay = localStorage.getItem('linesDay');
    return savedLinesDay ? JSON.parse(savedLinesDay) : [[]];
  });
  const isDisabled = messages.length === 0;
  const [usrValue, setUsrValue] = useState(import.meta.env.VITE_HUGGING_KEY);
  const [chatInput, setChatInput] = useState('');
  const [displayHeader, setDisplayHeader] = useState('none');
  const [copied, setCopied] = useState(false);
  const [selLang, setSelLang] = useState(import.meta.env.VITE_LANG);
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(err => console.error("Failed to copy:", err));
  };

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase.from("SERVICE").select("id,en");
      
      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setServices(data);
      }
    };
    fetchServices();
  }, []);

  const getWorkingDays = (startDate, endDate, publicHolidays, totalDays, idxService) => {
    let workingDays = [];
    let currentDate = new Date(startDate);
    let d = 0;
    //let dayGroup = [];
  
    // Collect all valid working days
    while (currentDate <= endDate) {
      let dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      let formattedDate = currentDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  
      if (dayOfWeek !== 0 && !publicHolidays.includes(formattedDate)) {
        workingDays.push(formattedDate); // Add valid working day to the array
      }
      
      d++;
      if (d === totalDays) break;
      
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }
  
    // Sort working days in ascending order
    workingDays.sort((a, b) => new Date(a) - new Date(b));
  
    // Group working days into arrays (example: 5 working days per group)
    let groupedWorkingDays = [];
    for (let i = 0; i < workingDays.length; i += 5) {
      groupedWorkingDays.push(idxService + "-" + workingDays.slice(i, i + 5));
    }
  
    return groupedWorkingDays;
  };
  

  /*const getWorkingDays = (startDate, endDate, publicHolidays, totalDays) => {
    let workingDays = [];
    let currentDate = new Date(startDate);
    let d = 0;
    while (currentDate <= endDate) {
      let dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      let formattedDate = currentDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  
      if (dayOfWeek !== 0 && !publicHolidays.includes(formattedDate)) {
        workingDays.push(formattedDate);
      }
      d++;
      if(d === totalDays)
        break;
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }
  
    return workingDays;
  };*/

  const handleFocus = () => {
    setUserInteracted(true);
  };

  const [displayBudget, setDisplayBudget] = useState(
    {
      display: (import.meta.env.VITE_OPT_BUDGET === "1" ? "block" : "none")
    }
  );
  const [displayInfo, setDisplayInfo] = useState(
    {
      display: "block"
    }
  );
  const [displayCita, setDisplayCita] = useState(
    {
      display: (import.meta.env.VITE_OPT_CITA === "1" ? "block" : "none")
    }
  );
  const labelCopied = selLang === 'es' ? 'Copiado !' : (selLang === 'en' ? 'Copied !' : 'Copié !'); 
  const curMe = selLang === 'es' ? 'Yo' : (selLang === 'en' ? 'Me' : 'Moi');
  const [categ, setCateg] = useState(1);
  const [messageSender, setMessageSender] = useState(curMe);
  const curAI = selLang === 'es' ? 'Asistente virtual' : (selLang === 'en' ? 'Virtual assistant' : 'Assistant virtuel');
  const curSend = selLang === 'es' ? 'Enviar' : (selLang === 'en' ? 'Send' : 'Envoyer');
  const curClear = selLang === 'es' ? 'Borrar' : (selLang === 'en' ? 'Clear' : 'Effacer');
  const curInfo = selLang === 'es' ? 'Información' : 'Information';
  const curCita = selLang === 'es' ? 'Cita' : (selLang === 'en' ? '📅​' : 'Rdv');
  const curBudget = selLang === 'es' ? 'Presupuesto' : 'Budget';
  const curTypeHere = selLang === 'es' ? 'Escribe aquí' : (selLang === 'en' ? 'Type here' : 'Tapez ici'); 

  //Examples of CSV
  const keyPaths = ""; //"/files/Mathematical database development_.pdf";

  async function callAPIAI(prefix, message) {
    try {
      const type_ai = import.meta.env.VITE_TYPE_AI;
      console.log("Type AI : " + type_ai);
      const prompt = prefix + (prefix === "" ? "" : `\nBased on the previous text and/or CSV report, provide a natural and conversational response to the following question :  `
              ) + message + "No recomendar de ponerse en contacto con empresas de limpieza locales. La expresión 'Lo siento' no puede aparecer en la respuesta."
      if(type_ai === "1"){
        const max = Number(import.meta.env.VITE_MAX_TOKENS_CHATGPT);
        const response = await fetch(chatgpt_api_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + chatgpt_api_key
          },
          body: JSON.stringify({
            "model": "gpt-4",
            "messages": [
              { "role": "system", "content": "You are a company in the construction industry." },
              { "role": "user", "content": prompt }
            ],
            max_tokens: max
          })
        });

        const data = await response.json();
        return data.choices[0].message.content;
      }
      if(type_ai === "2"){
        const max = Number(import.meta.env.VITE_MAX_TOKENS_GEMINI);
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Replace with your actual API key
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash', 
          systemInstruction: "You are a company in the construction industry.",
          "maxOutputTokens":max
        });
      
        const result = await model.generateContent(prompt);
        
        console.log("USE GEMINI, input :\n" + prompt);
        return result.response.text(); 
      }
      if(type_ai === "3"){
        const max = Number(import.meta.env.VITE_MAX_TOKENS_HUGGING);
        console.log("Max : " + max);
        const key = import.meta.env.VITE_HUGGING_KEY;
        const client = new HfInference(key);
        const modelHugging = import.meta.env.VITE_HUGGING_MODEL;
        const chatCompletion = await client.chatCompletion({
          model: modelHugging,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          provider: "together",
          max_tokens: max
        });
        const resp = chatCompletion.choices[0].message.content;
        console.log(resp);
        return resp;
      }
      if(type_ai === "4"){
          const max = Number(import.meta.env.VITE_MAX_TOKENS_PERPLEXITY);
          const result = await generateText({
            model: perplexity('llama-3.1-sonar-small-128k-online'),
            prompt: prompt,
            max_tokens:max
          });
                       
          console.log("USE PERPLEXITY" + prompt);
          return result.text;        
      }
    } catch (error) {
      console.error('Error generating content:', error);
    }
    return "No-API AI"; 
  }

  const removeEmptyLines = (text) => {
    return text
      .split("\n") // Split by newline
      .filter(line => line.trim() !== "") // Remove empty lines
      .join("\n"); // Join back into a string
  };  

  async function prepareQuery(message, tableName, procedureName, headers) {
    try {
      let csv = "";
      if(categ === 1){          
        
        const { data, error } = await supabase.rpc(procedureName);
        if (error) {
          throw new Error(`Supabase RPC Error: ${error.message}`);
        }        
        console.log(data.length + "-" + procedureName);
        if(data.length <= 1){ 
          if(data.length > 0)
            csv = data[0].TITLE;
          else
            csv = "";
        }else{
          csv = Papa.unparse(data, {
            header: false,
            newline: '\r\n',
            quotes: false, // Disable quoting of fields            
          });          
        }
        csv = csv.replace(/"/g, '');
        const wap = import.meta.env.VITE_WHATSAPP;
        csv = await callAPIAI(csv + ".\nSi la información necesaria para proporcionar un presupuesto no es suficiente, dar el WhatsApp del jefe de la empresa : +" + wap + " (ultima frase de la respuesta).",message);
        console.log("Request only : \n" + csv);
        
        return csv;
      }else{
        if(categ === 2){
          let respAI = await callAPIAI("",message);
          return respAI;
        }
      }
    let req = `
      How should I request a supabase table "${tableName}" with the headers "${headers}" if I have to answer to the question : "${message}" ? Give as anwer only the select string and the filter string in the JSON format model 
      {
        "select": "Account",
        "filter": "Contact name=%Bertrand VANNE%"
      }. Follow the previous JSON model strictly.
      `;
      const jsonContact = await callAPIAI("",req);
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
      const { data, error } = await supabase.rpc(procedureName, { selectcontact: selectRequest, filtercontact: filterRequest });
      if (error) {
        throw new Error(`Supabase RPC Error: ${error.message}`);
      }
      let csv2 = "";    
      console.log("Number of items : " + data.length);  
      
      if(data.length === 0){
        return "";  
      }else{
        if(data.length <= 1){ 
          csv = data[0].TITLE;
        }else{
          csv = Papa.unparse(data, {
            header: false,  // Do not include column headers
            newline: '\r\n'
          });          
        }
      }   
    
      console.log(csv);    
      if(ct >= 2){
        console.log(selectRequest2 + "\n" + filterRequest2);
        const { data2, error2 } = await supabase.rpc(procedureName, { selectcontact: selectRequest2, filtercontact: filterRequest2 });
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

  async function fetchChatAIResponse(message) {
    try {
      const procedure = import.meta.env.VITE_PROCEDURE_GET + import.meta.env.VITE_ID_CLIENT + "_" + selLang;
      //let csv = await prepareQuery(message,"contact_csv","getcontact_csv_1","Contact name,Job title,Business phone,Account,Email,Mobile phone,Modified on,Data entry compliance");
      let csv = await prepareQuery(message, "", procedure, "");
      console.log(textArray.length);
      for (let i = 0; i < textArray.length; i++) {
        const ret = await callAPIAI(textArray[i],message);
        console.log(ret);
        if(ret.includes("doesn't provide") || ret.includes("doesn't mention") || ret.includes("doesn't include") ||
          ret.includes("not provide") || ret.includes("not mention") || ret.includes("not include") || 
          ret.includes("doesn't specify") || ret.includes("not specify") || ret.includes("not contain") || ret.includes("sorry")){
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

  const lstMsgRef = useRef(null);

  const [textArray, setTextArray] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try{
      if(keyPaths != ""){
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
      }
      
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
    if (lstMsgRef.current) {
      lstMsgRef.current.scrollTop = lstMsgRef.current.scrollHeight;
    }
  }, [messages]); // This effect runs when the messages array changes

  const handleSenderChange = (name) => {
    setMessageSender(name);
  };

  const startTime = Date.now();

  const handleSendMessage = async (e) => {
    e.preventDefault();  
      
    if (usrValue !== import.meta.env.VITE_HUGGING_KEY){
      console.warn("Bot detected! Submission blocked.");
      return;
    }else{
      const timeTaken = Date.now() - startTime;
      console.log("Diff : " + timeTaken);
      if (timeTaken < 2000) {
        console.log("Bot detected: Too fast!");
        return;
      }else{
        if (!userInteracted) {
          console.log("Bot detected: No prior interaction!");
          return;
        }
      }
    }
    
    if (chatInput.trim() === '') return;
    const curFormat = selLang === 'es' ? 'es-ES' : (selLang === 'en' ? 'en-US' : 'fr-FR');
    const timestamp = new Date().toLocaleString(curFormat, {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    
    let wap = "";
    let lnkWAP = "";    
    
    const newMessage = {
      sender: messageSender,
      text: chatInput,
      lines: chatInput.split('\n'),
      whatsapp:wap,
      lnkWhatsapp:lnkWAP,
      timestamp,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    const phone = import.meta.env.VITE_WHATSAPP;
    if(messageSender === curMe){
      console.log('msg : ' + chatInput);
      setDisplayHeader('flex');
      let chatResponse = await fetchChatAIResponse(chatInput);
      if(!chatResponse.includes(phone)){
        wap = "";
        lnkWAP = "";
      }else{
        wap = "+" + phone;
        lnkWAP = "https://wa.me/" + phone + "?text=" + chatResponse;
      }
      console.log("Before html : " + chatResponse);
      const pattern = new RegExp(`\\+${wap}\\.`, "g");
      chatResponse = chatResponse.replace(pattern, ":");
      const newMessage2 = {
        sender: curAI,
        text: chatResponse,
        lines: chatResponse.split('\n'),
        whatsapp:wap,
        lnkWhatsapp:lnkWAP,
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
    setDisplayBudget(
      {
        display: "block"
      }
    ); 
    setDisplayInfo(
      {
        display: "block"
      }
    );  
  };

  const manageCita = (e) => {
    console.log(e.target.value);
    const startDate = formatDate(new Date());
    const endDate = formatDate(new Date("2099-12-31"));
    console.log(startDate);
    console.log(endDate);
    let array = getWorkingDays(startDate, endDate, public_holidays, 29, e.target.value);
    console.log(array.length);
    setLinesDay(array);
  };

  const manageServiceCita = (e) => {

  };

  const manageHourCita = (e) => {

  };

  const manageDateCita = (e) => {

  };

  const handleChat = (typeChat) => {
    
    setCateg(typeChat);
    localStorage.clear();
    setMessages([]);
    let wap = "";
    let lnkWAP = "";
    const curFormat = selLang === 'es' ? 'es-ES' : (selLang === 'en' ? 'en-US' : 'fr-FR');
    const timestamp = new Date().toLocaleString(curFormat, {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour24: true,
    });
    let msg = "";
    if(typeChat === 1){
      msg = selLang === 'es' ? '¿ Qué tipo de presupuesto le gustaría recibir ?' : (selLang === 'en' ? 'What kind of quote would you like to receive ?' : 'Quel type de devis aimeriez-vous recevoir ?');
      if(import.meta.env.VITE_OPT_BUDGET === "1"){
        setDisplayBudget(
          {
            display: "none"
          }
        );
      } 
      if(import.meta.env.VITE_OPT_CITA === "1"){
        setDisplayCita(
          {
            display: "block"
          }
        );
      }      
      setDisplayInfo(
        {
          display: "block"
        }
      ); 
    }
    if(typeChat === 2){
      msg = selLang === 'es' ? '¿ Qué tipo de información le gustaría recibir ?' : (selLang === 'en' ? 'What specific information would you like to receive ?' : "Quel type d'informations souhaiteriez-vous recevoir ?");
      if(import.meta.env.VITE_OPT_BUDGET === "1"){
        setDisplayBudget(
          {
            display: "block"
          }
        );
      }
      if(import.meta.env.VITE_OPT_CITA === "1"){
        setDisplayCita(
          {
            display: "block"
          }
        ); 
      }       
      setDisplayInfo(
        {
          display: "none"
        }
      ); 
    }     
    if(typeChat === 3){
      msg = selLang === 'es' ? '¿ Qué día le gustaría programar una cita ?' : (selLang === 'en' ? 'Which day would you like to schedule an appointment ?' : "Quel jour souhaitez-vous prendre rendez-vous ?");
      if(import.meta.env.VITE_OPT_BUDGET === "1"){
        setDisplayBudget(
          {
            display: "block"
          }
        );
      }
      setDisplayInfo(
        {
          display: "block"
        }
      ); 
      setDisplayCita(
        {
          display: "none"
        }
      );
      const array = [[]];
      array.push([]);
      services.map(item => array[0].push(item.id + "-" + item.en));
      
      setLinesDay(array);
    }
    const newMsg = {
      sender: curAI,
      text: msg,
      lines: [],
      whatsapp:wap,
      lnkWhatsapp:lnkWAP,
      timestamp,
    };
    setMessages((prevMessages) => [...prevMessages, newMsg]);
    setMessageSender(curMe);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const handleUsr = (e) => {
    setUsrValue(e.target.value);
  };

  return (
    <div className="app-container">      

      <div className="chat-container">        
        <div className="chat-header typing-indicator" style={{ display: displayHeader }}>
          <h2 className="chat-header">{messageSender} chatting</h2>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <div ref={lstMsgRef} className="chat-messages">
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
                      </span>
                    ))
                  : message.text}
                  <br/><a style={{ color: 'white' }} href={message.lnkWhatsapp}>{message.whatsapp}</a>
              </div>      
              <div className="message-timestamp">{message.timestamp}</div>
            </div>
          ))}
          <div class="cita-container">
          {linesDay.map((lin, idxLin) => (
              <div key={idxLin} className="button-line">  
                {lin.map((col, idxCol) => (
                  <button
                    key={idxCol}  
                    className="cita-button button send-button"
                    onClick={(e) => manageCita(e)} value={col.split("-")[0]}
                  >
                    {col.split("-").length > 1 ? col.split("-")[1] : col} 
                  </button>
                ))}
                <br/>
              </div>
            ))}
            
            </div>
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <textarea id="message" name="message" rows="5" cols="50" disabled={isDisabled} className="chat-input" value={chatInput} placeholder={`${curTypeHere}, ${messageSender}...`} onFocus={handleFocus} onChange={(e) => setChatInput(e.target.value)}></textarea>          
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
          <button type="submit" disabled={isDisabled} className="button send-button">{curSend}</button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {/* Left-aligned button */}
          <button className="button send-button" onClick={handleClearChat}>
            {curClear}
          </button>
          <div style={{ display: "flex", gap: "20px", alignItems: "center", color: "white", fontWeight: "bold" }}>
            {/* Radio Button 1 */}
            <input
              type="radio"
              id="en"
              name="options"
              checked={selLang === "en"}
              style={{ display: "none" }}
            />
            <label htmlFor="EN" className="label" onClick={() => setSelLang("en")}>
              <span className={`radio ${selLang === "en" ? "selected" : ""}`} onClick={() => setSelLang("en")}></span>
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
            <label htmlFor="FR" className="label" onClick={() => setSelLang("fr")}>
              <span className={`radio ${selLang === "fr" ? "selected" : ""}`} onClick={() => setSelLang("fr")}></span>
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
            <label htmlFor="ES" className="label" onClick={() => setSelLang("es")}>
              <span className={`radio ${selLang === "es" ? "selected" : ""}`} onClick={() => setSelLang("es")}></span>
              ES
            </label>
          </div>
          {/* Right-aligned buttons */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <button style={displayInfo} className="button send-button" onClick={() => handleChat(2)}>
              {curInfo}
            </button>
            <button style={displayBudget} className="button send-button" onClick={() => handleChat(1)}>
              {curBudget}
            </button>
            <button style={displayCita} className="button send-button" onClick={() => handleChat(3)}>
              {curCita}
            </button>
          </div>
        </div>
        
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

