import{r as o,j as s}from"./index-CnkKjK-w.js";import{G as O}from"./request-BbyDFhGV.js";const r=new O("https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql",{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}),k=()=>{const d=o.useRef(null),[v,u]=o.useState([]),[N,l]=o.useState([]),[i,C]=o.useState(""),[m,p]=o.useState(!1),[h,g]=o.useState(""),[n,D]=o.useState("fr"),S=n==="es"?"Enviar":n==="en"?"Send":"Envoyer",w=n==="es"?"Escribe aquí":n==="en"?"Type here":"Tapez ici",_=n==="es"?"Asistente virtual":n==="en"?"Virtual assistant":"Assistant virtuel",b=n==="es"?"Yo":n==="en"?"Me":"Moi",y=n==="es"?"es-ES":n==="en"?"en-US":"fr-FR",M=`
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
      `,f=async()=>{try{u([]);const t=(await r.request(M,{id_client:1})).COMMENT.sort((a,c)=>new Date(c.created)-new Date(a.created));u(t)}catch(e){console.error("Error fetching data:",e)}};o.useEffect(()=>{f()},[]);const x=`
      query GetLastQuestion($pseudo: String!) {
        COMMENT(
          where: { pseudo: { _eq: $pseudo } }
          order_by: { created: desc }
          limit: 1
        ) {
          question
        }
      }
       `,E=`
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
       `,q=async e=>{try{e.preventDefault(),g("");const t=await r.request(x,{pseudo:i});if(t.COMMENT.length===0){console.log("No questions found for the given pseudo : "+i);return}const a=t.COMMENT[0].question,c=await r.request(E,{id_client:1,pseudo:i,question:a,response:h,created:new Date});console.log("Comment inserted successfully! "+c)}catch(t){console.error("Error fetching data:",t)}},j=`
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
        `,$=`
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
        `,T=async(e,t)=>{try{if(p(!0),C(e),t)console.log("Update no needed");else{const c=await r.request(j,{pseudo:e})}const a=await r.request($,{pseudo:e});l([]),l(a.comment_union),console.log(e),f()}catch(a){console.error("Error fetching data:",a)}};return s.jsxs("div",{className:"app-container",children:[s.jsxs("div",{id:"popup",className:"popup",style:{display:m?"block":"none"},children:[s.jsx("a",{href:"#",class:"close",onClick:()=>p(!1),children:"×"}),s.jsx("div",{ref:d,className:"chat-messages",style:{width:"97%"},children:N.map((e,t)=>s.jsx("div",{className:`message ${e.type===0?"blue-bg":"gray-bg"}`,children:s.jsxs("div",{className:"message-sender",children:[s.jsx("span",{style:{fontWeight:"bold"},children:e.type===0?e.pseudo:e.isai?_:b})," : ",e.content,s.jsx("div",{className:"message-timestamp",children:new Date(e.created).toLocaleString(y,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},t))})]}),s.jsxs("div",{className:"chat-container",children:[s.jsx("div",{ref:d,className:"chat-messages",children:v.map((e,t)=>s.jsx("div",{className:"message blue-bg",style:{fontWeight:e.viewed?"normal":"bold"},children:s.jsxs("div",{className:"message-sender",onClick:()=>T(e.pseudo,e.viewed),children:[e.viewed?"":"✉️","​",e.pseudo," : ",s.jsxs("span",{style:{fontWeight:"normal"},children:[e.question.slice(0,50),"..."]}),s.jsx("div",{className:"message-timestamp",children:new Date(e.created).toLocaleString(y,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},t))}),s.jsx("div",{class:"fixed-bottom",style:{display:m?"block":"none"},children:s.jsxs("form",{className:"chat-input-form",onSubmit:q,children:[s.jsx("textarea",{id:"message",name:"message",rows:"5",cols:"50",className:"chat-input",value:h,placeholder:`${w}...`,onChange:e=>g(e.target.value)}),s.jsx("button",{type:"submit",className:"button send-button",children:S})]})})]})]})};export{k as default};
