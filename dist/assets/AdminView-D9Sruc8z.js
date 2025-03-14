import{r as o,j as n}from"./index-BLFKWAma.js";import{c as W,G as L}from"./client-CLbbz6m0.js";const i=new L("https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql",{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}),N=W({url:"https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql".replace("https","wss"),connectionParams:{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}}),Q=()=>{const w=o.useRef(null),[_,m]=o.useState([]),[E,c]=o.useState([]),[p,q]=o.useState(""),[y,h]=o.useState(!1),[g,M]=o.useState(""),[t,G]=o.useState("es"),T=t==="de"?"":t==="es"?"Enviar":t==="en"?"Send":"Envoyer",O=t==="de"?"":t==="es"?"Escribe aquí":t==="en"?"Type here":"Tapez ici",x=t==="de"?"":t==="es"?"Asistente virtual":t==="en"?"Virtual assistant":"Assistant virtuel",$=t==="de"?"":t==="es"?"Yo":t==="en"?"Me":"Moi",f=t==="de"?"":t==="es"?"es-ES":t==="en"?"en-US":"fr-FR",j=`
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
      `,d=async()=>{try{m([]);const s=(await i.request(j,{id_client:1})).COMMENT.sort((r,a)=>new Date(a.created)-new Date(r.created));m(s)}catch(e){console.error("Error fetching data:",e)}};o.useEffect(()=>{d()},[]);const I=`
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
       `,k=async e=>{try{if(e.preventDefault(),g.trim()==="")return;const s=await i.request(I,{pseudo:p});if(s.COMMENT.length===0){console.log("No questions found for the given pseudo : "+p);return}const r=s.COMMENT[0].question,a=await i.request(D,{id_client:1,pseudo:p,question:r,response:g,created:new Date(Date.now()+60*60*1e3)});console.log("Comment inserted successfully! "+a),d()}catch(s){console.error("Error fetching data:",s)}M("")},A=`
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
        `,b=`
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
        `,P=`
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
        `,U=async(e,s)=>{try{M(t==="de"?"":t==="es"?"Veo que el asistente virtual ha proporcionado información errónea. Le ruego que me contacte por WhatsApp al +34685338165 para recibir la información correcta. Gracias de antemano.":t==="en"?"I see that the virtual assistant has provided incorrect information. Please contact me via WhatsApp at +34685338165 to receive the correct information. Thank you for your understanding.":"Je constate que l'assistant virtuel a fourni des informations erronées. Je vous prie de bien vouloir me contacter via WhatsApp au +34685338165 afin de recevoir les informations correctes. Merci de votre compréhension."),h(!0),q(e),s?console.log("Update not needed"):await i.request(A,{pseudo:e});const a=await i.request(b,{pseudo:e});c(a.comment_union),console.log("Current pseudo:",e),await d();const v=N.subscribe({query:P,variables:{id_client:C,pseudo:e}},{next:async u=>{const l=await i.request(b,{pseudo:e});l.comment_union.length>0?c(l.comment_union):(c([]),h(!1)),d()},error:u=>console.error("Subscription error:",u),complete:()=>console.log("Subscription complete")});return()=>v()}catch(r){console.error("Error fetching data:",r)}},S=`
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
    `,C=1;return o.useEffect(()=>{const e=N.subscribe({query:S,variables:{id_client:C}},{next:async s=>{if(s.data&&s.data.COMMENT.length>0){const r={id:s.data.COMMENT[0].id,pseudo:s.data.COMMENT[0].pseudo,question:s.data.COMMENT[0].question,response:s.data.COMMENT[0].response,created:s.data.COMMENT[0].created,viewed:s.data.COMMENT[0].viewed,isai:s.data.COMMENT[0].isai};console.log("New row added:",s.data.COMMENT[0]);const a=[..._,r].sort((u,l)=>new Date(l.created)-new Date(u.created));m(a);const v=await i.request(b,{pseudo:s.data.COMMENT[0].pseudo});c([]),c(v.comment_union)}},error:s=>console.error("Subscription error:",s),complete:()=>console.log("Subscription complete")});return()=>e()},[N,S,C]),n.jsxs("div",{className:"app-container",children:[n.jsxs("div",{id:"popup",className:"popup",style:{display:y?"block":"none"},children:[n.jsx("a",{href:"#",class:"close",onClick:()=>h(!1),children:"×"}),n.jsx("div",{ref:w,className:"chat-messages",style:{width:"97%"},children:E.map((e,s)=>n.jsx("div",{className:`message ${e.type===0?"blue-bg":"gray-bg"}`,children:n.jsxs("div",{className:"message-sender",children:[n.jsx("span",{style:{fontWeight:"bold"},children:e.type===0?e.pseudo:e.isai?x:$})," : ",e.content,n.jsx("div",{className:"message-timestamp",children:new Date(e.created).toLocaleString(f,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},s))})]}),n.jsxs("div",{className:"chat-container",children:[n.jsx("div",{ref:w,className:"chat-messages",children:_.map((e,s)=>n.jsx("div",{className:"message blue-bg",style:{fontWeight:e.viewed?"normal":"bold"},children:n.jsxs("div",{className:"message-sender",onClick:()=>U(e.pseudo,e.viewed),children:[e.viewed?"":"✉️","​",e.pseudo," : ",n.jsxs("span",{style:{fontWeight:"normal"},children:[e.question.slice(0,50),"..."]}),n.jsx("div",{className:"message-timestamp",children:new Date(e.created).toLocaleString(f,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},s))}),n.jsx("div",{class:"fixed-bottom",style:{display:y?"block":"none"},children:n.jsxs("form",{className:"chat-input-form",onSubmit:k,children:[n.jsx("textarea",{id:"message",name:"message",rows:"5",cols:"50",className:"chat-input",value:g,placeholder:`${O}...`,onChange:e=>M(e.target.value)}),n.jsx("button",{type:"submit",className:"button send-button",children:T})]})})]})]})};export{Q as default};
