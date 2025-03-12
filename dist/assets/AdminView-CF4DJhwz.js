import{r as o,j as t}from"./index-Dlna9LxO.js";import{c as L,G as P}from"./client-CLbbz6m0.js";const i=new P("https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql",{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}),w=L({url:"https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql".replace("https","wss"),connectionParams:{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}}),Q=()=>{const h=o.useRef(null),[g,d]=o.useState([]),[E,c]=o.useState([]),[u,_]=o.useState(""),[M,v]=o.useState(!1),[l,m]=o.useState(""),[n,G]=o.useState("en"),q=n==="es"?"Enviar":n==="en"?"Send":"Envoyer",S=n==="es"?"Escribe aquí":n==="en"?"Type here":"Tapez ici",T=n==="es"?"Asistente virtual":n==="en"?"Virtual assistant":"Assistant virtuel",x=n==="es"?"Yo":n==="en"?"Me":"Moi",C=n==="es"?"es-ES":n==="en"?"en-US":"fr-FR",O=`
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
      `,p=async()=>{try{d([]);const s=(await i.request(O,{id_client:1})).COMMENT.sort((r,a)=>new Date(a.created)-new Date(r.created));d(s)}catch(e){console.error("Error fetching data:",e)}};o.useEffect(()=>{p()},[]);const j=`
      query GetLastQuestion($pseudo: String!) {
        COMMENT(
          where: { pseudo: { _eq: $pseudo } }
          order_by: { created: desc }
          limit: 1
        ) {
          question
        }
      }
       `,$=`
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
       `,D=async e=>{try{if(e.preventDefault(),l.trim()==="")return;const s=await i.request(j,{pseudo:u});if(s.COMMENT.length===0){console.log("No questions found for the given pseudo : "+u);return}const r=s.COMMENT[0].question,a=await i.request($,{id_client:1,pseudo:u,question:r,response:l,created:new Date(Date.now()+60*60*1e3)});console.log("Comment inserted successfully! "+a),p()}catch(s){console.error("Error fetching data:",s)}m("")},I=`
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
        `,N=`
      query GetCommentsByPseudo($pseudo: String!) {
        comment_union(
          where: { pseudo: { _eq: $pseudo } }
          order_by: { created: desc, type: asc }
        ) {
          pseudo
          content
          created
          type
          isai
        }
      }
        `,k=async(e,s)=>{try{if(m(n==="es"?"Veo que el asistente virtual ha proporcionado información errónea. Le ruego que me contacte por WhatsApp al +34989... para recibir la información correcta. Gracias por su comprensión.":n==="en"?"I see that the virtual assistant has provided incorrect information. Please contact me via WhatsApp at +34989... to receive the correct information. Thank you for your understanding.":"Je constate que l'assistant virtuel a fourni des informations erronées. Je vous prie de bien vouloir me contacter via WhatsApp au +34989... afin de recevoir les informations correctes. Merci de votre compréhension."),v(!0),_(e),s)console.log("Update no needed");else{const y=await i.request(I,{pseudo:e})}const a=await i.request(N,{pseudo:e});c([]),c(a.comment_union),console.log(e),p()}catch(r){console.error("Error fetching data:",r)}},b=`
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
    `,f=1;return o.useEffect(()=>{const e=w.subscribe({query:b,variables:{id_client:f}},{next:async s=>{if(s.data&&s.data.COMMENT.length>0){const r={id:s.data.COMMENT[0].id,pseudo:s.data.COMMENT[0].pseudo,question:s.data.COMMENT[0].question,response:s.data.COMMENT[0].response,created:s.data.COMMENT[0].created,viewed:s.data.COMMENT[0].viewed,isai:s.data.COMMENT[0].isai};console.log("New row added:",s.data.COMMENT[0]);const a=[...g,r].sort((A,W)=>new Date(W.created)-new Date(A.created));d(a);const y=await i.request(N,{pseudo:s.data.COMMENT[0].pseudo});c([]),c(y.comment_union)}},error:s=>console.error("Subscription error:",s),complete:()=>console.log("Subscription complete")});return()=>e()},[w,b,f]),t.jsxs("div",{className:"app-container",children:[t.jsxs("div",{id:"popup",className:"popup",style:{display:M?"block":"none"},children:[t.jsx("a",{href:"#",class:"close",onClick:()=>v(!1),children:"×"}),t.jsx("div",{ref:h,className:"chat-messages",style:{width:"97%"},children:E.map((e,s)=>t.jsx("div",{className:`message ${e.type===0?"blue-bg":"gray-bg"}`,children:t.jsxs("div",{className:"message-sender",children:[t.jsx("span",{style:{fontWeight:"bold"},children:e.type===0?e.pseudo:e.isai?T:x})," : ",e.content,t.jsx("div",{className:"message-timestamp",children:new Date(e.created).toLocaleString(C,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},s))})]}),t.jsxs("div",{className:"chat-container",children:[t.jsx("div",{ref:h,className:"chat-messages",children:g.map((e,s)=>t.jsx("div",{className:"message blue-bg",style:{fontWeight:e.viewed?"normal":"bold"},children:t.jsxs("div",{className:"message-sender",onClick:()=>k(e.pseudo,e.viewed),children:[e.viewed?"":"✉️","​",e.pseudo," : ",t.jsxs("span",{style:{fontWeight:"normal"},children:[e.question.slice(0,50),"..."]}),t.jsx("div",{className:"message-timestamp",children:new Date(e.created).toLocaleString(C,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},s))}),t.jsx("div",{class:"fixed-bottom",style:{display:M?"block":"none"},children:t.jsxs("form",{className:"chat-input-form",onSubmit:D,children:[t.jsx("textarea",{id:"message",name:"message",rows:"5",cols:"50",className:"chat-input",value:l,placeholder:`${S}...`,onChange:e=>m(e.target.value)}),t.jsx("button",{type:"submit",className:"button send-button",children:q})]})})]})]})};export{Q as default};
