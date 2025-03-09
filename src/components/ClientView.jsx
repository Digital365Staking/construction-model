import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import "../styles/ClientView.css";
import * as pdfjsLib from "pdfjs-dist";
import Papa from 'papaparse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createPerplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';
import { HfInference } from "@huggingface/inference";
import emailjs from 'emailjs-com';
import { saveAs } from "file-saver";
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// import required modules
import { Keyboard, Pagination, Navigation } from 'swiper/modules';

const perplexity = createPerplexity({
  apiKey: import.meta.env.VITE_PERPLEXITY_API_KEY,
});

import { GraphQLClient } from 'graphql-request';
import { createClient as createWSClient } from 'graphql-ws';

const client = new GraphQLClient(import.meta.env.VITE_GRAPHQL_URL, {
  headers: {
    "x-hasura-admin-secret": import.meta.env.VITE_GRAPHQL_KEY,
  },
});

// Create WebSocket client for real-time subscriptions
const wsClient = createWSClient({
  url: import.meta.env.VITE_GRAPHQL_URL.replace('https','wss'),
  connectionParams: {
    headers: {
      "x-hasura-admin-secret": import.meta.env.VITE_GRAPHQL_KEY,
    },
  }
});


pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// Initialize ENV Variables
const year = new Date().getFullYear();
const envVarName = `VITE_PUBLIC_HOLIDAYS_${year}`;
const public_holidays = import.meta.env[envVarName];
const chatgpt_api_url = import.meta.env.VITE_CHATGPT_URL;
const chatgpt_api_key = import.meta.env.VITE_CHATGPT_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ClientView = () => {
  const id_client = Number(import.meta.env.VITE_ID_CLIENT);
  const start_slot_am = import.meta.env.VITE_START_SLOT_AM;
  const end_slot_am = import.meta.env.VITE_END_SLOT_AM;
  const start_slot_pm = import.meta.env.VITE_START_SLOT_PM;
  const end_slot_pm = import.meta.env.VITE_END_SLOT_PM;
  const [userInteracted, setUserInteracted] = useState(false);
  const [services, setServices] = useState([]);
  const [curPseudo, setCurPseudo] = useState(() => JSON.parse(localStorage.getItem('curPseudo')) || '');
  const [curIdClient, setCurIdClient] = useState(0);
  const [curCateg, setCurCateg] = useState(() => JSON.parse(localStorage.getItem('curCateg')) || 0);
  const [availability, setAvailability] = useState([]);
  const [messages, setMessages] = useState([]);
  //useState(() => JSON.parse(localStorage.getItem('messages')) || []);
  const [linesDay, setLinesDay] = useState([[]]);
  const [usrValue, setUsrValue] = useState(import.meta.env.VITE_HUGGING_KEY);
  const [chatInput, setChatInput] = useState('');
  const [displayHeader, setDisplayHeader] = useState('none');
  const [copied, setCopied] = useState(false);
  const [selLang, setSelLang] = useState(import.meta.env.VITE_LANG);
  const GetMsgResumeCita = (lang) => {
    if(lang === "")
      return selLang === 'es' ? 'Resumen de mi cita' : (selLang === 'en' ? 'Summary of my appointment' : "Résumé de mon rendez-vous");
    else
      return lang === 'es' ? 'Resumen de mi cita' : (lang === 'en' ? 'Summary of my appointment' : "Résumé de mon rendez-vous");
  };
  const GetMsgDateHourCita = (lang) => {
    if(lang === "")
      return selLang === 'es' ? 'Fecha y hora de mi cita : ' : (selLang === 'en' ? 'Date and time of my appointment : ' : "Date et heure de mon rendez-vous : ");
    else
      return lang === 'es' ? 'Fecha y hora de mi cita : ' : (lang === 'en' ? 'Date and time of my appointment : ' : "Date et heure de mon rendez-vous : ");
  };
  const GetMsgTypeCita = (lang) => {
    if(lang === "")
      return selLang === 'es' ? 'Tipo de servicio : ' : (selLang === 'en' ? 'Type of service : ' : "Type de service : ");
    else
      return lang === 'es' ? 'Tipo de servicio : ' : (lang === 'en' ? 'Type of service : ' : "Type de service : ");
  };
  const GetMsgContactCita = (lang) => {
    if(lang === "")
      return (selLang === 'en' ? 'WhatsApp of the manager : ' : "WhatsApp de la responsable : ");
    else
      return (lang === 'en' ? 'WhatsApp of the manager : ' : "WhatsApp de la responsable : ");
  };
  const GetMsgUpdateCita = (lang) => {
    if(lang === "")
      return selLang === 'es' ? "Para cancelar su cita, haga clic en el botón 'Cancelar' en la parte inferior izquierda de la página. Para cualquier modificación, por favor contacte a la responsable a través de WhatsApp." : (selLang === 'en' ? "To cancel your appointment, click on the 'Cancel' button at the bottom left of the page. For any changes, please contact the manager via WhatsApp." : "Pour annuler votre rendez-vous, cliquez sur le bouton 'Annuler' en bas à gauche de la page. Pour toute modification, veuillez contacter la responsable via WhatsApp.");
    else
      return lang === 'es' ? "Para cancelar su cita, haga clic en el botón 'Cancelar' en la parte inferior izquierda de la página. Para cualquier modificación, por favor contacte a la responsable a través de WhatsApp." : (selLang === 'en' ? "To cancel your appointment, click on the 'Cancel' button at the bottom left of the page. For any changes, please contact the manager via WhatsApp." : "Pour annuler votre rendez-vous, cliquez sur le bouton 'Annuler' en bas à gauche de la page. Pour toute modification, veuillez contacter la responsable via WhatsApp.");
  };
  const GetMsgInitCita = (lang) => {
    if(lang === "")
      return selLang === 'es' ? '¿ Para qué tipo de servicio desea solicitar una cita ?' : (selLang === 'en' ? 'What type of service would you like to schedule an appointment for ?' : "Pour quel type de service souhaitez-vous prendre rendez-vous ?");
    else
      return lang === 'es' ? '¿ Para qué tipo de servicio desea solicitar una cita ?' : (lang === 'en' ? 'What type of service would you like to schedule an appointment for ?' : "Pour quel type de service souhaitez-vous prendre rendez-vous ?");
  }; 
  const GetMsgInitInfo = (lang) => {
    if(lang === "")
      return selLang === 'es' ? '¿ Qué tipo de información le gustaría recibir ?' : (selLang === 'en' ? 'What specific information would you like to receive ?' : "Quel type d'informations souhaiteriez-vous recevoir ?");
    else
      return lang === 'es' ? '¿ Qué tipo de información le gustaría recibir ?' : (lang === 'en' ? 'What specific information would you like to receive ?' : "Quel type d'informations souhaiteriez-vous recevoir ?");
  };
  const GetMsgInitBudget = (lang) => {
    if(lang === "")
      return selLang === 'es' ? '¿ Qué tipo de presupuesto le gustaría recibir ?' : (selLang === 'en' ? 'What kind of quote would you like to receive ?' : 'Quel type de devis aimeriez-vous recevoir ?');
    else
      return lang === 'es' ? '¿ Qué tipo de presupuesto le gustaría recibir ?' : (lang === 'en' ? 'What kind of quote would you like to receive ?' : 'Quel type de devis aimeriez-vous recevoir ?');
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(err => console.error("Failed to copy:", err));
  };

  const sendCita = (emailClient,emailAdmin,subject,msg,lbl_headerCita,lbl_datehour,val_datehour,lbl_service,val_service,
    lbl_name,val_name,lbl_wap, val_wap
  ) => {
    generateICSFile(msg);
    const templateParams = {
      from_name: subject,
      to_name: emailClient, // email client
      lbl_headerCita: lbl_headerCita,
      lbl_datehour: lbl_datehour,
      val_datehour: val_datehour,
      lbl_service: lbl_service,
      val_service: val_service,
      lbl_name:lbl_name,
      val_name:val_name,
      email:emailClient, 
      lbl_wap: lbl_wap,
      val_wap: val_wap,
      msg: msg,
      reply_to: emailAdmin // email admin
    };
    //generateICSFile
    emailjs.send(
      import.meta.env.VITE_EMAIL_SERVICE_ID,         // Service ID (from EmailJS)
      import.meta.env.VITE_EMAIL_TEMPLATE_ID,        // Template ID (from EmailJS)
      templateParams,
      import.meta.env.VITE_EMAIL_USER_ID             // Your user ID (from EmailJS)
    ).then((response) => {
      console.log('SUCCESS Mail !', response.status, response.text);
    }, (err) => {
      console.log('FAILED Mail ...', err);
    });
  };

  useEffect(() => {
    setCurIdClient(id_client);
    
    const fetchAvailability = async () => {
      try {
        const QUERY_AVAILABILITY = `
          query GetAvailability {
            AVAILABILITY {
              id
              slot
              id_client
              cur_date
            }
          }
        `;
        const data = await client.request(QUERY_AVAILABILITY, { id_client : id_client });
        setAvailability(data.AVAILABILITY); 
      } catch (error) {
        console.error("Error fetching data:", error);
      } 
    };
    fetchAvailability();
  }, []);

  const QUERY = `
    query GetSERVICE {
      SERVICE {
        id
        en
        es
        fr
        cat
      }
    }
  `;

  const fetchServices = async () => {
    try {
      const data = await client.request(QUERY);
      //console.log("A" + data.SERVICE.length);
      setServices(data.SERVICE); 
    } catch (error) {
      console.error("Error fetching data:", error);
    }      
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const getWorkingDays = (startDate, endDate, publicHolidays, totalDays) => {
    let workingDays = [];
    let currentDate = new Date(startDate);
    let d = 0;
  
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
      groupedWorkingDays.push(workingDays.slice(i, i + 5));
    }
  
    return groupedWorkingDays;
  };

  const handleFocus = () => {
    setUserInteracted(true);
  };
  
  const [displayBudget, setDisplayBudget] = useState(
    {
      display: (import.meta.env.VITE_OPT_BUDGET === "1" && curCateg !== 1 ? "block" : "none")
    }
  );
  const [displayInfo, setDisplayInfo] = useState(
    {
      display: (curCateg !== 0 ? "block" : "none")
    }
  );
  const [displayCita, setDisplayCita] = useState(
    {
      display: (import.meta.env.VITE_OPT_CITA === "1" && curCateg !== 2 ? "block" : "none")
    }
  );
  const labelCopied = selLang === 'es' ? 'Copiado !' : (selLang === 'en' ? 'Copied !' : 'Copié !');
  const codeLang = (lang) => {
    if(lang == "")
      return selLang === 'es' ? 'es-ES' : (selLang === 'en' ? 'en-US' : 'fr-FR');
    else
      return lang === 'es' ? 'es-ES' : (lang === 'en' ? 'en-US' : 'fr-FR');
  } 
  const curMe = selLang === 'es' ? 'Yo' : (selLang === 'en' ? 'Me' : 'Moi');
  const [curCita1, setCurCita1] = useState(
    () => JSON.parse(localStorage.getItem('curCita1')) ||
    {
      idService: 0,
      labelService: "",
      dateCita: new Date(),
      nombre: "",
      contact: "",
      stepCita: 0
    }
  );
  const [isDisabled, setIsDisabled]  = useState((curCateg === 2 && curCita1.stepCita < 3) || (curCita1.contact !== ""));
  //localStorage.clear();
  
  useEffect(() => {
    console.log("curCita1 lbl : " + curCita1.labelService);
    console.log("curCita1 date : " + curCita1.dateCita);
    console.log("curCita1 name : " + curCita1.nombre);
    console.log("curCita1 contact : " + curCita1.contact);
    console.log("curCita1 Step : " + curCita1.stepCita);
    console.log("curCateg : " + curCateg);
    console.log("curPseudo : " + curPseudo);
    /*if(curCita1.contact != ""){
      generateCita1();
    }*/
  }, []);


  const [messageSender, setMessageSender] = useState(curMe);
  const curAI = (lang) =>{
    if(lang === ""){
      return selLang === 'es' ? 'Asistente virtual' : (selLang === 'en' ? 'Virtual assistant' : 'Assistant virtuel');
    }else{
      return lang === 'es' ? 'Asistente virtual' : (lang === 'en' ? 'Virtual assistant' : 'Assistant virtuel');
    }     
  };
  const curSend = selLang === 'es' ? 'Enviar' : (selLang === 'en' ? 'Send' : 'Envoyer');
  const curClear = selLang === 'es' ? 'Borrar' : (selLang === 'en' ? 'Clear' : 'Effacer');
  const curCancel = selLang === 'es' ? 'Cancelar' : (selLang === 'en' ? 'Cancel' : 'Annuler');
  const curInfo = selLang === 'es' ? 'Información' : 'Information';
  const curLabelCita = selLang === 'es' ? 'Cita' : (selLang === 'en' ? 'Appointment​' : 'Rendez-vous');
  const curBudget = selLang === 'es' ? 'Presupuesto' : (selLang === 'en' ? 'Quote' : 'Devis');
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
            model: perplexity(import.meta.env.VITE_MODEL_PERPLEXITY),
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
      if(curCateg === 1){          
        const QUERY_DEVIS = `
        query GetInfosDevis() {
          ${procedureName}(
          ){
            title
            price
          }
        }
          `;
        const data = await client.request(QUERY_DEVIS);        
        console.log(data.COMMENT.length + "-" + procedureName);
        if(data.COMMENT.length <= 1){ 
          if(data.COMMENT.length > 0)
            csv = data.COMMENT[0].title;
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
    /*let req = `
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
      return csv2;*/
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
    localStorage.setItem('curCateg', JSON.stringify(curCateg));
    setMessages([]);
    loadMessage(curAI(""),GetMsgInitInfo(""),""); 
  }, [curCateg]);

  useEffect(() => {
    localStorage.setItem('curPseudo', JSON.stringify(curPseudo));
    setMessages([]);
    loadMessage(curAI(""),GetMsgInitInfo(""),""); 
  }, [curPseudo]);

  useEffect(() => {
    localStorage.setItem('curCita1', JSON.stringify(curCita1));
  }, [curCita1]);


  // Scroll to the bottom whenever messages are updated
  useEffect(() => {
    if (lstMsgRef.current) {
      lstMsgRef.current.scrollTop = lstMsgRef.current.scrollHeight;
    }
  }, [messages]); // This effect runs when the messages array changes

  const startTime = Date.now();

  const handleSendMessage = async (e) => {
    e.preventDefault();  
    if (usrValue !== import.meta.env.VITE_HUGGING_KEY){
      console.log("Bot detected! Submission blocked.");
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
    let email = import.meta.env.VITE_EMAIL;
    if(import.meta.env.VITE_OPT_CITA == "1" && displayCita.display === "none" && curCita1.stepCita === 3 && curCita1.contact === ""){
      wap = import.meta.env.VITE_WHATSAPP;
      lnkWAP = "https://wa.me/" + wap + "?text=TT";
      setCurCita1(prevState => ({
        ...prevState,  // Keep existing properties
        nombre:chatInput,
        stepCita: prevState.stepCita + 1  // Update stepCita
      }));
      loadMessage(curMe,chatInput,selLang);
      let msg = selLang === 'es' ? "Finalmente, por favor, ingrese su correo electrónico ( haz clic en 'Enviar' para guardarlo) para confirmar la cita." : (selLang === 'en' ? 'Finally, please enter your email ( click "Send" to save it ) to confirm the appointment.' : "Enfin, veuillez, s'il vous plaît, saisir votre email ( cliquer sur 'Envoyer' pour l'enregistrer ) pour confirmer le rendez-vous.");
      loadMessage(curAI(""),msg,selLang);
      return;
    }else{
      if(import.meta.env.VITE_OPT_CITA == "1" && displayCita.display === "none" && curCita1.stepCita === 4 && curCita1.contact === ""){
        setCurCita1(prevState => ({
          ...prevState,  // Keep existing properties
          contact:chatInput,
          stepCita: prevState.stepCita + 1  // Update stepCita
        }));
              
        setMessages([]);
        let txtMail = GetMsgResumeCita('') + '\n' + GetMsgDateHourCita('') + '\n';
        let dathour = GetUTCDate(new Date(curCita1.dateCita)).toLocaleString(codeLang(''), { weekday: "short", day: "2-digit", month: "2-digit", hour: '2-digit', minute: '2-digit' }); 
        txtMail += dathour + '\n';
        txtMail += GetMsgTypeCita('') + curCita1.labelService + '\n';
        txtMail += GetMsgContactCita('') + " +" + import.meta.env.VITE_WHATSAPP + "\n";
        
        let subject = selLang === 'es' ? "Nueva cita" : (selLang === 'en' ? "New appointment" : "Nouveau rendez-vous");
        let name = selLang === 'es' ? "Nombre : " : (selLang === 'en' ? "Name : " : "Nom : ");
        console.log("Nom :" + curCita1.nombre);
        const encodedMessage = encodeURIComponent(txtMail);
        handleInsertCita();
        sendCita(chatInput,import.meta.env.VITE_EMAIL,subject,encodedMessage,GetMsgResumeCita(''),GetMsgDateHourCita(''),dathour,
        GetMsgTypeCita(''),curCita1.labelService,name,curCita1.nombre,GetMsgContactCita(''),import.meta.env.VITE_WHATSAPP);
        return;
      }
    }
    
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const INSERT_COMMENT = `
      mutation InsertComment(
          $id_client: Int!, 
          $pseudo: String!, 
          $question: String!, 
          $response: String!,
          $created: timestamp,
          $isai: Boolean
        ) {
          insert_COMMENT_one(
            object: { 
              id_client: $id_client, 
              pseudo: $pseudo, 
              question: $question, 
              response: $response, 
              viewed: false, 
              created: $created,
              isai: $isai 
            }
          ) {
            id
            id_client
            pseudo
            question
            response
            viewed
            created
          }
        }
       `;  

       const LAST_HUMAN_COMMENT = `
       query GetLastHumanComment($pseudo: String!) { 
        COMMENT(
          where: { pseudo: { _eq: $pseudo }, isai: { _eq: false } } 
          order_by: { created: desc }
          limit: 1
        ) {
          created
        }
      }
      `;

    if(curCateg == 0){
      let m = `
      This blog offers a comprehensive introduction to one of the most innovative blockchain platforms in the industry. 
      It breaks down the Cardano project’s unique approach to decentralization, scalability, and sustainability. 
      Whether you’re new to blockchain or a seasoned enthusiast, you’ll gain a deeper understanding of Cardano’s proof-of-stake consensus 
      mechanism, its layered architecture, and its impact on global financial systems and smart contracts. 
      This educational resource covers the core fundamentals, some technical aspects, and how Cardano is shaping the future of blockchain 
      technology. It’s perfect for anyone interested in exploring the potential of Cardano and understanding how it stands out in the 
      evolving blockchain landscape.
      `;
      let tim = Date.now();
      //console.log(new Date(Date.now()));
      //return;
      let isai = true;
      if(curPseudo === ''){

        setCurPseudo(tim.toString());
        console.log("pseudo set");
      }else{
        const lastHumanData = await client.request(LAST_HUMAN_COMMENT, { pseudo : curPseudo });
        if (lastHumanData.COMMENT.length > 0) {
          const lastCommentDate = new Date(lastHumanData.COMMENT[0].created);
          const now = new Date();
  
          // Calculate the difference in milliseconds
          const diffInMs = now - lastCommentDate;
  
          // Convert milliseconds to hours
          const diffInHours = diffInMs / (1000 * 60 * 60);
  
          // Check if the difference is more than 1 hour
          if (diffInHours > 1) {
              console.log("The last comment was more than 1 hour ago. pseudo " + curPseudo);              
          } else {
              console.log("The last comment was within the last hour. pseudo " + curPseudo);
              isai = false;
          }          
        }
      }
      

      const result = await client.request(INSERT_COMMENT, {
        id_client : curIdClient,  // Replace with the actual client ID
        pseudo : curPseudo === '' ? tim.toString() : curPseudo,
        question : chatInput,
        response : isai ? m : '-',
        created : new Date(Date.now() + 60 * 60 * 1000),
        isai: isai
      });    
      
      console.log('Comment inserted successfully! ' + result);  // Log the result
      loadMessage(curAI(""),m,"");
      setChatInput(''); 
      return;
    }

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
        sender: curAI(""),
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

  const handleClearChat = async () => {
    setIsDisabled(true); 
    setChatInput('');
    
    if(curCateg !== 2){
      setCurCita1(prevState => ({
        ...prevState,  // Keep existing properties              
        stepCita: 0  // Update stepCita
      }));
      setMessages([]);
      if(curCateg === 0){  
        localStorage.clear();        
        loadMessage(curAI(""),GetMsgInitInfo(""),"");
        
      }
      const timer = setTimeout(() => {
        
        if(curCateg === 1){          
          loadMessage(curAI(""),GetMsgInitBudget(""),"");
        }
      }, 1000);
      
    }else{
      
      const query = `
        mutation DeleteCitaById($id: Int!) {
          delete_CITA(where: { id: { _eq: $id } }) {
            affected_rows
          }
        }
      `;
      const variables = { id: curCita1.idService };
      const response = await client.request(query, variables);

      if (response.delete_CITA.affected_rows > 0) {
        console.log('Cita deleted successfully.');
        setCurCita1(
          {
            idService: 0,
            labelService: "",
            dateCita: new Date(),
            nombre: "",
            contact: "",
            stepCita: 0
          }
        );
      } else {
        console.log('No cita found with that ID.');
      }      
      localStorage.clear();

      const timer = setTimeout(() => {
        InitDispoCita(import.meta.env.VITE_OPT_CITA === "1");
      }, 1000);
      
    }
       
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
    setDisplayCita(
      {
        display: "block"
      }
    );  
    setLinesDay([[]]);
  };

  const initSetCita = async (targetValue, step, lang) => {
    let msg = "";
    //localStorage.clear();
    setMessages([]); 
    const curFormat = selLang === 'es' ? 'es-ES' : (selLang === 'en' ? 'en-US' : 'fr-FR');
    const timestamp = new Date().toLocaleString(curFormat, {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour24: true,
    });   
    const today = new Date();
    let etp = step >= 0 ? step : curCita1.stepCita;
    switch (etp) {
      case 0:
        let filteredData = null;
        if(step < 0){    
          let idServ = Number(targetValue);
          filteredData = services.filter(item => item.id === idServ);
              
          if(curCita1.labelService.length === 0 && today < curCita1.dateCita){
            msg = selLang === 'es' ? 'Usted no puede reservar otra cita porque ya ha reservado dos.' : (selLang === 'en' ? 'You cannot book another appointment because you have already booked two.' : "Vous ne pouvez pas prendre un autre rendez-vous, car vous en avez déjà pris deux.");
              const newMsg = {
                sender: curAI(""),
                text: msg,
                lines: [],
                whatsapp:"",
                lnkWhatsapp:"",
                timestamp,
              };
              setMessages((prevMessages) => [...prevMessages, newMsg]);
              setMessageSender(curMe);
              return;
          }else{
            console.log("filteredData" + filteredData[0]);
            setCurCita1(prevState => ({
              ...prevState,  // Keep existing properties
              idService: idServ,
              labelService: filteredData[0][selLang],              
              stepCita: prevState.stepCita + 1  // Update stepCita
            }));
          }
          msg = GetMsgTypeCita(selLang) + filteredData[0][selLang] + "  " + (selLang === 'es' ? '¿ Qué día le gustaría programar una cita ?' : (selLang === 'en' ? 'Which day would you like to schedule an appointment ?' : "Quel jour souhaitez-vous prendre rendez-vous ?"));
        }else{
          filteredData = services.filter(item => item.id === curCita1.idService);
          setCurCita1(prevState => ({
            ...prevState,  // Keep existing properties
            labelService: filteredData[0][lang]            
          }));
          msg = lang === 'es' ? '¿ Qué día le gustaría programar una cita ?' : (lang === 'en' ? 'Which day would you like to schedule an appointment ?' : "Quel jour souhaitez-vous prendre rendez-vous ?");
        }
       
        console.log(targetValue);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        console.log(tomorrow);
        const startDate = tomorrow;
        const endDate = new Date("2099-12-31");
        console.log(public_holidays);
        let array = getWorkingDays(startDate, endDate, public_holidays, 29);
        setLinesDay(array);
        
        break;
      case 1:
        
        if(etp < 0){
          msg = selLang === 'es' ? '¿ A qué hora ?' : (selLang === 'en' ? 'At what time ?' : "À quelle heure ?");
          //loadMessage(curAI(lang),msg,lang);
        }else{
          msg = lang === 'es' ? '¿ A qué hora ?' : (lang === 'en' ? 'At what time ?' : "À quelle heure ?");          
        }
          
        console.log(targetValue);
        const datTarget = new Date(targetValue);
        /*const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);*/
        setCurCita1(prevState => ({
          ...prevState,  // Keep existing properties
          dateCita: datTarget,
          stepCita: prevState.stepCita + 1  // Update stepCita
        }));
        
        console.log("VITE_ID_CLIENT:", import.meta.env.VITE_ID_CLIENT);
        console.log("VITE_START_SLOT_AM:", import.meta.env.VITE_START_SLOT_AM);
        console.log("VITE_END_SLOT_AM:", import.meta.env.VITE_END_SLOT_AM);
        console.log("VITE_START_SLOT_PM:", import.meta.env.VITE_START_SLOT_PM);
        console.log("VITE_END_SLOT_PM:", import.meta.env.VITE_END_SLOT_PM);
        console.log(availability);
        
        let arr = [[]];
        arr.push([]);
        let c=0;
        let line=-1;
        availability.forEach(item => {
          if (item.cur_date === targetValue) {
            if (c % 4 === 0) {
              arr.push([]);
              line++;
            }
            arr[line].push(item.slot);                
          }
          c++;
        });
        console.log("arr l = " + arr[0].length);
        if(arr[0].length === 0){
            let lg = step < 0 ? selLang : lang;
            const queryClient = `
              query GetClientSlots($id: Int!) {
                CLIENT(where: { id: { _eq: $id } }) {
                  start_slot_am
                  end_slot_am
                  start_slot_pm
                  end_slot_pm
                }
              }
            `;
            const data = await client.request(queryClient, { id: Number(import.meta.env.VITE_ID_CLIENT) });
            const clientSlots = data.CLIENT[0];

            arr = [];
            arr.push(...generateTimeSlots(clientSlots.start_slot_am, clientSlots.end_slot_am));
            arr.push(...generateTimeSlots(clientSlots.start_slot_pm, clientSlots.end_slot_pm));
            
        }

        setLinesDay(arr);
        break;
      case 2:
        console.log('hour selected ' + targetValue);
        if(targetValue.length === 5){
          const firstTwo = Number(targetValue.slice(0, 2));
          const lastTwo = Number(targetValue.slice(-2));          
          let datTarget = new Date();
    
          if(curCita1.contact === ""){
            datTarget = curCita1.dateCita;
            datTarget.setUTCHours(firstTwo);
            datTarget.setUTCMinutes(lastTwo);
            setCurCita1(prevState => ({
              ...prevState,  // Keep existing properties
              dateCita: datTarget,
              nombre:"",
              contact:"",
              stepCita: prevState.stepCita + 1
            }));
                
          }         
        }
        
        if(etp < 0){
          msg = selLang === 'es' ? "Para confirmar la cita, usted debe registrar su nombre y su dirección de correo electrónico. Primero, introduzca su nombre y luego haga clic en 'Enviar' para guardarlo." : (selLang === 'en' ? "To confirm the appointment, you must register your first name and your email address. First, enter your first name, then click 'Send' to save it." : "Pour confirmer le rendez-vous, vous devez enregistrer votre prénom ainsi que votre adresse e-mail. Veuillez d'abord saisir votre prénom, puis cliquez sur 'Envoyer' pour l'enregistrer.");
          
        }else{
          msg = lang === 'es' ? "Para confirmar la cita, usted debe registrar su nombre y su dirección de correo electrónico. Primero, introduzca su nombre y luego haga clic en 'Enviar' para guardarlo." : (lang === 'en' ? "To confirm the appointment, you must register your first name and your email address. First, enter your first name, then click 'Send' to save it." : "Pour confirmer le rendez-vous, vous devez enregistrer votre prénom ainsi que votre adresse e-mail. Veuillez d'abord saisir votre prénom, puis cliquez sur 'Envoyer' pour l'enregistrer.");
          loadMessage(curAI(""),msg,"");
        }
               
        setLinesDay([[]]);
        
        break;
      case 3:
        break;
      default:
        // Code to execute if none of the cases match
    }
    return msg;
    
  }

  const generateTimeSlots = (start, end) => {
    let slots = [];
    let current = new Date(`1970-01-01T${start}:00`);
    let endTime = new Date(`1970-01-01T${end}:00`);
  
    while (current < endTime) {
      let hourSlots = [];
      let hourEnd = new Date(current);
      hourEnd.setMinutes(current.getMinutes() + 60);
  
      while (current < hourEnd && current < endTime) {
        hourSlots.push(current.toTimeString().slice(0, 5));
        current.setMinutes(current.getMinutes() + 15);
      }
      slots.push(hourSlots);
    }
    return slots;
  };

  const generateHourSlots = (startHour, endHour, intervalMinutes) => {
    let slots = [];
    let currentTime = new Date();
    currentTime.setHours(startHour, 0, 0, 0); // Set to startHour:00
  
    while (currentTime.getHours() < endHour) {
      let startTime = currentTime.toTimeString().slice(0, 5); // "HH:MM"
      currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
      let endTime = currentTime.toTimeString().slice(0, 5);
  
      slots.push(`${startTime} - ${endTime}`);
    }
    return slots;
  };

  const CITA_SUBSCRIPTION = `
      subscription CitaSubscription($id_client: Int!) {
        CITA(
          where: { id_client: { _eq: $id_client } } 
          order_by: { created: desc } 
          limit: 1
        ) {
          id
          start_date
        }
      }
    `;
  const DELETE_AVAILABILITY = `
    mutation DeleteAvailability($id_client: Int!, $cur_date: date!, $slot: String!) {
      delete_AVAILABILITY(
        where: { 
          id_client: { _eq: $id_client }, 
          cur_date: { _eq: $cur_date }, 
          slot: { _eq: $slot } 
        }
      ) {
        affected_rows
      }
    }
   `; 

  useEffect(() => {
      
        const unsubscribe = wsClient.subscribe(
          {
            query: CITA_SUBSCRIPTION,  // Pass the subscription directly (no need for print if it's an AST)
            variables: { id_client },     // Pass id_client as a variable
          },
          {
            next: async (data) => {
              if (data.data && data.data.CITA.length > 0) {
                // Example new comment to add (you can replace this with your actual new comment data)
                const formattedDate = data.data.CITA[0].start_date.toISOString().split('T')[0]; // "YYYY-MM-DD"
                console.log(formattedDate);
                const formattedTime = String(date.getHours()).padStart(2, '0') + ":" + 
                      String(date.getMinutes()).padStart(2, '0');
                console.log(formattedTime);
                let data = await client.request(DELETE_AVAILABILITY, { cur_date : data.data.CITA[0].start_date,
                   id_client : id_client, slot : formattedTime });             
              }
            },
            error: (err) => console.error('Subscription error:', err),
            complete: () => console.log('Subscription complete'),
          }
        );
      
        return () => unsubscribe(); // Unsubscribe on unmount
      }, [wsClient, COMMENT_SUBSCRIPTION, id_client]); // Include id_client in dependencies

  const manageCita = async (e) => {
    e.preventDefault();
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (regex.test(e.target.value)){
      const CHECK_AVAILABILITY = `
        query CheckAvailability($cur_date: date!, $id_client: Int!) {
          AVAILABILITY(where: { cur_date: { _eq: $cur_date }, id_client: { _eq: $id_client } }) {
            id
          }
        }
      `;
      const data = await client.request(CHECK_AVAILABILITY, { cur_date : new Date(e.target.value), id_client : id_client });
      if(data.AVAILABILITY.length === 0){

        const INSERT_AVAILABILITY = `
          mutation InsertAvailability($objects: [AVAILABILITY_insert_input!]!) {
            insert_AVAILABILITY(objects: $objects) {
              returning {
                id_client
                cur_date
                slot
              }
            }
          }
        `;

        let timeSlots = generateTimeSlots(Number(start_slot_am.slice(0, 2)), Number(end_slot_am.slice(0, 2)), 15); // 15-minute slots from 09:00 to 14:00
        
        let objects = timeSlots.map(slot => ({
          cur_date,
          id_client,
          slot
        }));
      
        // Insert all time slots into the database
        await client.mutate({
          mutation: INSERT_AVAILABILITY,
          variables: { objects }
        });

        timeSlots = generateTimeSlots(Number(start_slot_pm.slice(0, 2)), Number(end_slot_pm.slice(0, 2)), 15); // 15-minute slots from 09:00 to 14:00
      
        objects = timeSlots.map(slot => ({
          cur_date,
          id_client,
          slot
        }));
      
        // Insert all time slots into the database
        await client.mutate({
          mutation: INSERT_AVAILABILITY,
          variables: { objects }
        });

        console.log("Availability slots inserted successfully:", timeSlots);
      }
    }
    console.log("manageCita" + curCita1.labelService);
    let msg = initSetCita(e.target.value, -1, selLang);
    console.log(e.target.value + "-" + msg);
    setMessages([]);
    loadMessage(curAI(""),msg,"");
  };

  const handleChat = (typeChat) => {
    setIsDisabled(typeChat === 2);
    setCurCateg(typeChat);
    //setLinesDay([[]]);
    //localStorage.clear();
    
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
    
    if(typeChat === 1){
      
      
      
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
    if(typeChat === 0){
      
      
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
    const timer = setTimeout(() => {
      let msg = "";
      setMessages([]);
      if(typeChat === 2){
        InitDispoCita(false);
      }else{
        if(typeChat === 0){
          msg = GetMsgInitInfo("");
        }
        if(typeChat === 1){
          msg = GetMsgInitBudget("");
        }
        loadMessage(curAI(""),msg,"");
      }
      
    }, 1000);
    
  };

  const InitDispoCita = (citaDisplayed) => {
    let msg = GetMsgInitCita("");
     
      setDisplayBudget(
          {
            display: import.meta.env.VITE_OPT_BUDGET === "1" ? "block" : "none"
          }
      );
      
      setDisplayInfo(
        {
          display: "block"
        }
      );
      setDisplayCita(
        {
          display: citaDisplayed ? "block" : "none"
        }
      );
      if(curCita1.contact !== ""){
        return;
      }
      console.log("serv nb : " + services.length);
      loadMessage(curAI(selLang),msg,"");
      loadServices([[]],"");
  };

  const loadServices = (data, lang) => {
    const array = [[]];
    let c=0;
    let line=-1;
    console.log("lentgh services - " + services.length);
    console.log("lentgh data : " + data[0].length);
    let tmpArr = data[0].length === 0 ? services : data;
    tmpArr.forEach(item => {
      if (c % 4 === 0) {
        array.push([]);
        line++;           
      }
      array[line].push(item.id + "-" + item[lang === "" ? selLang : lang]);
      c++;
    });    
    setLinesDay(array);
  };

  const handleUsr = (e) => {
    setUsrValue(e.target.value);
  };

  // Define the mutation for inserting a cita
  const INSERT_CITA_MUTATION = `
    mutation InsertCita($id_client: Int!, $id_service: Int!, $name: String!, $date: timestamp!) {
      insert_CITA(objects: {id_client : $id_client,id_service : $id_service,name: $name,start_date: $date}) {
        returning {
          id
          id_service
          name
          start_date
        }
      }
    }
    `;
 
  const handleInsertCita = async () => {
    const variables = {
      id_client: Number(import.meta.env.VITE_ID_CLIENT),
      id_service: curCita1.idService,
      name: curCita1.nombre,
      date: curCita1.dateCita
    };
    const response = await client.request(INSERT_CITA_MUTATION, variables);
    
    if (response.insert_CITA.returning.length > 0) {
      setCurCita1(prevState => ({
        ...prevState,  // Keep existing properties
        idService:response.insert_CITA.returning[0].id,        
        stepCita: 0
      }));
      console.log('Cita inserted successfully.');
    } else {
      console.log('Failed to insert cita.');
    }
    
  };

  const handleChangeLang = (lang) => {
    
    setSelLang(lang);
    //localStorage.clear();
    setMessages([]);
    if(curCateg !== 2){
      if(curCateg === 1)
        loadMessage(curAI(lang),GetMsgInitBudget(lang),lang);
      if(curCateg === 0)
        loadMessage(curAI(lang),GetMsgInitInfo(lang),lang);
      return;
    }
    console.log("stepCita : " + curCita1.stepCita);
    let msg = lang === 'es' ? '¿ Para qué tipo de servicio desea solicitar una cita ?' : (lang === 'en' ? 'What type of service would you like to schedule an appointment for ?' : "Pour quel type de service souhaitez-vous prendre rendez-vous ?");
     
      switch (curCita1.stepCita) {
        case 0:          
          loadServices([[]], lang);   
          
          if(curCita1.labelService.length > 0)      
            initSetCita(curCita1.labelService[lang], -1, lang);
          break;
        case 1:
          console.log("changeLang : " + curCita1.dateCita);
          const msg2 = initSetCita(curCita1.dateCita, 0, lang);
          console.log("GGGGG" + msg2);
          loadMessage(curAI(lang),msg2,lang);
          return;
          break;
        case 2:
          let msg3 = initSetCita(curCita1.nombre, 1, lang);
          
          loadMessage(curAI(lang),msg3,lang);
          return;          
          break;
        default:
          // Code to execute if none of the cases match
      }
    //curCita1.stepCita--;
    loadMessage(curAI(lang),msg,"");
    
  };

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
    setMessageSender(curMe);
  };

  const GetUTCDate = (date) =>{
    const utcDate = date;
    utcDate.setUTCHours(utcDate.getUTCHours() - 1); // Subtract 1 hour in UTC
    return utcDate;
  };

  /*const generateICSFile = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Company//NONSGML Event//EN
BEGIN:VEVENT
UID:12345
DTSTAMP:20250226T090000Z
DTSTART:20250301T100000Z
DTEND:20250301T110000Z
SUMMARY:Meeting with Client
DESCRIPTION:Discuss project details
LOCATION:Online
END:VEVENT
END:VCALENDAR`;

    // Convert to Base64
    return btoa(new TextEncoder().encode(icsContent).reduce((data, byte) => data + String.fromCharCode(byte), ""));
  };*/

  const generateICSFile = (txtMail) => {
    let curDate = new Date(curCita1.dateCita);
    curDate = new Date(curDate.getTime() - 60 * 60 * 1000); // - 1 hour
    let dateEnd = new Date(curDate.getTime() + 30 * 60 * 1000);
    const icsContent = 
    `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourCompany//YourProduct//EN
BEGIN:VEVENT
UID:${Date.now()}@yourdomain.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"}
DTSTART:${curDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"}
DTEND:${dateEnd.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"}
SUMMARY:${curCita1.labelService}
DESCRIPTION:${GetMsgContactCita() + "https://wa.me/" + import.meta.env.VITE_WHATSAPP + "?text=" + txtMail}
LOCATION:${import.meta.env.VITE_GOOGLEMAPS}
END:VEVENT
END:VCALENDAR`;
  
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });

    // Save file locally
    saveAs(blob, selLang === "es" ? "cita.ics" : "event.ics"); // Triggers download
    // Generate a temporary URL for the file
    //const fileUrl = URL.createObjectURL(blob);

    //return "http://localhost:5173/event.ics"; // Return the URL to use in the email
  };

  const COMMENT_SUBSCRIPTION = `
    subscription CommentSubscription($id_client: Int!, $pseudo: String!) {
      COMMENT(
        where: { 
          id_client: { _eq: $id_client }, 
          pseudo: { _eq: $pseudo }
        } 
        order_by: { created: desc } 
        limit: 1
      ) {
        id
        pseudo
        question
        response
        created
        viewed
        isai
      }
    }
    `;

  const [isFormSendOpen, setIsFormSendOpen] = useState(true);
  return (
    <div className="app-container"> 
      <div id="popup" className='popup'>  
      <a href="#" class="close" onClick={() => setIsFormSendOpen(true)}>&times;</a>    
      <Swiper
                  slidesPerView={1}
                  spaceBetween={30}
                  keyboard={{
                    enabled: true,
                  }}
                  pagination={{
                    clickable: true,
                  }}
                  navigation={true}
                  modules={[Keyboard, Pagination, Navigation]}
                  className="mySwiper"
                > 
      <SwiperSlide>
      <img src="https://www.dropbox.com/scl/fi/99txh27z4jk70pue85rmb/ed0.JPG?rlkey=jgtbu2w4b8yj5h1q50tf0zbbm&st=wgj33nd1&dl=1" alt="My Image"/> 
                   
                  </SwiperSlide>
                  <SwiperSlide>
                  <img src="https://www.dropbox.com/scl/fi/tgs1kree3eyy3gulvbs2w/ed1.JPG?rlkey=ltc68nbcxz5rg7anw75cdt9wm&st=fcd8l4dt&dl=1" alt="My Image"/>
                  </SwiperSlide>
                  <SwiperSlide>Slide 3</SwiperSlide>
                  <SwiperSlide>Slide 4</SwiperSlide>
                  <SwiperSlide>Slide 5</SwiperSlide>
                  <SwiperSlide>Slide 6</SwiperSlide>
                  <SwiperSlide>Slide 7</SwiperSlide>
                  <SwiperSlide>Slide 8</SwiperSlide>
                  <SwiperSlide>Slide 9</SwiperSlide>
                </Swiper>  
                </div>
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
        <div className="chat-header typing-indicator" style={{ display: displayHeader }}>
          <h2 className="chat-header">{messageSender} chatting</h2>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <div ref={lstMsgRef} className="chat-messages">
            <div > 
              <div className="message blue-bg" style={{display : curCita1.contact === "" ? "none" : "block"}}>
              <b>{GetMsgResumeCita('')}</b><br/><br/>
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
  
};


export default ClientView;

