import{r,j as n}from"./index-Ca4ezWwD.js";import{c as U,G as L}from"./client-CLbbz6m0.js";const a=new L("https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql",{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}),f=U({url:"https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql".replace("https","wss"),connectionParams:{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}}),B=()=>{const N=r.useRef(null),[_,m]=r.useState([]),[E,c]=r.useState([]),[p,q]=r.useState(""),[w,h]=r.useState(!1),[g,b]=r.useState(""),[t,G]=r.useState(void 0),T=t==="de"?"Senden":t==="es"?"Enviar":t==="en"?"Send":"Envoyer",O=t==="de"?"Hier eingeben":t==="es"?"Escribe aquí":t==="en"?"Type here":"Tapez ici",x=t==="de"?"Virtueller Assistent":t==="es"?"Asistente virtual":t==="en"?"Virtual assistant":"Assistant virtuel",$=t==="de"?"Ich":t==="es"?"Yo":t==="en"?"Me":"Moi",y=t==="de"?"de-DE":t==="es"?"es-ES":t==="en"?"en-US":"fr-FR",j=`
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
      `,d=async()=>{try{m([]);const s=(await a.request(j,{id_client:1})).COMMENT.sort((o,i)=>new Date(i.created)-new Date(o.created));m(s)}catch(e){console.error("Error fetching data:",e)}};r.useEffect(()=>{d()},[]);const I=`
      query GetLastQuestion($pseudo: String!) {
        COMMENT(
          where: { pseudo: { _eq: $pseudo } }
          order_by: { created: desc }
          limit: 1
        ) {
          question
        }
      }
       `,D=`
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
       `,k=async e=>{try{if(e.preventDefault(),g.trim()==="")return;const s=await a.request(I,{pseudo:p});if(s.COMMENT.length===0){console.log("No questions found for the given pseudo : "+p);return}const o=s.COMMENT[0].question,i=await a.request(D,{id_client:1,pseudo:p,question:o,response:g,created:new Date(Date.now()+60*60*1e3)});console.log("Comment inserted successfully! "+i),d()}catch(s){console.error("Error fetching data:",s)}b("")},A=`
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
        `,M=`
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
        `,W=`
        subscription SubCommentSubscription($id_client: Int!, $pseudo: String!) {
          COMMENT(
            where: { 
              id_client: { _eq: $id_client }, 
              pseudo: { _eq: $pseudo },
            } 
            order_by: { created: desc }
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
        `,P=async(e,s)=>{try{b(t==="de"?"Ich sehe, dass der virtuelle Assistent falsche Informationen bereitgestellt hat. Bitte kontaktieren Sie mich über WhatsApp unter +34685338165, um die richtigen Informationen zu erhalten. Vielen Dank im Voraus.":t==="es"?"Veo que el asistente virtual ha proporcionado información errónea. Le ruego que me contacte por WhatsApp al +34685338165 para recibir la información correcta. Gracias de antemano.":t==="en"?"I see that the virtual assistant has provided incorrect information. Please contact me via WhatsApp at +34685338165 to receive the correct information. Thank you for your understanding.":"Je constate que l'assistant virtuel a fourni des informations erronées. Je vous prie de bien vouloir me contacter via WhatsApp au +34685338165 afin de recevoir les informations correctes. Merci de votre compréhension."),h(!0),q(e),s?console.log("Update not needed"):await a.request(A,{pseudo:e});const i=await a.request(M,{pseudo:e});c(i.comment_union),console.log("Current pseudo:",e),await d();const v=f.subscribe({query:W,variables:{id_client:C,pseudo:e}},{next:async u=>{const l=await a.request(M,{pseudo:e});l.comment_union.length>0?c(l.comment_union):(c([]),h(!1)),d()},error:u=>console.error("Subscription error:",u),complete:()=>console.log("Subscription complete")});return()=>v()}catch(o){console.error("Error fetching data:",o)}},S=`
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
    `,C=1;return r.useEffect(()=>{const e=f.subscribe({query:S,variables:{id_client:C}},{next:async s=>{if(s.data&&s.data.COMMENT.length>0){const o={id:s.data.COMMENT[0].id,pseudo:s.data.COMMENT[0].pseudo,question:s.data.COMMENT[0].question,response:s.data.COMMENT[0].response,created:s.data.COMMENT[0].created,viewed:s.data.COMMENT[0].viewed,isai:s.data.COMMENT[0].isai};console.log("New comment added from admin :",s.data.COMMENT[0]);const i=[..._,o].sort((u,l)=>new Date(l.created)-new Date(u.created));m(i);const v=await a.request(M,{pseudo:s.data.COMMENT[0].pseudo});c([]),c(v.comment_union)}},error:s=>console.error("Subscription error:",s),complete:()=>console.log("Subscription complete")});return()=>e()},[f,S,C]),n.jsxs("div",{className:"app-container",children:[n.jsxs("div",{id:"popup",className:"popup",style:{display:w?"block":"none"},children:[n.jsx("a",{href:"#",class:"close",onClick:()=>h(!1),children:"×"}),n.jsx("div",{ref:N,className:"chat-messages",style:{width:"97%"},children:E.map((e,s)=>n.jsx("div",{className:`message ${e.type===0?"blue-bg":"gray-bg"}`,children:n.jsxs("div",{className:"message-sender",children:[n.jsx("span",{style:{fontWeight:"bold"},children:e.type===0?e.pseudo:e.isai?x:$})," : ",e.content,n.jsx("div",{className:"message-timestamp",children:new Date(e.created).toLocaleString(y,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},s))})]}),n.jsxs("div",{className:"chat-container",children:[n.jsx("div",{ref:N,className:"chat-messages",children:_.map((e,s)=>n.jsx("div",{className:"message blue-bg",style:{fontWeight:e.viewed?"normal":"bold"},children:n.jsxs("div",{className:"message-sender",onClick:()=>P(e.pseudo,e.viewed),children:[e.viewed?"":"✉️","​",e.pseudo," : ",n.jsxs("span",{style:{fontWeight:"normal"},children:[e.question.slice(0,50),"..."]}),n.jsx("div",{className:"message-timestamp",children:new Date(e.created).toLocaleString(y,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},s))}),n.jsx("div",{class:"fixed-bottom",style:{display:w?"block":"none"},children:n.jsxs("form",{className:"chat-input-form",onSubmit:k,children:[n.jsx("textarea",{id:"message",name:"message",rows:"5",cols:"50",className:"chat-input",value:g,placeholder:`${O}...`,onChange:e=>b(e.target.value)}),n.jsx("button",{type:"submit",className:"button send-button",children:T})]})})]})]})};export{B as default};
