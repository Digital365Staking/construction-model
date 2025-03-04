import React, { useState, useEffect, useRef } from 'react';
import "../styles/AdminView.css";
import { GraphQLClient } from 'graphql-request';
import { useHistory } from 'react-router-dom';


const client = new GraphQLClient(import.meta.env.VITE_GRAPHQL_URL, {
    headers: {
      "x-hasura-admin-secret": import.meta.env.VITE_GRAPHQL_KEY,
    },
  });

const AdminView = () => {
    
    const lstMsgRef = useRef(null);
    const [comments, setComments] = useState([]);
    const [fWeight, setFWeight] = useState([[]]);
    
    const [selLang, setSelLang] = useState(import.meta.env.VITE_LANG);
    const curAI = selLang === 'es' ? 'Asistente virtual' : (selLang === 'en' ? 'Virtual assistant' : 'Assistant virtuel');
    const curMe = selLang === 'es' ? 'Yo' : (selLang === 'en' ? 'Me' : 'Moi');

    const curFormat = selLang === 'es' ? 'es-ES' : (selLang === 'en' ? 'en-US' : 'fr-FR');

    const QUERY_COMMENTS = `
    query {
    COMMENT(
      where: { id_client: { _eq: 1 } }
      order_by: [{ pseudo: asc }, { created: desc }]
      distinct_on: pseudo
          ) {
              pseudo
              question
              created
              viewed
          }
      }
      `;
  
        const fetchComments = async () => {
            try {
            const data = await client.request(QUERY_COMMENTS);
            const sortedComments = data.COMMENT.sort((a, b) => new Date(b.created) - new Date(a.created));
            let i = 0;
            for (const item of sortedComments) {
                fWeight.push([]);
                fWeight[i].push(item.pseudo)
                fWeight[i].push(item.viewed ? 'normal' : 'bold');
                console.log(fWeight[i][1]);
                i++;
            }
            setComments(sortedComments); 
            } catch (error) {
            console.error("Error fetching data:", error);
            }      
        };

    useEffect(() => { 
        setComments([]);
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

    const history = useHistory();
    const viewListComments = async (pseudo,idx) => {
        const data = await client.request(UPDATE_COMMENTS, { pseudo: pseudo });
        console.log(pseudo);
        history.push('/');  // Navigate to the home route, or current route
        history.push(location.pathname);  // Navigate back to the same route       
    };

    return (
    <div className="app-container">      
      <div className="chat-container">       
        
        <div ref={lstMsgRef} className="chat-messages">           
          {comments.map((item, index) => (            
            <div
              key={index}
              className='message blue-bg' style={{fontWeight:fWeight[index][1]}}>
              <div className="message-sender" onClick={() => viewListComments(item.pseudo)}>✉️​{item.pseudo} : <span style={{fontWeight:'normal'}}>{item.question.slice(0, 50)}...</span>
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
    </div>
  );
  
};


export default AdminView;

