import React, { useState, useEffect, useRef } from 'react';
import "../styles/AdminView.css";
import { GraphQLClient } from 'graphql-request';


const client = new GraphQLClient(import.meta.env.VITE_GRAPHQL_URL, {
    headers: {
      "x-hasura-admin-secret": import.meta.env.VITE_GRAPHQL_KEY,
    },
  });

const AdminView = () => {
    
    const lstMsgRef = useRef(null);
    const [comments, setComments] = useState([]);
    const [subComments, setSubComments] = useState([]);
    const [curPseudo, setCurPseudo] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    
    
    const [selLang, setSelLang] = useState(import.meta.env.VITE_LANG);
    const curSend = selLang === 'es' ? 'Enviar' : (selLang === 'en' ? 'Send' : 'Envoyer');
    const curTypeHere = selLang === 'es' ? 'Escribe aquí' : (selLang === 'en' ? 'Type here' : 'Tapez ici'); 
    const curAI = selLang === 'es' ? 'Asistente virtual' : (selLang === 'en' ? 'Virtual assistant' : 'Assistant virtuel');
    const curMe = selLang === 'es' ? 'Yo' : (selLang === 'en' ? 'Me' : 'Moi');

    const curFormat = selLang === 'es' ? 'es-ES' : (selLang === 'en' ? 'en-US' : 'fr-FR');

    const QUERY_COMMENTS = `
    query GetCommentsByClient($id_client: Int!) {
      COMMENT(
        where: { id_client: { _eq: $id_client } }
        order_by: [{ pseudo: asc }, { created: desc }]
        distinct_on: [pseudo]
      ) {
        id
        pseudo
        question
        created
        viewed
      }
    }
      `;
  
        const fetchComments = async () => {
            try {
            setComments([]);
            const data = await client.request(QUERY_COMMENTS, { id_client : Number(import.meta.env.VITE_ID_CLIENT) });
            const sortedComments = data.COMMENT.sort((a, b) => new Date(b.created) - new Date(a.created));
            setComments(sortedComments);
            } catch (error) {
            console.error("Error fetching data:", error);
            }      
        };

    useEffect(() => { 
      fetchComments();
        let fruits = [
            "Apple", "Banana", "Cherry", "Mango", "Pineapple", 
            "Strawberry", "Blueberry", "Grapes", "Orange", "Pear", 
            "Peach", "Plum", "Kiwi", "Watermelon", "Papaya", 
            "Pomegranate", "Lemon", "Lime", "Fig", import.meta.env.VITE_LIMIT_LIST_ADMIN
        ];
        for (let fruit of fruits) {
            //loadMessage(curAI,fruit,"");
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

      const LAST_QUESTION = `
      query GetLastQuestion($pseudo: String!) {
        COMMENT(
          where: { pseudo: { _eq: $pseudo } }
          order_by: { created: desc }
          limit: 1
        ) {
          question
        }
      }
       `; 

      const INSERT_COMMENT = `
      mutation InsertComment(
          $id_client: Int!, 
          $pseudo: String!, 
          $question: String!, 
          $response: String!, 
          $viewed: Boolean, 
          $created: timestamp
        ) {
          insert_COMMENT_one(
            object: { 
              id_client: $id_client, 
              pseudo: $pseudo, 
              question: $question, 
              response: $response, 
              viewed: $viewed, 
              created: $created 
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

      const handleSendMessage = async (e) => {
        try {
          e.preventDefault();  
          // Step 1: Fetch the last question
          const lastQuestionData = await client.request(LAST_QUESTION, { pseudo : curPseudo });
    
          // Check if there's a last question
          if (lastQuestionData.COMMENT.length === 0) {
            console.log('No questions found for the given pseudo : ' + curPseudo);
            return;
          }
    
          const lastQuestion = lastQuestionData.COMMENT[0].question;
    
          // Step 2: Insert the new comment with the last question
          const result = await client.request(INSERT_COMMENT, {
            id_client : Number(import.meta.env.VITE_ID_CLIENT),  // Replace with the actual client ID
            pseudo : curPseudo,
            question : lastQuestion,
            response : chatInput,
            viewed :true,
            created : new Date()
          });    
          
          console.log('Comment inserted successfully! ' + result);  // Log the result
        } catch (error) {          
          console.error("Error fetching data:", error);
        }
         
      };

      const UPDATE_COMMENTS = `
      mutation UpdateComment($pseudo: String!) {
        update_COMMENT(
            where: { pseudo: { _eq: $pseudo } }
            _set: { viewed: true }
        ) {
            returning {
            id
            pseudo
            viewed
            }
        }
        }
        `;  

        const SUB_COMMENTS = `
      query GetCommentsByPseudo($pseudo: String!) {
        comment_union(
          where: { pseudo: { _eq: $pseudo } }
          order_by: { created: desc, type: asc }
        ) {
          pseudo
          content
          created
          type
        }
      }
        `; 

    
    const viewListComments = async (pseudo,viewed) => {
        try{
          setIsPopupOpen(true);
          setCurPseudo(pseudo);
          if(!viewed){
            const data = await client.request(UPDATE_COMMENTS, { pseudo: pseudo });          
          }else{
            console.log("Update no needed");
          }         
          const data2 = await client.request(SUB_COMMENTS, { pseudo: pseudo });
          setSubComments([]);
          setSubComments(data2.comment_union);
          console.log(pseudo); 
          fetchComments(); 
        } catch (error) {
        console.error("Error fetching data:", error);
        }    
    };

    return (
    <div className="app-container"> 
      <div id="popup" className='popup' style={{display : isPopupOpen ? 'block' : 'none'}}>  
        <a href="#" class="close" onClick={() => setIsPopupOpen(false)}>&times;</a>    
        <div ref={lstMsgRef} className="chat-messages" style={{width:"97%"}}>           
            {subComments.map((item, index) => (            
              <div
                key={index}
                className={`message ${item.type === 0 ? 'blue-bg' : 'gray-bg'}`}>
                <div className="message-sender"><span style={{fontWeight:"bold"}}>{item.type  === 0 ? item.pseudo : curAI}</span> : {item.content}
                <div className="message-timestamp">{new Date(item.created).toLocaleString(curFormat, {
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      hour24: true,
                      })}</div>
                </div> 
                

              </div>
            ))}
        </div>  
      </div>   
      <div className="chat-container">       
        
        <div ref={lstMsgRef} className="chat-messages">           
          {comments.map((item, index) => (            
            <div
              key={index}
              className='message blue-bg' style={{fontWeight : item.viewed ? 'normal' : 'bold'}}>
              <div className="message-sender" onClick={() => viewListComments(item.pseudo,item.viewed)}>{item.viewed ? '' : '✉️'}​{item.pseudo} : <span style={{fontWeight:'normal'}}>{item.question.slice(0, 50)}...</span>
              <div className="message-timestamp">{new Date(item.created).toLocaleString(curFormat, {
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour24: true,
                    })}</div>
              </div> 
               

            </div>
          ))}
        
        </div>
        <div class="fixed-bottom" style={{display : isPopupOpen ? 'block' : 'none'}}>
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <textarea id="message" name="message" rows="5" cols="50" className="chat-input" value={chatInput} placeholder={`${curTypeHere}...`} onChange={(e) => setChatInput(e.target.value)}></textarea>                    
            <button type="submit" className="button send-button">{curSend}</button>
          </form>
        </div>
      </div>
    </div>
  );
  
};


export default AdminView;

