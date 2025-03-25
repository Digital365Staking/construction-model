import React, { useState, useEffect, useRef, useCallback } from 'react';
import "../styles/AdminView.css";
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

const AdminView = () => {
    
    const lstMsgRef = useRef(null);
    const [comments, setComments] = useState([]);
    const [subComments, setSubComments] = useState([]);
    const [curPseudo, setCurPseudo] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [copied, setCopied] = useState(-1);
    
    const [selLang, setSelLang] = useState(navigator.language.slice(0,2) || "en");
    const curSend = selLang === 'de' ? 'Senden' : (selLang === 'es' ? 'Enviar' : (selLang === 'en' ? 'Send' : 'Envoyer'));
    const curTypeHere = selLang === 'de' ? 'Hier eingeben' : (selLang === 'es' ? 'Escribe aquí' : (selLang === 'en' ? 'Type here' : 'Tapez ici'));
    const curAI = selLang === 'de' ? 'Virtueller Assistent' : (selLang === 'es' ? 'Asistente virtual' : (selLang === 'en' ? 'Virtual assistant' : 'Assistant virtuel'));
    const curMe = selLang === 'de' ? 'Ich' : (selLang === 'es' ? 'Yo' : (selLang === 'en' ? 'Me' : 'Moi'));
    const labelCopied = selLang === 'de' ? 'Kopiert !' : (selLang === 'es' ? 'Copiado !' : (selLang === 'en' ? 'Copied !' : 'Copié !'));
    const curFormat = selLang === 'de' ? 'de-DE' : (selLang === 'es' ? 'es-ES' : (selLang === 'en' ? 'en-US' : 'fr-FR'));


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

      
      const fetchComments = useCallback(async () => {
        let mounted = true; // Track component mount state
    
        try {
          setComments([]); // Reset before fetching
    
          const data = await client.request(QUERY_COMMENTS, { 
            id_client: Number(import.meta.env.VITE_ID_CLIENT) 
          });
    
          const sortedComments = (data?.COMMENT ?? [])
            .sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0));
    
          if (mounted) setComments(sortedComments);
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
    
        return () => { mounted = false; }; // Cleanup function
      }, []);
      
      

    const loadMessage = (sender,msg) => {
        
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
          $created: timestamp
        ) {
          insert_COMMENT_one(
            object: { 
              id_client: $id_client, 
              pseudo: $pseudo, 
              question: $question, 
              response: $response, 
              viewed: true, 
              created: $created,
              isai: false 
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
          
          if (chatInput.trim() === '') return;
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
            created : new Date(Date.now() + 60 * 60 * 1000)
          });    
          
          console.log('Comment inserted successfully! ' + result);  // Log the result
          fetchComments();
        } catch (error) {          
          console.error("Error fetching data:", error);
        }
        setChatInput(''); 
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
          order_by: { created: asc, type: asc }
        ) {
          pseudo
          content
          created
          type
          isai
        }
      }
        `; 

        const SUBCOMMENT_SUBSCRIPTION = `
        subscription SubCommentSubscription($id_client: Int!, $pseudo: String!) {
          COMMENT(
            where: { 
              id_client: { _eq: $id_client }, 
              pseudo: { _eq: $pseudo },
            } 
            order_by: { created: asc }
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

        const viewListComments = async (pseudo, viewed) => {
          try {
              // Select the correct message based on language
              const msg_init = selLang === 'de' 
              ? `Ich sehe, dass der virtuelle Assistent falsche Informationen bereitgestellt hat. Bitte kontaktieren Sie mich über WhatsApp unter +${import.meta.env.VITE_WHATSAPP}, um die richtigen Informationen zu erhalten. Vielen Dank im Voraus.` 
              : (selLang === 'es' 
                  ? `Veo que el asistente virtual ha proporcionado información errónea. Le ruego que me contacte por WhatsApp al +${import.meta.env.VITE_WHATSAPP} para recibir la información correcta. Gracias de antemano.` 
                  : (selLang === 'en' 
                      ? `I see that the virtual assistant has provided incorrect information. Please contact me via WhatsApp at +${import.meta.env.VITE_WHATSAPP} to receive the correct information. Thank you for your understanding.` 
                      : `Je constate que l'assistant virtuel a fourni des informations erronées. Je vous prie de bien vouloir me contacter via WhatsApp au +${import.meta.env.VITE_WHATSAPP} afin de recevoir les informations correctes. Merci de votre compréhension.`
                  ));

      
              setChatInput(msg_init);
              setIsPopupOpen(true);
              setCurPseudo(pseudo);
      
              // Update comment viewed status if not viewed
              if (!viewed) {
                  await client.request(UPDATE_COMMENTS, { pseudo });          
              } else {
                  console.log("Update not needed");
              }         
      
              // Fetch updated comments
              const data2 = await client.request(SUB_COMMENTS, { pseudo });
              setSubComments(data2.comment_union);
      
              console.log("Current pseudo:", pseudo);
      
              // Fetch main comments (if necessary)
              await fetchComments();
      
              // Subscribe to comments updates
              const unsubscribe = wsClient.subscribe(
                  {
                      query: SUBCOMMENT_SUBSCRIPTION,
                      variables: { id_client, pseudo }, // Directly use `pseudo`
                  },
                  {
                      next: async (data) => {
                          const newComments = await client.request(SUB_COMMENTS, { pseudo });
                          
                          if (newComments.comment_union.length > 0) {
                              setSubComments(newComments.comment_union);
                              if (lstMsgRef.current) {
                                console.log('scroll subCom received in Admin');
                                lstMsgRef.current.scrollTop = lstMsgRef.current.scrollHeight - 200;
                              }
                          }else{
                            setSubComments([]);
                            setIsPopupOpen(false);                            
                          }
                          fetchComments();
                      },
                      error: (err) => console.error("SUBCOMMENT_SUBSCRIPTION error:", err),
                      complete: () => console.log("SUBCOMMENT_SUBSCRIPTION complete"),
                  }
              );
      
              // Optional: return unsubscribe function for cleanup
              return () => unsubscribe();
      
          } catch (error) {
              console.error("Error fetching data:", error);
          }    
      };
      

    const COMMENT_SUBSCRIPTION = `
      subscription CommentSubscription($id_client: Int!) {
        COMMENT(
          where: { id_client: { _eq: $id_client } } 
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

    const id_client = Number(import.meta.env.VITE_ID_CLIENT);

    useEffect(() => {
    
      const unsubscribe = wsClient.subscribe(
        {
          query: COMMENT_SUBSCRIPTION,  // Pass the subscription directly (no need for print if it's an AST)
          variables: { id_client },     // Pass id_client as a variable
        },
        {
          next: async (data) => {
            if (data.data && data.data.COMMENT.length > 0) {
              
              await fetchComments();

              const data2 = await client.request(SUB_COMMENTS, { pseudo: data.data.COMMENT[0].pseudo });
              setSubComments([]);
              setSubComments(data2.comment_union);              
            }
          },
          error: (err) => console.error('COMMENT_SUBSCRIPTION error:', err),
          complete: () => console.log('COMMENT_SUBSCRIPTION complete'),
        }
      );
    
      return () => unsubscribe(); // Unsubscribe on unmount
    }, [wsClient, COMMENT_SUBSCRIPTION, id_client]); // Include id_client in dependencies
    
    const copyToClipboard = (e, text) => {
      navigator.clipboard.writeText(text).then(() => {        
        setCopied(e.target.id);        
        setTimeout(() => setCopied(-1), 1500);
      }).catch(err => console.error("Failed to copy:", err));
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
                <div className="message-sender"><button id={index} 
                  onClick={(e) => copyToClipboard(e,item.content)} 
                  className="clipboard-icon"
                >
                  📋
                </button>
                <span className={`copied-message ${copied === index ? "visible" : ""}`}>{labelCopied}</span>
                <span style={{fontWeight:"bold"}}>{item.type  === 0 ? item.pseudo : (item.isai ? curAI : curMe)}</span> : {item.content}
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

