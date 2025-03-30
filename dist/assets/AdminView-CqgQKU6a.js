import{r,G,j as n}from"./index-u7IwxNPk.js";import{c as V}from"./client-CqLpxT0a.js";const i=new G("https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql",{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}),v=V({url:"https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql".replace("https","wss"),connectionParams:{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}}),F=()=>{const u=r.useRef(null),[q,S]=r.useState([]),[N,a]=r.useState([]),[l,E]=r.useState(""),[_,m]=r.useState(!1),[p,h]=r.useState(""),[O,f]=r.useState(-1),[s,z]=r.useState(navigator.language.slice(0,2)||"en"),x=s==="de"?"Senden":s==="es"?"Enviar":s==="en"?"Send":"Envoyer",$=s==="de"?"Hier eingeben":s==="es"?"Escribe aquí":s==="en"?"Type here":"Tapez ici",I=s==="de"?"Virtueller Assistent":s==="es"?"Asistente virtual":s==="en"?"Virtual assistant":"Assistant virtuel",j=s==="de"?"Ich":s==="es"?"Yo":s==="en"?"Me":"Moi",k=s==="de"?"Kopiert !":s==="es"?"Copiado !":s==="en"?"Copied !":"Copié !",y=s==="de"?"de-DE":s==="es"?"es-ES":s==="en"?"en-US":"fr-FR",U=`
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
      `,d=r.useCallback(async()=>{let e=!0;try{S([]);const t=await i.request(U,{id_client:3}),o=((t==null?void 0:t.COMMENT)??[]).sort((c,C)=>new Date(C.created||0)-new Date(c.created||0));e&&S(o)}catch(t){console.error("Error fetching comments:",t)}return()=>{e=!1}},[]),A=`
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
       `,B=async e=>{try{if(e.preventDefault(),p.trim()==="")return;const t=await i.request(A,{pseudo:l});if(t.COMMENT.length===0){console.log("No questions found for the given pseudo : "+l);return}const o=t.COMMENT[0].question,c=await i.request(P,{id_client:3,pseudo:l,question:o,response:p,created:new Date(Date.now()+60*60*1e3)});console.log("Comment inserted successfully! "+c),d()}catch(t){console.error("Error fetching data:",t)}h("")},D=`
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
        `,g=`
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
        `,W=async(e,t)=>{try{h(s==="de"?"Ich sehe, dass der virtuelle Assistent falsche Informationen bereitgestellt hat. Bitte kontaktieren Sie mich über WhatsApp unter +, um die richtigen Informationen zu erhalten. Vielen Dank im Voraus.":s==="es"?"Veo que el asistente virtual ha proporcionado información errónea. Le ruego que me contacte por WhatsApp al + para recibir la información correcta. Gracias de antemano.":s==="en"?"I see that the virtual assistant has provided incorrect information. Please contact me via WhatsApp at + to receive the correct information. Thank you for your understanding.":"Je constate que l'assistant virtuel a fourni des informations erronées. Je vous prie de bien vouloir me contacter via WhatsApp au + afin de recevoir les informations correctes. Merci de votre compréhension."),m(!0),E(e),t?console.log("Update not needed"):await i.request(D,{pseudo:e});const c=await i.request(g,{pseudo:e});a(c.comment_union),console.log("Current pseudo:",e),await d();const C=v.subscribe({query:R,variables:{id_client:b,pseudo:e}},{next:async w=>{const T=await i.request(g,{pseudo:e});T.comment_union.length>0?a(T.comment_union):(a([]),m(!1)),d()},error:w=>console.error("SUBCOMMENT_SUBSCRIPTION error:",w),complete:()=>{console.log("SUBCOMMENT_SUBSCRIPTION complete")}});return()=>C()}catch(o){console.error("Error fetching data:",o)}};r.useEffect(()=>{u.current&&requestAnimationFrame(()=>{console.log("Scrolling to bottom on comment update"),u.current.scrollTop=u.current.scrollHeight})},[N]);const M=`
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
    `,b=3;r.useEffect(()=>{const e=v.subscribe({query:M,variables:{id_client:b}},{next:async t=>{if(t.data&&t.data.COMMENT.length>0){await d();const o=await i.request(g,{pseudo:t.data.COMMENT[0].pseudo});a([]),a(o.comment_union)}},error:t=>console.error("COMMENT_SUBSCRIPTION error:",t),complete:()=>console.log("COMMENT_SUBSCRIPTION complete")});return()=>e()},[v,M,b]);const L=(e,t)=>{navigator.clipboard.writeText(t).then(()=>{f(e.target.id),setTimeout(()=>f(-1),1500)}).catch(o=>console.error("Failed to copy:",o))};return n.jsxs("div",{className:"app-container",children:[n.jsxs("div",{id:"popup",className:"popup",style:{display:_?"block":"none"},children:[n.jsx("a",{href:"#",class:"close",onClick:()=>m(!1),children:"×"}),n.jsx("div",{ref:u,className:"chat-subcomments",style:{width:"97%"},children:N.map((e,t)=>n.jsx("div",{className:`message ${e.type===0?"blue-bg":"gray-bg"}`,children:n.jsxs("div",{className:"message-sender",children:[n.jsx("button",{id:t,onClick:o=>L(o,e.content),className:"clipboard-icon",children:"📋"}),n.jsx("span",{className:`copied-message ${O===t?"visible":""}`,children:k}),n.jsx("span",{style:{fontWeight:"bold"},children:e.type===0?e.pseudo:e.isai?I:j})," : ",e.content,n.jsx("div",{className:"message-timestamp",children:new Date(e.created).toLocaleString(y,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},t))})]}),n.jsxs("div",{className:"chat-container",children:[n.jsx("div",{className:"chat-comments",children:q.map((e,t)=>n.jsx("div",{className:"message blue-bg",style:{fontWeight:e.viewed?"normal":"bold"},children:n.jsxs("div",{className:"message-sender",onClick:()=>W(e.pseudo,e.viewed),children:[e.viewed?"":"✉️","​",e.pseudo," : ",n.jsxs("span",{style:{fontWeight:"normal"},children:[e.question.slice(0,50),"..."]}),n.jsx("div",{className:"message-timestamp",children:new Date(e.created).toLocaleString(y,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},t))}),n.jsx("div",{class:"fixed-bottom",style:{display:_?"block":"none"},children:n.jsxs("form",{className:"chat-input-form",onSubmit:B,children:[n.jsx("textarea",{id:"message",name:"message",rows:"5",cols:"50",className:"chat-input",value:p,placeholder:`${$}...`,onChange:e=>h(e.target.value)}),n.jsx("button",{type:"submit",className:"button send-button",children:x})]})})]})]})};export{F as default};
