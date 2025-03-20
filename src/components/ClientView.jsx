import React, { useState, useEffect, useRef } from 'react';
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
import Backendless from 'backendless';

Backendless.initApp(import.meta.env.VITE_BACKENDLESS_APPID, import.meta.env.VITE_BACKENDLESS_REST);

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

const ClientView = () => {
  const start_slot_am = import.meta.env.VITE_START_SLOT_AM;
  const end_slot_am = import.meta.env.VITE_END_SLOT_AM;
  const start_slot_pm = import.meta.env.VITE_START_SLOT_PM;
  const end_slot_pm = import.meta.env.VITE_END_SLOT_PM;
  const [userInteracted, setUserInteracted] = useState(false);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([[]]);
  const [selectedProducts, setSelectedProducts] = useState('');
  const [hasPromoProd, setHasPromoProd] =  useState(import.meta.env.VITE_OPT_PRODUCT === '1');
  const [csvProducts, setCsvProducts] = useState('');
  const [curPseudo, setCurPseudo] = useState(() => localStorage.getItem('curPseudo') || '');
  const [curIdClient, setCurIdClient] = useState(Number(import.meta.env.VITE_ID_CLIENT));
  const [enableNotif, setEnableNotif] = useState(import.meta.env.VITE_ENABLE_NOTIF === '1');
  const [curCateg, setCurCateg] = useState(() => localStorage.getItem('curCateg') || 0);
  const [messages, setMessages] = useState([]);
  //useState(() => JSON.parse(localStorage.getItem('messages')) || []);
  const [linesDay, setLinesDay] = useState([[]]);
  const [usrValue, setUsrValue] = useState(import.meta.env.VITE_HUGGING_KEY);
  const [chatInput, setChatInput] = useState('');
  const [displayWaiting, setDisplayWaiting] = useState('none');
  const [copied, setCopied] = useState(-1);
  const [selLang, setSelLang] = useState(import.meta.env.VITE_LANG);
  const GetMsgResumeCita = (lang) => {
    if(lang === "")
      return selLang === 'de' ? 'Zusammenfassung meines Termins' : (selLang === 'es' ? 'Resumen de mi cita' : (selLang === 'en' ? 'Summary of my appointment' : "Résumé de mon rendez-vous"));
    else
      return lang === 'de' ? 'Zusammenfassung meines Termins' : (lang === 'es' ? 'Resumen de mi cita' : (lang === 'en' ? 'Summary of my appointment' : "Résumé de mon rendez-vous"));
};

const GetMsgDateHourCita = (lang) => {
    if(lang === "")
      return selLang === 'de' ? 'Datum und Uhrzeit meines Termins : ' : (selLang === 'es' ? 'Fecha y hora de mi cita : ' : (selLang === 'en' ? 'Date and time of my appointment : ' : "Date et heure de mon rendez-vous : "));
    else
      return lang === 'de' ? 'Datum und Uhrzeit meines Termins : ' : (lang === 'es' ? 'Fecha y hora de mi cita : ' : (lang === 'en' ? 'Date and time of my appointment : ' : "Date et heure de mon rendez-vous : "));
};

const GetMsgTypeCita = (lang) => {
    if(lang === "")
      return selLang === 'de' ? 'Art der Dienstleistung : ' : (selLang === 'es' ? 'Tipo de servicio : ' : (selLang === 'en' ? 'Type of service : ' : "Type de service : "));
    else
      return lang === 'de' ? 'Art der Dienstleistung : ' : (lang === 'es' ? 'Tipo de servicio : ' : (lang === 'en' ? 'Type of service : ' : "Type de service : "));
};

const GetMsgContactCita = (lang) => {
    if(lang === "")
      return selLang === 'de' ? 'WhatsApp des Verantwortlichen : ' : (selLang === 'en' ? 'WhatsApp of the manager : ' : "WhatsApp de la responsable : ");
    else
      return lang === 'de' ? 'WhatsApp des Verantwortlichen : ' : (lang === 'en' ? 'WhatsApp of the manager : ' : "WhatsApp de la responsable : ");
};

const GetMsgUpdateCita = (lang) => {
    if(lang === "")
      return selLang === 'de' ? "Um Ihren Termin zu stornieren, klicken Sie auf die Schaltfläche 'Abbrechen' unten links auf der Seite. Für Änderungen kontaktieren Sie bitte den Verantwortlichen über WhatsApp." 
            : (selLang === 'es' ? "Para cancelar su cita, haga clic en el botón 'Cancelar' en la parte inferior izquierda de la página. Para cualquier modificación, por favor contacte a la responsable a través de WhatsApp." 
            : (selLang === 'en' ? "To cancel your appointment, click on the 'Cancel' button at the bottom left of the page. For any changes, please contact the manager via WhatsApp." 
            : "Pour annuler votre rendez-vous, cliquez sur le bouton 'Annuler' en bas à gauche de la page. Pour toute modification, veuillez contacter la responsable via WhatsApp."));
    else
      return lang === 'de' ? "Um Ihren Termin zu stornieren, klicken Sie auf die Schaltfläche 'Abbrechen' unten links auf der Seite. Für Änderungen kontaktieren Sie bitte den Verantwortlichen über WhatsApp." 
            : (lang === 'es' ? "Para cancelar su cita, haga clic en el botón 'Cancelar' en la parte inferior izquierda de la página. Para cualquier modificación, por favor contacte a la responsable a través de WhatsApp." 
            : (lang === 'en' ? "To cancel your appointment, click on the 'Cancel' button at the bottom left of the page. For any changes, please contact the manager via WhatsApp." 
            : "Pour annuler votre rendez-vous, cliquez sur le bouton 'Annuler' en bas à gauche de la page. Pour toute modification, veuillez contacter la responsable via WhatsApp."));
};

const GetMsgInitCita = (lang) => {
    if(lang === "")
      return selLang === 'de' ? 'Für welche Art von Service möchten Sie einen Termin vereinbaren ?' : (selLang === 'es' ? '¿ Para qué tipo de servicio le gustaría solicitar una cita ?' : (selLang === 'en' ? 'What type of service would you like to schedule an appointment for ?' : "Pour quel type de service souhaitez-vous prendre rendez-vous ?"));
    else
      return lang === 'de' ? 'Für welche Art von Service möchten Sie einen Termin vereinbaren ?' : (lang === 'es' ? '¿ Para qué tipo de servicio le gustaría solicitar una cita ?' : (lang === 'en' ? 'What type of service would you like to schedule an appointment for ?' : "Pour quel type de service souhaitez-vous prendre rendez-vous ?"));
};

const GetMsgInitInfo = (lang) => {
    if(lang === "")
      return selLang === 'de' ? import.meta.env.VITE_MSG_INFO_DE : (selLang === 'es' ? import.meta.env.VITE_MSG_INFO_ES : (selLang === 'en' ? import.meta.env.VITE_MSG_INFO_EN : import.meta.env.VITE_MSG_INFO_FR));
    else
      return lang === 'de' ? import.meta.env.VITE_MSG_INFO_DE : (lang === 'es' ? import.meta.env.VITE_MSG_INFO_ES : (lang === 'en' ? import.meta.env.VITE_MSG_INFO_EN : import.meta.env.VITE_MSG_INFO_FR));
};

const GetMsgInitQuote = (lang) => {
    if(lang === "")
      return selLang === 'de' ? import.meta.env.VITE_MSG_QUOTE_DE : (selLang === 'es' ? import.meta.env.VITE_MSG_QUOTE_ES : (selLang === 'en' ? import.meta.env.VITE_MSG_QUOTE_EN : import.meta.env.VITE_MSG_QUOTE_FR));
    else
      return lang === 'de' ? import.meta.env.VITE_MSG_QUOTE_DE : (lang === 'es' ? import.meta.env.VITE_MSG_QUOTE_ES : (lang === 'en' ? import.meta.env.VITE_MSG_QUOTE_EN : import.meta.env.VITE_MSG_QUOTE_FR));
};

  
  const copyToClipboard = (e, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(e.target.id);
      console.log("clip = " + e.target.id);
      setTimeout(() => setCopied(-1), 1500);
    }).catch(err => console.error("Failed to copy:", err));
  };

  const sendCita = async (emailClient,emailAdmin,subject,msg,lbl_headerCita,lbl_datehour,val_datehour,lbl_service,val_service,
    lbl_name,val_name,lbl_wap, val_wap, isCancel
  ) => {
    let urlIcs = "";
    if(!isCancel){
      urlIcs = await generateICSFile(msg);
    }
    console.log('url ics : ' + urlIcs);
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
      reply_to: emailAdmin, // email admin
      urlIcs: !isCancel ? urlIcs.replace('https://backendlessappcontent.com/','') : ''
    };
   
    emailjs.send(
      import.meta.env.VITE_EMAIL_SERVICE_ID,         // Service ID (from EmailJS)
      import.meta.env.VITE_TEMPLATE_CITA,        // Template ID (from EmailJS)
      templateParams,
      import.meta.env.VITE_EMAIL_USER_ID             // Your user ID (from EmailJS)
    ).then((response) => {
      console.log('SUCCESS Mail !', response.status, response.text);
    }, (err) => {
      console.log('FAILED Mail ...', err);
    });
  };

  const sendComment = (emailAdmin,subject,headerQuestion,question,headerResponse) => {
    const templateParams = {
      subject: subject,
      emailAdmin: emailAdmin, // email admin
      headerQuestion: headerQuestion,
      question: question,
      headerResponse: headerResponse,
      url: window.location.href + '?a=1'
    };
   
    emailjs.send(
      import.meta.env.VITE_EMAIL_SERVICE_ID,         // Service ID (from EmailJS)
      import.meta.env.VITE_TEMPLATE_COMMENT,        // Template ID (from EmailJS)
      templateParams,
      import.meta.env.VITE_EMAIL_USER_ID             // Your user ID (from EmailJS)
    ).then((response) => {
      console.log('SUCCESS Mail !', response.status, response.text);
    }, (err) => {
      console.log('FAILED Mail ...', err);
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setCurIdClient(Number(import.meta.env.VITE_ID_CLIENT));
        const hasOptProd = import.meta.env.VITE_OPT_PRODUCT === "1";
        if (hasOptProd) {
          const QUERY_DESC_PRODUCTS = `
            query GetProducts($id_client: Int!) {
              PRODUCT(
                where: { id_client: { _eq: $id_client } }
              ) {
                id
                description                
              }
            }
          `;
  
          const result = await client.request(QUERY_DESC_PRODUCTS, {
            id_client: curIdClient,  
          });
  
          if (result?.PRODUCT?.length > 0) {
            let csv = Papa.unparse(result.PRODUCT, {
              header: false,
              newline: '\r\n'               
            });
            csv = csv.replace(/"/g, '');
            setCsvProducts(csv);            
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchProducts();
  }, [curIdClient]); // Removed csvProducts, added curIdClient
  

  const QUERY_SERVICE = `
    query GetSERVICE($cat: Int_comparison_exp!) {
      SERVICE(where: { cat: $cat }) {
        id
        en
        es
        fr
        de
        cat
      }
    }
  `;

  const fetchServices = async () => {
    try {
      const data = await client.request(QUERY_SERVICE, {
        cat: { _eq: 1 }  // Use comparison expression, here it's 'equal to 1'
      });
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
  
  const [displayQuote, setDisplayQuote] = useState(
    {
      display: (import.meta.env.VITE_OPT_QUOTE === "1" && curCateg !== 1 ? "block" : "none")
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
  const labelCopied = selLang === 'de' ? 'Kopiert !' : (selLang === 'es' ? 'Copiado !' : (selLang === 'en' ? 'Copied !' : 'Copié !'));
  const codeLang = (lang) => {
    if(lang == "")
      return selLang === 'de' ? 'de-DE' : (selLang === 'es' ? 'es-ES' : (selLang === 'en' ? 'en-US' : 'fr-FR'));
    else
      return lang === 'de' ? 'de-DE' : (lang === 'es' ? 'es-ES' : (lang === 'en' ? 'en-US' : 'fr-FR'));
  } 
  const curMe = (lang) => {
    if(lang == "")
      return selLang === 'de' ? 'Ich' : (selLang === 'es' ? 'Yo' : (selLang === 'en' ? 'Me' : 'Moi'));
    else
      return lang === 'de' ? 'Ich' : (lang === 'es' ? 'Yo' : (lang === 'en' ? 'Me' : 'Moi'));
  };

 
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
  const [isDisabled, setIsDisabled]  = useState(curCateg === 2 && curCita1.stepCita < 3 && curCita1.contact !== "");
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


  const [messageSender, setMessageSender] = useState(curMe(''));
  const curAI = (lang) => {
    if (lang === "") {
      return selLang === 'de' ? 'Virtueller Assistent' : (selLang === 'es' ? 'Asistente virtual' : (selLang === 'en' ? 'Virtual assistant' : 'Assistant virtuel'));
    } else {
      return lang === 'de' ? 'Virtueller Assistent' : (lang === 'es' ? 'Asistente virtual' : (lang === 'en' ? 'Virtual assistant' : 'Assistant virtuel'));
    }
};

const curServClient = (lang) => {
    if (lang === "") {
      return selLang === 'de' ? 'Kundendienst' : (selLang === 'es' ? 'Atención al Cliente' : (selLang === 'en' ? 'Customer Service' : 'Service Client'));
    } else {
      return lang === 'de' ? 'Kundendienst' : (lang === 'es' ? 'Atención al Cliente' : (lang === 'en' ? 'Customer Service' : 'Service Client'));
    }
};

      const curSend = selLang === 'de' ? 'Senden' : (selLang === 'es' ? 'Enviar' : (selLang === 'en' ? 'Send' : 'Envoyer'));
      const curClear = selLang === 'de' ? 'Löschen' : (selLang === 'es' ? 'Borrar' : (selLang === 'en' ? 'Clear' : 'Effacer'));
      const curCancel = selLang === 'de' ? 'Abbrechen' : (selLang === 'es' ? 'Cancelar' : (selLang === 'en' ? 'Cancel' : 'Annuler'));
      const curInfo = selLang === 'de' ? 'Information' : (selLang === 'es' ? 'Información' : 'Information');
      const curLabelCita = selLang === 'de' ? 'Termin' : (selLang === 'es' ? 'Cita' : (selLang === 'en' ? 'Appointment' : 'Rendez-vous'));
      const curBudget = selLang === 'de' ? 'Kostenvoranschlag' : (selLang === 'es' ? 'Presupuesto' : (selLang === 'en' ? 'Quote' : 'Devis'));
      const curTypeHere = selLang === 'de' ? 'Hier tippen' : (selLang === 'es' ? 'Escribe aquí' : (selLang === 'en' ? 'Type here' : 'Tapez ici'));

  //Examples of CSV
  const keyPaths = ""; //"/files/Mathematical database development_.pdf";

  async function callAPIAI(prefix, message, recommend) {
    try {
      const type_ai = import.meta.env.VITE_TYPE_AI;
      console.log("Type AI : " + type_ai);
      const prompt = prefix + (prefix === "" ? "" : `\nBased on the previous text and/or CSV report ( the column on the right is the price in ${import.meta.env.VITE_TYPE_CURRENCY} ), provide a natural and conversational response to the following question :  `
              ) + message + (recommend ? "No recomendar de ponerse en contacto con empresas de limpieza locales. La expresión 'Lo siento' no puede aparecer en la respuesta." : "")
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
          systemInstruction: import.meta.env.VITE_TYPE_COMPANY,
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
        procedureName = 'construction_en';        
        const QUERY_DEVIS = `
        query GetInfosDevis {
          ${procedureName}{
            title
            price
          }
        }
          `;
        const data = await client.request(QUERY_DEVIS);        
        console.log(data.construction_en.length + "-" + procedureName);
        if(data.construction_en.length <= 1){ 
          if(data.construction_en.length > 0)
            csv = data.construction_en[0].title;
          else
            csv = "";
        }else{
          csv = Papa.unparse(data.construction_en, {
            header: false,
            newline: '\r\n'            
          });          
        }
        csv = csv.replace(/"/g, '');
        const wap = import.meta.env.VITE_WHATSAPP;
        csv = await callAPIAI(csv + ".\nSi la información necesaria para proporcionar un presupuesto no es suficiente, dar el WhatsApp del jefe de la empresa : +" + wap + " (ultima frase de la respuesta).",message);
        console.log("Request only : \n" + csv);
        
        return csv;
      }else{
        if(curCateg === 0){
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
      const procedure = import.meta.env.VITE_CSV_TABLE + "_" + selLang;
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

  /*useEffect(() => {
    
    setMessages([]);
    loadMessage(curAI(""),GetMsgInitInfo(""),""); 
  }, [curCateg]);*/

  useEffect(() => {
    localStorage.setItem('curCateg', curCateg);
    if(curCita1.nombre !== ""){
      localStorage.setItem('curPseudo', curCita1.nombre);
    }else{
      localStorage.setItem('curPseudo', curPseudo);
    }
    setMessages([]);
    if(curCateg === 0){
      loadMessage(curAI(""),GetMsgInitInfo(""),"");
    }
    if(curCateg === 1){
      loadMessage(curAI(""),GetMsgInitQuote(""),"");
    }     
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

  const GetTextEmail = () => {
    let txtMail = GetMsgResumeCita('') + '\n' + GetMsgDateHourCita('') + '\n';
        let dathour = new Intl.DateTimeFormat(codeLang(''), { 
            weekday: 'short',
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'UTC' 
        }).format(new Date(curCita1.dateCita));
        txtMail += dathour + '\n';
        txtMail += GetMsgTypeCita('') + curCita1.labelService + '\n';
        txtMail += GetMsgContactCita('') + " +" + import.meta.env.VITE_WHATSAPP + "\n";
        
        let subject = selLang === 'de' ? "Neuer Termin" : (selLang === 'es' ? "Nueva cita" : (selLang === 'en' ? "New appointment" : "Nouveau rendez-vous"));
        let name = selLang === 'de' ? "Name : " : (selLang === 'es' ? "Nombre : " : (selLang === 'en' ? "Name : " : "Nom : "));

        console.log("Nom :" + curCita1.nombre);
        const encodedMessage = encodeURIComponent(txtMail);
        return { subject, name, dathour, encodedMessage };
  };

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
    
    const timestamp = new Date().toLocaleString(codeLang(''), {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour24: true,
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
      loadMessage(curMe(''),chatInput,selLang);
      let msg = selLang === 'de' 
    ? "Schließlich geben Sie bitte Ihre E-Mail-Adresse ein ( klicken Sie auf 'Senden', um sie zu speichern ), um den Termin zu bestätigen." 
    : (selLang === 'es' 
        ? "Finalmente, por favor, ingrese su correo electrónico ( haz clic en 'Enviar' para guardarlo) para confirmar la cita." 
        : (selLang === 'en' 
            ? "Finally, please enter your email ( click 'Send' to save it ) to confirm the appointment." 
            : "Enfin, veuillez, s'il vous plaît, saisir votre email ( cliquer sur 'Envoyer' pour l'enregistrer ) pour confirmer le rendez-vous."
        )
    );
      setChatInput(''); 
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
        /*let txtMail = GetMsgResumeCita('') + '\n' + GetMsgDateHourCita('') + '\n';
        let dathour = new Intl.DateTimeFormat(codeLang(''), { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'UTC' 
        }).format(new Date(curCita1.dateCita));
        txtMail += dathour + '\n';
        txtMail += GetMsgTypeCita('') + curCita1.labelService + '\n';
        txtMail += GetMsgContactCita('') + " +" + import.meta.env.VITE_WHATSAPP + "\n";
        
        let subject = selLang === 'de' ? "Neuer Termin" : (selLang === 'es' ? "Nueva cita" : (selLang === 'en' ? "New appointment" : "Nouveau rendez-vous"));
        let name = selLang === 'de' ? "Name : " : (selLang === 'es' ? "Nombre : " : (selLang === 'en' ? "Name : " : "Nom : "));

        console.log("Nom :" + curCita1.nombre);
        const encodedMessage = encodeURIComponent(txtMail);*/
        const { subject, name, dathour, encodedMessage } = GetTextEmail();
        handleInsertCita();
        if(enableNotif){
          sendCita(chatInput,import.meta.env.VITE_EMAIL,subject,encodedMessage,GetMsgResumeCita(''),GetMsgDateHourCita(''),dathour,
          GetMsgTypeCita(''),curCita1.labelService,name,curCita1.nombre,GetMsgContactCita(''),import.meta.env.VITE_WHATSAPP,false);
        }
        setChatInput('');
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
          $isai: Boolean,
          $categ: Int!
        ) {
          insert_COMMENT_one(
            object: { 
              id_client: $id_client, 
              pseudo: $pseudo, 
              question: $question, 
              response: $response, 
              viewed: false, 
              created: $created,
              isai: $isai,
              categ: $categ
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

      const INSERT_COMMENT_HISTORY = `
      mutation InsertHistory(
          $id_client: Int!, 
          $pseudo: String!, 
          $question: String!, 
          $response: String!,
          $created: timestamp,
          $isai: Boolean.
          $categ: Int!
        ) {
          insert_COMMENT_HISTORY_one(
            object: { 
              id_client: $id_client, 
              pseudo: $pseudo, 
              question: $question, 
              response: $response,
              created: $created,
              isai: $isai,
              categ: $categ
            }
          ) {
            id
            id_client
            pseudo
            question
            response
            created
          }
        }
       `;  

    if(curCateg === 0 || curCateg === 1){
      let tim = Date.now();
      
      let isai = true;
      if(curPseudo === ''){
        if(curCita1.nombre !== ""){
          localStorage.setItem('curPseudo', curCita1.nombre);
        }else{
          localStorage.setItem('curPseudo', tim.toString());
        }       
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
      
      let dateCreated = new Date(Date.now() + 60 * 60 * 1000);
      let chatResponse = "";
      if(isai){
      const QUERY_URL_PRODUCTS = `
      query GetProducts($id_client: Int!, $ids: [Int!]!) {
        PRODUCT(
          where: { 
            id_client: { _eq: $id_client }, 
            id: { _in: $ids } 
          }
        ) {
          description
          url
          linkAd
        }
      }
       `;
      let promptInfo = chatInput + '\n';
      
      if(curCateg === 0 && hasPromoProd){
        promptInfo += selLang === 'de' ? 
        `Geben Sie an, welches(n) Produkt(e) aus der folgenden CSV-Liste geeignet wären (geben Sie zusätzlich zur Antwort auf die vorherige Frage eine JSON-Zeichenkette zurück, die eine Liste von Identifikatoren enthält, zum Beispiel: '{ "Produkte": "1,2" }', ohne Leerzeichen im Array. Erwähnen Sie keine Ausdrücke in Klammern, wie '(Produkt 2)' oder '(Produkt 3)' oder '(2)' oder '(3)' ).` 
        : (selLang === 'es' ? 
        `Indique qué producto(s) de la siguiente lista CSV serían adecuados ( devuelve, además de la respuesta a la pregunta anterior, una cadena JSON que contenga una lista de identificadores, por ejemplo: '{ "Productos": "1,2" }' , sin espacios en el array. No mencione expresiones entre paréntesis, como '(Producto 2)' o '(Producto 3)' o '(2)' o '(3)' ).` 
        : (selLang === 'en' ?
        `Indicate which product(s) from the following CSV list would be suitable ( return, in addition to the answer to the previous question, a JSON string containing a list of identifiers, for example: '{ "Products": "1,2" }' , with no spaces in the array. Do not mention expressions in parentheses, such as '(Product 2)' or '(Product 3)' o '(2)' o '(3)' ).`
        : 
        ` Indiquez quel(s) produit(s) de la liste CSV suivante conviendraient ( retourner, en plus de la réponse à la précédente question, une chaîne JSON contenant une liste d'identifiants, par exemple : '{ "Produits": "1,2" }' , sans espaces dans le tableau. Ne pas mentionner les expressions entre parenthèses, telles que '(produit 2)' ou '(produit 3)' ou '(2)' ou '(3)' ).`));
        promptInfo += csvProducts;
      }
      console.log('promptInfo = ' + promptInfo);
      setDisplayWaiting('flex');
      chatResponse = await fetchChatAIResponse(promptInfo);
      console.log(selLang + ' = lang. response : ' + chatResponse);
      if(curCateg === 0 && hasPromoProd){
        let tabResp = chatResponse.split(selLang === 'de' ? '{ "Produkte": "' : (selLang === 'es' ? '{ "Productos": "' : (selLang === 'en' ? '{ "Products": "' : '{ "Produits": "')));
        if(tabResp.length > 1){
          chatResponse = tabResp[0];
          let str = tabResp[1].split('" }')[0].trim();
          if(str !== ""){
            const arr = str.split(",").map(item => parseInt(item, 10)); 
            console.log("Arr : " + arr);
            let result = await client.request(QUERY_URL_PRODUCTS, {
              id_client : curIdClient,  // Replace with the actual client ID
              ids : arr
            });
            const resultArray = result.PRODUCT.map(product => [product.description, product.url, product.linkAd]);
            setProducts(resultArray);
          }else{
            setProducts([[]]);
          } 
          setSelectedProducts(str);         
        }
        chatResponse = chatResponse.replace(/\*/g, '');
        if(chatResponse.includes(`Sans plus d'informations`) || chatResponse.includes('Once I have this information')){
          let tab = chatResponse.split(`Sans plus d'informations`);
          if(tab.length > 1){
            chatResponse = tab[0];
          }else{
            tab = chatResponse.split('Once I have this information');
            if(tab.length > 0){
              chatResponse = tab[0];
            }
          }
        }else{
          let tab = chatResponse.split(`Here's the JSON`);
          if(tab.length > 1){
            chatResponse = tab[0];
          }else{
            tab = chatResponse.split("json");
            if(tab.length > 0){
              console.log('tab0 = ' + tab[0].slice(0,tab[0].length-3));
              chatResponse = tab[0].slice(0,tab[0].length-3);
            }else{
              tab = chatResponse.split(`Based on this, here's the JSON`);
              if(tab.length > 0){
                chatResponse = tab[0];
              }
            }
          }
        }
      }else{
        chatResponse = chatResponse.replace(/\*/g, '');
        chatResponse = chatResponse.replace('de la lista CSV se describe', 'que tenemos está descrito');
      }
    }
      let result = await client.request(INSERT_COMMENT, {
        id_client : curIdClient,  // Replace with the actual client ID
        pseudo : curPseudo === '' ? tim.toString() : curPseudo,
        question : chatInput,
        response : isai ? chatResponse : '-',
        created : dateCreated,
        isai: isai,
        categ: curCateg
      }); 
      if(enableNotif){
        let subject = selLang === 'de' ? 'Empfang einer Informationsanforderung von einem Kunden.' : (selLang === 'es' ? "Recepción de una solicitud de información de un cliente." : (selLang === 'en' ? 'Receipt of an information request from a client.' : `Réception d'une demande d'information d'un client.`));
        let headQ = selLang === 'de' ? 'Hallo, ein Kunde hat Ihnen folgende Frage gestellt : ' : (selLang === 'es' ? "Hola, un cliente le ha hecho la siguiente pregunta : " : (selLang === 'en' ? "Hello, a client has asked you the following question : " : "Un client vous a posé la question suivante : "));
        let headR = selLang === 'de' ? "Sie können die Antwort von Ihrem virtuellen Assistenten im folgenden Administrator-Portal lesen : " : (selLang === 'es' ? "Usted puede leer la respuesta de su asistente virtual en el siguiente portal de administrador : " : (selLang === 'en' ? "You can read the response from your virtual assistant on the following administrator portal : " : "Vous pouvez lire la réponse de votre assistant virtuel sur le portail administrateur suivant : "));

        sendComment(import.meta.env.VITE_EMAIL,subject,headQ,chatInput,headR);
      }      
      console.log('Comment inserted successfully! ' + result);  // Log the result
      const historyEnabled = import.meta.env.VITE_COMMENT_HISTORY === "1";
      if(historyEnabled){
        let result = await client.request(INSERT_COMMENT_HISTORY, {
          id_client : curIdClient,  // Replace with the actual client ID
          pseudo : curPseudo === '' ? tim.toString() : curPseudo,
          question : chatInput,
          response : isai ? chatResponse : '-',
          created : dateCreated,
          isai: isai,
          categ: curCateg
        });
        console.log('Histo inserted successfully! ' + result);  // Log the result
      }
      if(isai)
        loadMessage(curAI(""),chatResponse,"");
      setDisplayWaiting('none');      
    }

    setChatInput(''); 
    
  };

  const handleClearChat = async () => {
    try {
      setCurCita1(prevState => ({
        ...prevState,  // Keep existing properties              
        stepCita: 0  // Update stepCita
      }));
      setIsDisabled(true); 
      setChatInput('');
      setMessages([]);
      setLinesDay([[]]);

      if(curCateg !== 2){
        
      const QUERY_DELETE_COMMENTS = `
       mutation DeleteCommentsByIdClientAndPseudo($id_client: Int!, $pseudo: String!) { 
        delete_COMMENT(
          where: { 
            id_client: { _eq: $id_client },
            pseudo: { _eq: $pseudo }
          }
        ) {
          affected_rows
        }
      }
      `;
      if(curPseudo !== ""){
        const vars = { id_client: Number(import.meta.env.VITE_ID_CLIENT), pseudo: curPseudo };
        const response = await client.request(QUERY_DELETE_COMMENTS, vars);
        if(curCateg === 0 || curCateg === 1){  
          localStorage.clear();        
          loadMessage(curAI(""),GetMsgInitInfo(""),"");
        }      
        if (response.delete_COMMENT.affected_rows > 0) {
          console.log('Comments deleted successfully. cli ' + Number(import.meta.env.VITE_ID_CLIENT) + ' , pseudo ' + curPseudo === '' ? tim.toString() : curPseudo);
        }
      }
      
    }else{
    
      const QUERY_DELETE_CITA = `
        mutation DeleteCitaById($id: Int!) {
          delete_CITA(where: { id: { _eq: $id } }) {
            affected_rows
          }
        }
      `;
      const variables = { id: curCita1.idService };
      const response = await client.request(QUERY_DELETE_CITA, variables);
      const { subject, name, dathour, encodedMessage } = GetTextEmail();
      const subject2 = selLang === 'de' ? "Termin vom Kunden abgesagt" : (selLang === 'es' ? "Cita cancelada por el cliente" : (selLang === 'en' ? "Appointment canceled by the client" : "Rendez-vous annulé par le client"));
      sendCita(curCita1.contact,import.meta.env.VITE_EMAIL,subject2,encodedMessage,GetMsgResumeCita(''),GetMsgDateHourCita(''),dathour,
          GetMsgTypeCita(''),curCita1.labelService,name,curCita1.nombre,GetMsgContactCita(''),import.meta.env.VITE_WHATSAPP,true);
      console.log("After delete cita : " + curCita1.dateCita instanceof Date);
      let tabCita = new Date(curCita1.dateCita).toISOString().split('T');
      if (response.delete_CITA.affected_rows > 0 && tabCita.length > 1) {
        console.log('Cita deleted successfully.');
        const INSERT_AVAILABILITY_MUTATION = `
          mutation insertAvailability(
            $slot: String!, 
            $id_client: Int!, 
            $cur_date: date!
          ) {
            insert_AVAILABILITY(objects: { slot: $slot, id_client: $id_client, cur_date: $cur_date }) {
              returning {
                id
                slot
                id_client
                cur_date
              }
            }
          }
        `;
        let variables = {
          slot: tabCita[1].slice(0,5),
          id_client: Number(import.meta.env.VITE_ID_CLIENT),
          cur_date: tabCita[0]
        };
        console.log(variables);
        const resp1 = await client.request(INSERT_AVAILABILITY_MUTATION, variables);
        const newDate = new Date(curCita1.dateCita); // Clone the date to avoid mutating the original date
        newDate.setMinutes(newDate.getMinutes() - 15);
        tabCita = newDate.toISOString().split('T');
        variables = {
          slot: tabCita[1].slice(0,5),
          id_client: Number(import.meta.env.VITE_ID_CLIENT),
          cur_date: tabCita[0]
        };
        const resp2 = await client.request(INSERT_AVAILABILITY_MUTATION, variables);
        const newDate2 = new Date(curCita1.dateCita);
        newDate2.setMinutes(newDate2.getMinutes() + 15);
        tabCita = newDate2.toISOString().split('T');
        variables = {
          slot: tabCita[1].slice(0,5),
          id_client: Number(import.meta.env.VITE_ID_CLIENT),
          cur_date: tabCita[0]
        };
        
        const resp3 = await client.request(INSERT_AVAILABILITY_MUTATION, variables);
        
      } else {
        console.log('No cita found with that ID.');
      }    
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
      localStorage.clear();
      InitDispoCita(import.meta.env.VITE_OPT_CITA === "1");
      const timer = setTimeout(() => {
        
      }, 1000);
      
    }
       
    setDisplayQuote(
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

    } catch (error) {
      console.error("Error fetching data:", error);
    }

  };

  const initSetCita = async (targetValue, step, lang) => {
    let msg = "";
    //localStorage.clear();
    setMessages([]); 
    
    const timestamp = new Date().toLocaleString(codeLang(lang), {
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
            msg = selLang === 'de' ? 'Sie können keinen weiteren Termin buchen, da Sie bereits zwei gebucht haben.' : (selLang === 'es' ? 'Usted no puede reservar otra cita porque ya ha reservado dos.' : (selLang === 'en' ? 'You cannot book another appointment because you have already booked two.' : "Vous ne pouvez pas prendre un autre rendez-vous, car vous en avez déjà pris deux.")); 
              const newMsg = {
                sender: curAI(""),
                text: msg,
                lines: [],
                whatsapp:"",
                lnkWhatsapp:"",
                timestamp,
              };
              setMessages((prevMessages) => [...prevMessages, newMsg]);
              setMessageSender(curMe(''));
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
          msg = (selLang === 'de' ? 'Welchen Tag möchten Sie einen Termin vereinbaren?' : (selLang === 'es' ? '¿ Qué día le gustaría programar una cita ?' : (selLang === 'en' ? 'Which day would you like to schedule an appointment ?' : "Quel jour souhaitez-vous prendre rendez-vous ?")));
          
        }else{
          filteredData = services.filter(item => item.id === curCita1.idService);
          setCurCita1(prevState => ({
            ...prevState,  // Keep existing properties
            labelService: filteredData[0][lang]            
          }));
          msg = (selLang === 'de' ? 'An welchem Tag möchten Sie einen Termin vereinbaren?' : (lang === 'es' ? '¿ Qué día le gustaría programar una cita ?' : (lang === 'en' ? 'Which day would you like to schedule an appointment ?' : "Quel jour souhaitez-vous prendre rendez-vous ?")));
          
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
        msg = selLang === 'de' ? 'Um wie viel Uhr?' : (selLang === 'es' ? '¿ A qué hora ?' : (selLang === 'en' ? 'At what time ?' : "À quelle heure ?"));        
      }else{
          msg = selLang === 'de' ? 'Um wie viel Uhr?' : (lang === 'es' ? '¿ A qué hora ?' : (lang === 'en' ? 'At what time ?' : "À quelle heure ?"));          
      }
    
          
        console.log(targetValue);
        const datTarget = new Date(targetValue);
        setCurCita1(prevState => ({
          ...prevState,  // Keep existing properties
          dateCita: datTarget,
          stepCita: prevState.stepCita + 1  // Update stepCita
        }));
        
        console.log("Before generate buts : " + targetValue);
        let arr = await generateTimeSlotButtons(targetValue);
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
          msg = selLang === 'de' ? "Um den Termin zu bestätigen, müssen Sie Ihren Vornamen und Ihre E-Mail-Adresse registrieren. Geben Sie zuerst Ihren Vornamen ein und klicken Sie dann auf 'Senden', um ihn zu speichern." : 
          (selLang === 'es' ? "Para confirmar la cita, usted debe registrar su nombre y su dirección de correo electrónico. Primero, introduzca su nombre y luego haga clic en 'Enviar' para guardarlo." : 
          (selLang === 'en' ? "To confirm the appointment, you must register your first name and your email address. First, enter your first name, then click 'Send' to save it." : 
          "Pour confirmer le rendez-vous, vous devez enregistrer votre prénom ainsi que votre adresse e-mail. Veuillez d'abord saisir votre prénom, puis cliquez sur 'Envoyer' pour l'enregistrer."));
        } else {
            msg = lang === 'de' ? "Um den Termin zu bestätigen, müssen Sie Ihren Vornamen und Ihre E-Mail-Adresse registrieren. Geben Sie zuerst Ihren Vornamen ein und klicken Sie dann auf 'Senden', um ihn zu speichern." : 
            (lang === 'es' ? "Para confirmar la cita, usted debe registrar su nombre y su dirección de correo electrónico. Primero, introduzca su nombre y luego haga clic en 'Enviar' para guardarlo." : 
            (lang === 'en' ? "To confirm the appointment, you must register your first name and your email address. First, enter your first name, then click 'Send' to save it." : 
            "Pour confirmer le rendez-vous, vous devez enregistrer votre prénom ainsi que votre adresse e-mail. Veuillez d'abord saisir votre prénom, puis cliquez sur 'Envoyer' pour l'enregistrer."));
            
        }
        //loadMessage(curAI(""), msg, "");
               
        setLinesDay([[]]);
        
        break;
      case 3:
        break;
      default:
        // Code to execute if none of the cases match
    }
    return msg;
    
  }

  const generateTimeSlotButtons = async (cur_date) => {
    try {
      const GET_AVAILABILITY = `
        query CheckAvailability {
          AVAILABILITY(
           where: { cur_date: { _eq: "${cur_date}" }, id_client: { _eq: ${Number(import.meta.env.VITE_ID_CLIENT)} } }
           order_by: { slot: asc }
           ) {
            slot
          }
        }
      `;
  
      let data = await client.request(GET_AVAILABILITY);
      
      // Extract slot values from response
      let slots = data.AVAILABILITY.map((entry) => entry.slot); 
      
      // Group into arrays of 4
      let groupedSlots = [];
      for (let i = 0; i < slots.length; i += 4) {
        groupedSlots.push(slots.slice(i, i + 4));
      }
      
      return groupedSlots;
    } catch (error) {
      console.error("Error fetching data:", error);
      return []; // Ensure function always returns an array
    }
  };
  

  const generateHourSlots = (startHour, endHour, intervalMinutes) => {
    let slots = [];
    let currentTime = new Date();
    currentTime.setHours(startHour, 0, 0, 0); // Set to startHour:00
  
    while (currentTime.getHours() < endHour) {
      let startTime = currentTime.toTimeString().slice(0, 5); // "HH:MM"
      currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
      //let endTime = currentTime.toTimeString().slice(0, 5);
      slots.push(`${startTime}`);
      //slots.push(`${endTime}`);
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
        //setCurIdClient()
        const id_client = Number(import.meta.env.VITE_ID_CLIENT);
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
            error: (err) => console.error('Subscription error : CITA_SUBSCRIPTION ', err),
            complete: () => console.log('Subscription complete CITA_SUBSCRIPTION '),
          }
        );
      
        return () => unsubscribe(); // Unsubscribe on unmount
      }, [wsClient, CITA_SUBSCRIPTION, curIdClient]); // Include id_client in dependencies

  const manageCita = async (e) => {
    try{
    e.preventDefault();
    console.log(e.target.value + ' manageCita : ' + curCita1.stepCita);
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (regex.test(e.target.value)){
      let cur_date = new Date(e.target.value);
      const CHECK_AVAILABILITY = `
        query CheckAvailability($cur_date: date!, $id_client: Int!) {
          AVAILABILITY(where: { cur_date: { _eq: $cur_date }, id_client: { _eq: $id_client } }) {
            id
          }
        }
      `;
      const data = await client.request(CHECK_AVAILABILITY, { cur_date : new Date(e.target.value), id_client : curIdClient });
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
        console.log('Generated AM Time Slots:' + start_slot_am + " to " + end_slot_am);
        let timeSlots = generateHourSlots(Number(start_slot_am.slice(0, 2)), Number(end_slot_am.slice(0, 2)), 15); // 15-minute slots from 09:00 to 14:00
        let id_client = curIdClient;
        
        let objects = timeSlots.map(slot => ({
          cur_date,  // Ensure cur_date is available
          id_client, // Ensure id_client is available
          slot // Each individual string from the slotArray
        }));

        timeSlots = generateHourSlots(Number(start_slot_pm.slice(0, 2)), Number(end_slot_pm.slice(0, 2)), 15); // 15-minute slots from 17:00 to 20:00
      
        const newSlots = timeSlots.map(slot => ({
          cur_date,
          id_client,
          slot
        }));
        
        objects.push(...newSlots);
      
        const response2 = await client.request(INSERT_AVAILABILITY, { objects });

        console.log("Availability slots inserted successfully:", timeSlots);
      }
    }
    console.log("manageCita" + curCita1.labelService);
    setMessages([]);
    let msg = initSetCita(e.target.value, -1, selLang);
    console.log(e.target.value + "-" + msg);
    
    loadMessage(curAI(""),msg,"");
    } catch (error) {
      console.error("Error fetching data:", error);
    }   
  };

  const handleChat = (typeChat) => {
    setIsDisabled(typeChat === 2);
    setCurCateg(typeChat);
    setLinesDay([[]]);
    //localStorage.clear();
    
    let wap = "";
    let lnkWAP = "";
    
    const timestamp = new Date().toLocaleString(codeLang(''), {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour24: true,
    });
    
    if(typeChat === 1){
      
      
      
      if(import.meta.env.VITE_OPT_QUOTE === "1"){
        setDisplayQuote(
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
      
      
      if(import.meta.env.VITE_OPT_QUOTE === "1"){
        setDisplayQuote(
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
    
    let msg = "";
      setMessages([]);
      if(typeChat === 2){
        InitDispoCita(false);
      }else{
        if(typeChat === 0){
          msg = GetMsgInitInfo("");
        }
        if(typeChat === 1){
          msg = GetMsgInitQuote("");
        }
        loadMessage(curAI(""),msg,"");
      }
    const timer = setTimeout(() => {
      
      
    }, 1000);
    
  };

  const InitDispoCita = (citaDisplayed) => {
    let msg = GetMsgInitCita("");
     
      setDisplayQuote(
          {
            display: import.meta.env.VITE_OPT_QUOTE === "1" ? "block" : "none"
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

  const QUERY_DELETE_OLDCITAS = `
    mutation deleteOldCitas {
      delete_CITA(where: {start_date: {_lt: "${new Date().toISOString().split('T')[0]}T00:00:00"}}) {
        affected_rows
      }
    }
  `;
  const QUERY_DELETE_OLDAVAILABILITIES = `
    mutation deleteAvailabilities($dateCita: date!, $slotBefore: String!, $slotExact: String!, $slotAfter: String!) {
      delete_AVAILABILITY(
        where: {
          _or: [
            { cur_date: { _lt: "${new Date().toISOString().split('T')[0]}" } }
            { cur_date: { _eq: $dateCita }, slot: { _in: [$slotBefore, $slotExact, $slotAfter] } }
          ]
        }
      ) {
        affected_rows
      }
    }

  `;

  function getSlotsBeforeAfter(time) {
    const [hours, minutes] = time.split(":").map(Number);
    
    const formatTime = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  
    const before = formatTime(hours, minutes - 15);
    const after = formatTime(hours, minutes + 15);
  
    return { slotBefore: before, slotExact: time, slotAfter: after };
  }
 
  const handleInsertCita = async () => {
    try {
      const variables = {
        id_client: curIdClient,
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
        console.log('QUERY_DELETE_OLDCITAS : ' + QUERY_DELETE_OLDCITAS);
        const resp2 = await client.request(QUERY_DELETE_OLDCITAS);
        if(resp2.delete_CITA.affected_rows > 0){
          console.log('Old Citas removed successfully.' + resp2.affected_rows);
        }
        console.log('QUERY_DELETE_OLDAVAILABILITIES : ' + QUERY_DELETE_OLDAVAILABILITIES);
        if(curCita1.dateCita.toISOString().includes('T')){
          let tabCita = curCita1.dateCita.toISOString().split('T');
          if(tabCita.length > 1){            
            const { slotBefore, slotAfter, slotExact } = getSlotsBeforeAfter(tabCita[1]);
            const variables = { dateCita: new Date(tabCita[0]), slotBefore: slotBefore.slice(0,5), slotExact: slotExact.slice(0,5), slotAfter: slotAfter.slice(0,5) };
            const resp3 = await client.request(QUERY_DELETE_OLDAVAILABILITIES, variables);
            if(resp3.delete_AVAILABILITY.affected_rows > 0){
              console.log('Old Availabilities removed successfully.');
            }; 
           
          }         
          
        }
             
      } else {
        console.log('Failed to insert cita.');
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }    
    
  };

  const handleChangeLang = (lang) => {
    
    setSelLang(lang);
    //localStorage.clear();
    setMessages([]);
    if(curCateg !== 2){
      if(curCateg === 1)
        loadMessage(curAI(lang),GetMsgInitQuote(lang),lang);
      if(curCateg === 0)
        loadMessage(curAI(lang),GetMsgInitInfo(lang),lang);
      return;
    }
    console.log("stepCita : " + curCita1.stepCita);
    let msg = lang === 'de' ? 'Für welchen Service möchten Sie einen Termin vereinbaren ?' : (lang === 'es' ? '¿ Para qué tipo de servicio le gustaría solicitar una cita ?' : (lang === 'en' ? 'What type of service would you like to schedule an appointment for ?' : "Pour quel type de service souhaitez-vous prendre rendez-vous ?"));

     
      switch (curCita1.stepCita) {
        case 0:          
          loadServices([[]], lang);   
          
          if(curCita1.labelService.length > 0)      
            initSetCita(curCita1.labelService[lang], -1, lang);
          break;
        case 1:
          const msg2 = initSetCita(curCita1.dateCita, 0, lang);
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
    
    const timestamp = new Date().toLocaleString(codeLang(lang), {
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
    setMessageSender(curMe(lang === "" ? selLang : lang));
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

  const generateICSFile = async (txtMail) => {
    try{
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
    const filePath = `/ICS/${curCita1.labelService}_${new Date().toISOString()}.ics`; // Folder in Backendless
    const response = await Backendless.Files.upload(blob, filePath, true);
    // Save file locally
    saveAs(blob, selLang === 'de' ? 'ereignis.ics' : (selLang === "es" ? "cita.ics" : "event.ics")); // Triggers download
    
    return response.fileURL;

    } catch (error) {
      console.error("File upload failed:", error);
    }
  };

  const COMMENT_SUBSCRIPTION = `
    subscription CommentSubscription($id_client: Int!, $pseudo: String!) {
      COMMENT(
        where: { 
          id_client: { _eq: $id_client }, 
          pseudo: { _eq: $pseudo },
          isai: { _eq: false },
          response: { _neq: "-" }
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

  useEffect(() => {
    //setIsFormSendOpen(false);
    let tim = Date.now();
      
      let isai = true;
      if(curPseudo === ''){
        if(curCita1.nombre !== ""){
          localStorage.setItem('curPseudo', curCita1.nombre);
        }else{
          localStorage.setItem('curPseudo', tim.toString());
        } 
        console.log("pseudo set in COMMENT_SUBSCRIPTION, Client View");
      }

        const unsubscribe = wsClient.subscribe(
          {
            query: COMMENT_SUBSCRIPTION,  // Pass the subscription directly (no need for print if it's an AST)
            variables: { id_client : curIdClient, pseudo : curPseudo },     // Pass id_client as a variable
          },
          {
            next: async (data) => {
              if(messages.length > 1){
                console.log('l pile = ' + messages.length);
                console.log('Msg pile = ', messages[messages.length-2].text);
                console.log('Msg resp = ', messages[messages.length-1].text);
              }              
              if (data.data && data.data.COMMENT.length > 0) {
                if(messages.length > 1 && messages[messages.length-2].text !== messages[messages.length-1].text){
                  loadMessage(curServClient(""),data.data.COMMENT[0].response,"");
                  console.log('Admin, New comment added from client :', data.data.COMMENT[0]); 
                }else{
                  loadMessage(curAI(""),data.data.COMMENT[0].response,"");
                  console.log('AI, New comment added from client :', data.data.COMMENT[0]);  
                }
                                       
              }
            },
            error: (err) => console.error('Subscription error COMMENT_SUBSCRIPTION :', err),
            complete: () => console.log('Subscription complete COMMENT_SUBSCRIPTION'),
          }
        );
      
        return () => unsubscribe(); // Unsubscribe on unmount
      }, [wsClient, COMMENT_SUBSCRIPTION, curIdClient, curPseudo]); // Include id_client in dependencies

  const [isFormSendOpen, setIsFormSendOpen] = useState(true);

  useEffect(() => {
    setHasPromoProd(import.meta.env.VITE_OPT_PRODUCT === '1');
  }, [messages]);

  const GetLinkURL = (prod) => {    
    if(prod[2] === '-'){
      return "https://wa.me/" + import.meta.env.VITE_WHATSAPP + "?text=" + (selLang === 'de' ? 'Hallo, ich möchte den folgenden Artikel bestellen: ' : (selLang === 'es' ? 'Hola, quiero pedir el siguiente articulo : ' : (selLang === 'en' ? 'Hello, I would like to order the following item : ' : `Bonjour, je souhaite commander l'article suivant : `))) + prod[0];
    }else{
      return prod[2];
    }
  };

  const GetLabelProd = (prod) => {
    if(prod[2] === '-'){
      return selLang === 'de' ? 'BITTEN' : (selLang === 'es' ? 'PEDIR' : (selLang === 'en' ? 'ORDER' : 'COMMANDER'));
    }else{
      return selLang === 'de' ? 'SIE DIE ANKÜNDIGUNG' : (selLang === 'es' ? 'VER EL ANUNCIO' : (selLang === 'en' ? 'SEE THE AD' : `VOIR L'ANNONCE`));
    }
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobileDevice = () => {
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobileDevice(); // Check on initial render

  }, []);

  const handleClickItem = (event) => {
    event.preventDefault(); // Optional, to prevent default behavior
    console.log('clickItem');
  };

  return (
    <div className="app-container"> 
      <div id="popup" className='popup' style={{display : isFormSendOpen ? "none" : "block"}}>  
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
                {products.map((prod, index) => ( 
                  <SwiperSlide><img src={prod[1]} alt={prod[0]}/><div style={{display:"flex",flex:"1",marginLeft:"5em",color: "#062a4e"}}>{prod[0]}</div><div style={{display:"flex",flex:"4",float:"right",marginRight:"5em",color: "#062a4e"}}><a href={GetLinkURL(prod)} onClick={handleClickItem}>{GetLabelProd(prod)}</a></div></SwiperSlide>
                ))}  
                </Swiper>
                </div>
      <div class="header-container">
          <div class="header-left">
              <img style={{maxHeight: import.meta.env.VITE_MAX_HEIGHT_LOGO}} src={import.meta.env.VITE_LOGO_URL} alt="Logo"/>
          </div>
          <div class="header-right">
          <div class="header-top">
          {isFormSendOpen && !isMobile && (<h4 style={{marginBottom:"2em"}}>{import.meta.env.VITE_COMPANY_NAME}</h4>)}
          {isFormSendOpen && isMobile && (<div style={{position: "fixed", top: "5", right: "0", marginRight: "5em"}}>{import.meta.env.VITE_COMPANY_NAME}</div>)}
          </div>
              <div class="header-bottom" style={{ display: 'flex', marginBottom:"15em" }}>
                <div style={{ width: '45%' }}>
                  <a href={import.meta.env.VITE_GOOGLEMAPS} target="_blank">
                  {import.meta.env.VITE_ADDRESS}
                  </a>
                </div>
                <div style={{ width: '55%',textAlign: "left" }}>
                  {selLang === 'de' ? 'Kontakt :' : (selLang === 'es' ? 'Contacto :' : 'Contact :')} digital365staking@gmail.com
                  <br/> 
                  <a href={import.meta.env.VITE_GDPR} target="_blank">GDPR</a>
                </div>
              </div>
          </div>
      </div>
      <div className="chat-container">        
        <div className="chat-header typing-indicator" style={{ display: displayWaiting }}>
          <h2 className="chat-header">{curAI('') + ' ' + (selLang === 'fr' ? `en train d'écrire` : (selLang === "es" ? "chateando" : (selLang === "en" ? "chatting" : (selLang === 'de' ? "am Schreiben" : ''))))}</h2>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <div ref={lstMsgRef} className="chat-messages">             
              <div className="message blue-bg" style={{display : curCateg === 2 && curCita1.contact !== "" ? "block" : "none"}}>
              <b>{GetMsgResumeCita('')}</b><br/><br/>
              {GetMsgDateHourCita('')}<b className='color-cita'>{new Intl.DateTimeFormat(codeLang(''), {
                  weekday: 'short', 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit',
                  timeZone: 'UTC' 
              }).format(new Date(curCita1.dateCita))}</b><br/>
              {GetMsgTypeCita('')}<b className='color-cita'>{curCita1.labelService}</b><br/>
              {GetMsgContactCita('')}<b className='color-cita'><a href={"https://wa.me/" + import.meta.env.VITE_WHATSAPP + "?text=" + GetTextEmail()}>{"+" + import.meta.env.VITE_WHATSAPP}</a></b><br/><br/>
              {GetMsgUpdateCita('')}
              </div>            
          {messages.map((message, index) => (            
            <div
              key={index}
              className={`message ${message.sender === curMe('') ? 'blue-bg' : 'gray-bg'}`}>
              <div className="message-sender">{message.sender}
              <button id={index} 
        onClick={(e) => copyToClipboard(e,message.text)} 
        className="clipboard-icon"
      >
        📋
      </button>
      <span className={`copied-message ${copied == index ? "visible" : ""}`}>{labelCopied}</span>
              </div>               
              <div className="message-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}> 
                {curCita1.stepCita > 0 && (<div>{GetMsgTypeCita(selLang)}<b>{curCita1.labelService}</b><br/>
                {GetMsgDateHourCita(selLang)}<b>
                  { (new Date(new Date(curCita1.dateCita).toDateString()) > new Date(new Date().toDateString())) ? new Intl.DateTimeFormat(codeLang(''), { 
            weekday: 'short',
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'UTC' 
        }).format(new Date(curCita1.dateCita)).replace(', 00:00','') : ''}
                  </b><br/>
                </div> )}
                <div>
                {message.lines && message.lines.length > 0
                  ? message.lines.map((line, lineIndex) => (
                      <span key={lineIndex}>
                        {line} 
                      <br/>                       
                      </span>
                    ))
                  : message.text}
                </div>                                 
                <div> 
                  <br/>              
                  <a 
  style={{ color: "#062a4e", fontWeight: "bold", textAlign: "left" }} 
  href={
    messages.length > 2 && message && message.text && typeof message.text === "string" && message.text.includes(import.meta.env.VITE_WHATSAPP) 
      ? `https://wa.me/${import.meta.env.VITE_WHATSAPP}?text=${
          selLang === 'de' ? '' 
          : selLang === 'es' ? ' Pregunta : ' 
          : ' Question : '
        }${messages[index - 1].text}${
          selLang === 'de' ? '' 
          : selLang === 'es' ? ' Respuesta : ' 
          : selLang === 'en' ? ' Response : ' 
          : ' Réponse : '
        }${messages[index].text}`
      : ''
  }
>
  {messages.length > 2 && message && message.text && typeof message.text === "string" && message.text.includes(import.meta.env.VITE_WHATSAPP) && (
    <span>
      {selLang === 'de' 
        ? '' 
        : selLang === 'es' 
        ? 'Contactar con ' 
        : selLang === 'en' 
        ? 'Contact the ' 
        : 'Contacter le '}
      +{import.meta.env.VITE_WHATSAPP}
    </span>
  )}
</a>

                </div> 
              </div>      
              <div className="message-timestamp">{message.timestamp}</div>
              {hasPromoProd && (<div style={{marginTop: "10px",height: "20vh",width : "100%",display : (message.sender === curAI("") && curCateg === 0 && message.text !== GetMsgInitInfo("") && hasPromoProd && selectedProducts !== "") ? "flex" : "none"}}>
                <div style={{display: "flex",flex:"1"}}>
                    <a href="#popup" onClick={() => setIsFormSendOpen(false)}>
                      <img style={{height:"20vh"}} src={products.length > 0 ? products[0][1] : ''} alt={products.length > 0 ? products[0][0] : ''}/>
                    </a>
                </div>
                <div style={{display:"flex",flex:"4",marginTop:"4em",alignItems:"right",justifyContent:"center",color: "#062a4e"}}>
                  <a href="#popup" onClick={() => setIsFormSendOpen(false)}>
                  {products.length > 0 ? products[0][0] : ''}
                  </a>
                </div>
              </div>)}
            </div>
          ))}
          <div class="cita-container">
          {linesDay.map((lin, idxLin) => (
              <div key={idxLin} className="button-line" style={{ display: linesDay.length > 0 ? "block" : "none" }}>  
                {lin.map((col, idxCol) => (
                  <button 
                    key={idxCol}  
                    className="cita-button button send-button"
                    onClick={(e) => manageCita(e)} value={col.split("-").length > 2 ? col.split("-")[0] + "-" + col.split("-")[1] + "-" + col.split("-")[2] : col.split("-")[0] }
                  >
                    {col.split("-").length > 2 ? new Date(col).toLocaleString(codeLang(''), { weekday: "short", day: "2-digit", month: "2-digit" }) : (col.split("-").length > 1 ? col.split("-")[1] : new Date('2000-01-01T' + col + ":00").toLocaleString(selLang, { hour: '2-digit', minute: '2-digit' })) } 
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
          <textarea id="message" name="message" rows="5" cols="50" disabled={curCateg === 2 && curCita1.stepCita < 3 && curCita1.contact !== ""} className="chat-input" value={chatInput} placeholder={`${curTypeHere}, ${messageSender}...`} onFocus={handleFocus} onChange={(e) => setChatInput(e.target.value)}></textarea>          
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
          <button type="submit" disabled={curCateg === 2 && curCita1.stepCita < 3 && curCita1.contact !== ""} className="button send-button">{curSend}</button>
        </form>
        <div className='displayElements1'>
          {/* Left-aligned button */}
          <button className="button send-button" onClick={handleClearChat}>
            {curCateg === 2 && curCita1.contact !== "" ? curCancel : curClear}
          </button>
          <div>
            {/* Radio Button EN */}
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

            {/* Radio Button FR */}
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

             {/* Radio Button DE */}
            <input
              type="radio"
              id="de"
              name="options"
              checked={selLang === "de"}
              style={{ display: "none" }}
            />
            <label htmlFor="DE" className="label" onClick={() =>  handleChangeLang("de")}>
              <span className={`radio ${selLang === "de" ? "selected" : ""}`}></span>
              DE
            </label>

            {/* Radio Button ES */}
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
            <button style={displayQuote} className="button send-button" onClick={() => handleChat(1)}>
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

