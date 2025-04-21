import{r,G,j as n}from"./index-CWGqjewq.js";import{c as V}from"./client-CqLpxT0a.js";const a=new G("https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql",{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}),C=V({url:"https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql".replace("https","wss"),connectionParams:{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}}),F=()=>{const c=r.useRef(null),[E,v]=r.useState([]),[S,i]=r.useState([]),[_,O]=r.useState(""),[N,l]=r.useState(!1),[m,p]=r.useState(""),[M,f]=r.useState(-1),[s,z]=r.useState(navigator.language.slice(0,2)||"en"),$=s==="de"?"Senden":s==="es"?"Enviar":s==="en"?"Send":"Envoyer",x=s==="de"?"Hier eingeben":s==="es"?"Escribe aquí":s==="en"?"Type here":"Tapez ici",I=s==="de"?"Virtueller Assistent":s==="es"?"Asistente virtual":s==="en"?"Virtual assistant":"Assistant virtuel",j=s==="de"?"Ich":s==="es"?"Yo":s==="en"?"Me":"Moi",k=s==="de"?"Kopiert !":s==="es"?"Copiado !":s==="en"?"Copied !":"Copié !",y=s==="de"?"de-DE":s==="es"?"es-ES":s==="en"?"en-US":"fr-FR",A=`
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
      `,u=r.useCallback(async()=>{let e=!0;try{v([]);const t=await a.request(A,{id_client:3}),o=((t==null?void 0:t.COMMENT)??[]).sort((d,g)=>new Date(g.created||0)-new Date(d.created||0));e&&v(o)}catch(t){console.error("Error fetching comments:",t)}return()=>{e=!1}},[]),U=`
      query GetLastQuestion($pseudo: String!) {
        COMMENT(
          where: { pseudo: { _eq: $pseudo } }
          order_by: { created: desc }
          limit: 1
        ) {
          question
        }
      }
       `,P=`
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
       `,B=async e=>{try{if(e.preventDefault(),m.trim()==="")return;const t=await a.request(U,{pseudo:_});if(t.COMMENT.length===0)return;const o=t.COMMENT[0].question,d=await a.request(P,{id_client:3,pseudo:_,question:o,response:m,created:new Date(Date.now()+60*60*1e3)});u()}catch(t){console.error("Error fetching data:",t)}p("")},D=`
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
        `,h=`
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
        `,R=`
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
        `,W=async(e,t)=>{try{p(s==="de"?"Ich sehe, dass der virtuelle Assistent falsche Informationen bereitgestellt hat. Bitte kontaktieren Sie mich über WhatsApp unter +, um die richtigen Informationen zu erhalten. Vielen Dank im Voraus.":s==="es"?"Veo que el asistente virtual ha proporcionado información errónea. Le ruego que me contacte por WhatsApp al + para recibir la información correcta. Gracias de antemano.":s==="en"?"I see that the virtual assistant has provided incorrect information. Please contact me via WhatsApp at + to receive the correct information. Thank you for your understanding.":"Je constate que l'assistant virtuel a fourni des informations erronées. Je vous prie de bien vouloir me contacter via WhatsApp au + afin de recevoir les informations correctes. Merci de votre compréhension."),l(!0),O(e),t||await a.request(D,{pseudo:e});const d=await a.request(h,{pseudo:e});i(d.comment_union),await u();const g=C.subscribe({query:R,variables:{id_client:b,pseudo:e}},{next:async T=>{const q=await a.request(h,{pseudo:e});q.comment_union.length>0?i(q.comment_union):(i([]),l(!1)),u()},error:T=>console.error("SUBCOMMENT_SUBSCRIPTION error:",T),complete:()=>{console.log("SUBCOMMENT_SUBSCRIPTION complete")}});return()=>g()}catch(o){console.error("Error fetching data:",o)}};r.useEffect(()=>{c.current&&requestAnimationFrame(()=>{c.current.scrollTop=c.current.scrollHeight})},[S]);const w=`
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
    `,b=3;r.useEffect(()=>{const e=C.subscribe({query:w,variables:{id_client:b}},{next:async t=>{if(t.data&&t.data.COMMENT.length>0){await u();const o=await a.request(h,{pseudo:t.data.COMMENT[0].pseudo});i([]),i(o.comment_union)}},error:t=>console.error("COMMENT_SUBSCRIPTION error:",t),complete:()=>console.log("COMMENT_SUBSCRIPTION complete")});return()=>e()},[C,w,b]);const L=(e,t)=>{navigator.clipboard.writeText(t).then(()=>{f(e),console.log(M),setTimeout(()=>f(-1),1500)}).catch(o=>console.error("Failed to copy:",o))};return n.jsxs("div",{className:"app-container",children:[n.jsxs("div",{id:"popup",className:"popup",style:{display:N?"block":"none"},children:[n.jsx("a",{href:"#",class:"close",onClick:()=>l(!1),children:"×"}),n.jsx("div",{ref:c,className:"chat-subcomments",children:S.map((e,t)=>n.jsx("div",{className:`submessage ${e.type===0?"blue-bg":"gray-bg"}`,children:n.jsxs("div",{className:"message-sender",children:[n.jsx("button",{id:t,onClick:()=>L(t,e.content),className:"clipboard-icon",children:"📋"}),n.jsx("span",{className:`copied-message ${M===t?"visible":""}`,children:k}),n.jsx("span",{style:{fontWeight:"bold"},children:e.type===0?e.pseudo:e.isai?I:j})," : ",e.content,n.jsx("div",{className:"message-timestamp",children:new Date(e.created).toLocaleString(y,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},t))})]}),n.jsxs("div",{className:"chat-container",children:[n.jsx("div",{className:"chat-comments",children:E.map((e,t)=>n.jsx("div",{className:"message blue-bg",style:{fontWeight:e.viewed?"normal":"bold"},children:n.jsxs("div",{className:"message-sender",onClick:()=>W(e.pseudo,e.viewed),children:[e.viewed?"":"✉️","​",e.pseudo," : ",n.jsxs("span",{style:{fontWeight:"normal"},children:[e.question.slice(0,50),"..."]}),n.jsx("div",{className:"message-timestamp",children:new Date(e.created).toLocaleString(y,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},t))}),n.jsx("div",{class:"fixed-bottom",style:{display:N?"block":"none"},children:n.jsxs("form",{className:"chat-input-form",onSubmit:B,children:[n.jsx("textarea",{id:"message",name:"message",rows:"5",cols:"50",className:"chat-input",value:m,placeholder:`${x}...`,onChange:e=>p(e.target.value)}),n.jsx("button",{type:"submit",className:"button send-button",children:$})]})})]})]})};export{F as default};
