import{r,j as n}from"./index-D3ue-JvY.js";import{c as V,G as B}from"./client-CLbbz6m0.js";const a=new B("https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql",{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}),N=V({url:"https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql".replace("https","wss"),connectionParams:{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}}),J=()=>{const f=r.useRef(null),[y,p]=r.useState([]),[T,d]=r.useState([]),[h,q]=r.useState(""),[w,g]=r.useState(!1),[b,C]=r.useState(""),[O,_]=r.useState(-1),[t,z]=r.useState(navigator.language.slice(0,2)||"en"),x=t==="de"?"Senden":t==="es"?"Enviar":t==="en"?"Send":"Envoyer",$=t==="de"?"Hier eingeben":t==="es"?"Escribe aquí":t==="en"?"Type here":"Tapez ici",j=t==="de"?"Virtueller Assistent":t==="es"?"Asistente virtual":t==="en"?"Virtual assistant":"Assistant virtuel",I=t==="de"?"Ich":t==="es"?"Yo":t==="en"?"Me":"Moi",A=t==="de"?"Kopiert !":t==="es"?"Copiado !":t==="en"?"Copied !":"Copié !",S=t==="de"?"de-DE":t==="es"?"es-ES":t==="en"?"en-US":"fr-FR",k=`
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
      `,l=async s=>{try{p([]);const e=await a.request(k,{id_client:1}),i=(Array.isArray(e==null?void 0:e.COMMENT)?e.COMMENT:[]).sort((u,c)=>new Date(c.created||0)-new Date(u.created||0));s()&&p(i)}catch(e){console.error("Error fetching comments:",e)}};r.useEffect(()=>{let s=!0;return l(()=>s),()=>{s=!1}},[]);const D=`
      query GetLastQuestion($pseudo: String!) {
        COMMENT(
          where: { pseudo: { _eq: $pseudo } }
          order_by: { created: desc }
          limit: 1
        ) {
          question
        }
      }
       `,W=`
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
       `,P=async s=>{try{if(s.preventDefault(),b.trim()==="")return;const e=await a.request(D,{pseudo:h});if(e.COMMENT.length===0){console.log("No questions found for the given pseudo : "+h);return}const o=e.COMMENT[0].question,i=await a.request(W,{id_client:1,pseudo:h,question:o,response:b,created:new Date(Date.now()+60*60*1e3)});console.log("Comment inserted successfully! "+i),l()}catch(e){console.error("Error fetching data:",e)}C("")},U=`
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
        `,L=`
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
        `,G=async(s,e)=>{try{C(t==="de"?"Ich sehe, dass der virtuelle Assistent falsche Informationen bereitgestellt hat. Bitte kontaktieren Sie mich über WhatsApp unter +34685338165, um die richtigen Informationen zu erhalten. Vielen Dank im Voraus.":t==="es"?"Veo que el asistente virtual ha proporcionado información errónea. Le ruego que me contacte por WhatsApp al +34685338165 para recibir la información correcta. Gracias de antemano.":t==="en"?"I see that the virtual assistant has provided incorrect information. Please contact me via WhatsApp at +34685338165 to receive the correct information. Thank you for your understanding.":"Je constate que l'assistant virtuel a fourni des informations erronées. Je vous prie de bien vouloir me contacter via WhatsApp au +34685338165 afin de recevoir les informations correctes. Merci de votre compréhension."),g(!0),q(s),e?console.log("Update not needed"):await a.request(U,{pseudo:s});const i=await a.request(M,{pseudo:s});d(i.comment_union),console.log("Current pseudo:",s),await l();const u=N.subscribe({query:L,variables:{id_client:v,pseudo:s}},{next:async c=>{const m=await a.request(M,{pseudo:s});m.comment_union.length>0?d(m.comment_union):(d([]),g(!1)),l()},error:c=>console.error("Subscription error:",c),complete:()=>console.log("Subscription complete")});return()=>u()}catch(o){console.error("Error fetching data:",o)}},E=`
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
    `,v=1;r.useEffect(()=>{const s=N.subscribe({query:E,variables:{id_client:v}},{next:async e=>{if(e.data&&e.data.COMMENT.length>0){const o={id:e.data.COMMENT[0].id,pseudo:e.data.COMMENT[0].pseudo,question:e.data.COMMENT[0].question,response:e.data.COMMENT[0].response,created:e.data.COMMENT[0].created,viewed:e.data.COMMENT[0].viewed,isai:e.data.COMMENT[0].isai};console.log("New comment added from admin :",e.data.COMMENT[0]);const i=[...y,o].sort((c,m)=>new Date(m.created)-new Date(c.created));p(i);const u=await a.request(M,{pseudo:e.data.COMMENT[0].pseudo});d([]),d(u.comment_union)}},error:e=>console.error("Subscription error:",e),complete:()=>console.log("Subscription complete")});return()=>s()},[N,E,v]);const R=(s,e)=>{navigator.clipboard.writeText(e).then(()=>{_(s.target.id),setTimeout(()=>_(-1),1500)}).catch(o=>console.error("Failed to copy:",o))};return n.jsxs("div",{className:"app-container",children:[n.jsxs("div",{id:"popup",className:"popup",style:{display:w?"block":"none"},children:[n.jsx("a",{href:"#",class:"close",onClick:()=>g(!1),children:"×"}),n.jsx("div",{ref:f,className:"chat-messages",style:{width:"97%"},children:T.map((s,e)=>n.jsx("div",{className:`message ${s.type===0?"blue-bg":"gray-bg"}`,children:n.jsxs("div",{className:"message-sender",children:[n.jsx("button",{id:e,onClick:o=>R(o,s.content),className:"clipboard-icon",children:"📋"}),n.jsx("span",{className:`copied-message ${O===e?"visible":""}`,children:A}),n.jsx("span",{style:{fontWeight:"bold"},children:s.type===0?s.pseudo:s.isai?j:I})," : ",s.content,n.jsx("div",{className:"message-timestamp",children:new Date(s.created).toLocaleString(S,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},e))})]}),n.jsxs("div",{className:"chat-container",children:[n.jsx("div",{ref:f,className:"chat-messages",children:y.map((s,e)=>n.jsx("div",{className:"message blue-bg",style:{fontWeight:s.viewed?"normal":"bold"},children:n.jsxs("div",{className:"message-sender",onClick:()=>G(s.pseudo,s.viewed),children:[s.viewed?"":"✉️","​",s.pseudo," : ",n.jsxs("span",{style:{fontWeight:"normal"},children:[s.question.slice(0,50),"..."]}),n.jsx("div",{className:"message-timestamp",children:new Date(s.created).toLocaleString(S,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},e))}),n.jsx("div",{class:"fixed-bottom",style:{display:w?"block":"none"},children:n.jsxs("form",{className:"chat-input-form",onSubmit:P,children:[n.jsx("textarea",{id:"message",name:"message",rows:"5",cols:"50",className:"chat-input",value:b,placeholder:`${$}...`,onChange:s=>C(s.target.value)}),n.jsx("button",{type:"submit",className:"button send-button",children:x})]})})]})]})};export{J as default};
