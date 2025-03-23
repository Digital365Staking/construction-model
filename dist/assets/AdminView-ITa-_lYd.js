import{r,G as V,j as n}from"./index-DgKL4vsE.js";import{c as B}from"./client-CqLpxT0a.js";const i=new V("https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql",{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}),v=B({url:"https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql".replace("https","wss"),connectionParams:{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}}),J=()=>{const C=r.useRef(null),[q,f]=r.useState([]),[E,a]=r.useState([]),[u,T]=r.useState(""),[y,l]=r.useState(!1),[m,p]=r.useState(""),[x,_]=r.useState(-1),[t,z]=r.useState(navigator.language.slice(0,2)||"en"),$=t==="de"?"Senden":t==="es"?"Enviar":t==="en"?"Send":"Envoyer",j=t==="de"?"Hier eingeben":t==="es"?"Escribe aquí":t==="en"?"Type here":"Tapez ici",O=t==="de"?"Virtueller Assistent":t==="es"?"Asistente virtual":t==="en"?"Virtual assistant":"Assistant virtuel",I=t==="de"?"Ich":t==="es"?"Yo":t==="en"?"Me":"Moi",k=t==="de"?"Kopiert !":t==="es"?"Copiado !":t==="en"?"Copied !":"Copié !",S=t==="de"?"de-DE":t==="es"?"es-ES":t==="en"?"en-US":"fr-FR",A=`
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
      `,d=r.useCallback(async()=>{let e=!0;try{f([]);const s=await i.request(A,{id_client:1}),o=((s==null?void 0:s.COMMENT)??[]).sort((c,b)=>new Date(b.created||0)-new Date(c.created||0));e&&f(o)}catch(s){console.error("Error fetching comments:",s)}return()=>{e=!1}},[]),D=`
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
       `,P=async e=>{try{if(e.preventDefault(),m.trim()==="")return;const s=await i.request(D,{pseudo:u});if(s.COMMENT.length===0){console.log("No questions found for the given pseudo : "+u);return}const o=s.COMMENT[0].question,c=await i.request(W,{id_client:1,pseudo:u,question:o,response:m,created:new Date(Date.now()+60*60*1e3)});console.log("Comment inserted successfully! "+c),d()}catch(s){console.error("Error fetching data:",s)}p("")},U=`
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
        `,G=async(e,s)=>{try{p(t==="de"?"Ich sehe, dass der virtuelle Assistent falsche Informationen bereitgestellt hat. Bitte kontaktieren Sie mich über WhatsApp unter +34685338165, um die richtigen Informationen zu erhalten. Vielen Dank im Voraus.":t==="es"?"Veo que el asistente virtual ha proporcionado información errónea. Le ruego que me contacte por WhatsApp al +34685338165 para recibir la información correcta. Gracias de antemano.":t==="en"?"I see that the virtual assistant has provided incorrect information. Please contact me via WhatsApp at +34685338165 to receive the correct information. Thank you for your understanding.":"Je constate que l'assistant virtuel a fourni des informations erronées. Je vous prie de bien vouloir me contacter via WhatsApp au +34685338165 afin de recevoir les informations correctes. Merci de votre compréhension."),l(!0),T(e),s?console.log("Update not needed"):await i.request(U,{pseudo:e});const c=await i.request(h,{pseudo:e});a(c.comment_union),console.log("Current pseudo:",e),await d();const b=v.subscribe({query:L,variables:{id_client:g,pseudo:e}},{next:async w=>{const M=await i.request(h,{pseudo:e});M.comment_union.length>0?a(M.comment_union):(a([]),l(!1)),d()},error:w=>console.error("Subscription error:",w),complete:()=>console.log("Subscription complete")});return()=>b()}catch(o){console.error("Error fetching data:",o)}},N=`
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
    `,g=1;r.useEffect(()=>{const e=v.subscribe({query:N,variables:{id_client:g}},{next:async s=>{if(s.data&&s.data.COMMENT.length>0){await d();const o=await i.request(h,{pseudo:s.data.COMMENT[0].pseudo});a([]),a(o.comment_union)}},error:s=>console.error("Subscription error:",s),complete:()=>console.log("Subscription complete")});return()=>e()},[v,N,g]);const R=(e,s)=>{navigator.clipboard.writeText(s).then(()=>{_(e.target.id),setTimeout(()=>_(-1),1500)}).catch(o=>console.error("Failed to copy:",o))};return n.jsxs("div",{className:"app-container",children:[n.jsxs("div",{id:"popup",className:"popup",style:{display:y?"block":"none"},children:[n.jsx("a",{href:"#",class:"close",onClick:()=>l(!1),children:"×"}),n.jsx("div",{ref:C,className:"chat-messages",style:{width:"97%"},children:E.map((e,s)=>n.jsx("div",{className:`message ${e.type===0?"blue-bg":"gray-bg"}`,children:n.jsxs("div",{className:"message-sender",children:[n.jsx("button",{id:s,onClick:o=>R(o,e.content),className:"clipboard-icon",children:"📋"}),n.jsx("span",{className:`copied-message ${x===s?"visible":""}`,children:k}),n.jsx("span",{style:{fontWeight:"bold"},children:e.type===0?e.pseudo:e.isai?O:I})," : ",e.content,n.jsx("div",{className:"message-timestamp",children:new Date(e.created).toLocaleString(S,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},s))})]}),n.jsxs("div",{className:"chat-container",children:[n.jsx("div",{ref:C,className:"chat-messages",children:q.map((e,s)=>n.jsx("div",{className:"message blue-bg",style:{fontWeight:e.viewed?"normal":"bold"},children:n.jsxs("div",{className:"message-sender",onClick:()=>G(e.pseudo,e.viewed),children:[e.viewed?"":"✉️","​",e.pseudo," : ",n.jsxs("span",{style:{fontWeight:"normal"},children:[e.question.slice(0,50),"..."]}),n.jsx("div",{className:"message-timestamp",children:new Date(e.created).toLocaleString(S,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},s))}),n.jsx("div",{class:"fixed-bottom",style:{display:y?"block":"none"},children:n.jsxs("form",{className:"chat-input-form",onSubmit:P,children:[n.jsx("textarea",{id:"message",name:"message",rows:"5",cols:"50",className:"chat-input",value:m,placeholder:`${j}...`,onChange:e=>p(e.target.value)}),n.jsx("button",{type:"submit",className:"button send-button",children:$})]})})]})]})};export{J as default};
