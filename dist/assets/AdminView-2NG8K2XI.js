var oe=Object.defineProperty;var se=(e,u,x)=>u in e?oe(e,u,{enumerable:!0,configurable:!0,writable:!0,value:x}):e[u]=x;var A=(e,u,x)=>se(e,typeof u!="symbol"?u+"":u,x);import{r as $,j as l}from"./index-CQt_ZWkf.js";import{G as ie}from"./request-D1CXjZlO.js";function g(e){return e===null?"null":Array.isArray(e)?"array":typeof e}function q(e){return g(e)==="object"}function ae(e){return Array.isArray(e)&&e.length>0&&e.every(u=>"message"in u)}function v(e,u){return e.length<124?e:u}const ce="graphql-transport-ws";var w=(e=>(e[e.InternalServerError=4500]="InternalServerError",e[e.InternalClientError=4005]="InternalClientError",e[e.BadRequest=4400]="BadRequest",e[e.BadResponse=4004]="BadResponse",e[e.Unauthorized=4401]="Unauthorized",e[e.Forbidden=4403]="Forbidden",e[e.SubprotocolNotAcceptable=4406]="SubprotocolNotAcceptable",e[e.ConnectionInitialisationTimeout=4408]="ConnectionInitialisationTimeout",e[e.ConnectionAcknowledgementTimeout=4504]="ConnectionAcknowledgementTimeout",e[e.SubscriberAlreadyExists=4409]="SubscriberAlreadyExists",e[e.TooManyInitialisationRequests=4429]="TooManyInitialisationRequests",e))(w||{}),b=(e=>(e.ConnectionInit="connection_init",e.ConnectionAck="connection_ack",e.Ping="ping",e.Pong="pong",e.Subscribe="subscribe",e.Next="next",e.Error="error",e.Complete="complete",e))(b||{});function re(e){if(!q(e))throw new Error(`Message is expected to be an object, but got ${g(e)}`);if(!e.type)throw new Error("Message is missing the 'type' property");if(typeof e.type!="string")throw new Error(`Message is expects the 'type' property to be a string, but got ${g(e.type)}`);switch(e.type){case"connection_init":case"connection_ack":case"ping":case"pong":{if(e.payload!=null&&!q(e.payload))throw new Error(`"${e.type}" message expects the 'payload' property to be an object or nullish or missing, but got "${e.payload}"`);break}case"subscribe":{if(typeof e.id!="string")throw new Error(`"${e.type}" message expects the 'id' property to be a string, but got ${g(e.id)}`);if(!e.id)throw new Error(`"${e.type}" message requires a non-empty 'id' property`);if(!q(e.payload))throw new Error(`"${e.type}" message expects the 'payload' property to be an object, but got ${g(e.payload)}`);if(typeof e.payload.query!="string")throw new Error(`"${e.type}" message payload expects the 'query' property to be a string, but got ${g(e.payload.query)}`);if(e.payload.variables!=null&&!q(e.payload.variables))throw new Error(`"${e.type}" message payload expects the 'variables' property to be a an object or nullish or missing, but got ${g(e.payload.variables)}`);if(e.payload.operationName!=null&&g(e.payload.operationName)!=="string")throw new Error(`"${e.type}" message payload expects the 'operationName' property to be a string or nullish or missing, but got ${g(e.payload.operationName)}`);if(e.payload.extensions!=null&&!q(e.payload.extensions))throw new Error(`"${e.type}" message payload expects the 'extensions' property to be a an object or nullish or missing, but got ${g(e.payload.extensions)}`);break}case"next":{if(typeof e.id!="string")throw new Error(`"${e.type}" message expects the 'id' property to be a string, but got ${g(e.id)}`);if(!e.id)throw new Error(`"${e.type}" message requires a non-empty 'id' property`);if(!q(e.payload))throw new Error(`"${e.type}" message expects the 'payload' property to be an object, but got ${g(e.payload)}`);break}case"error":{if(typeof e.id!="string")throw new Error(`"${e.type}" message expects the 'id' property to be a string, but got ${g(e.id)}`);if(!e.id)throw new Error(`"${e.type}" message requires a non-empty 'id' property`);if(!ae(e.payload))throw new Error(`"${e.type}" message expects the 'payload' property to be an array of GraphQL errors, but got ${JSON.stringify(e.payload)}`);break}case"complete":{if(typeof e.id!="string")throw new Error(`"${e.type}" message expects the 'id' property to be a string, but got ${g(e.id)}`);if(!e.id)throw new Error(`"${e.type}" message requires a non-empty 'id' property`);break}default:throw new Error(`Invalid message 'type' property "${e.type}"`)}return e}function ue(e,u){return re(typeof e=="string"?JSON.parse(e,u):e)}function U(e,u){return re(e),JSON.stringify(e,u)}function de(e){const{url:u,connectionParams:x,lazy:H=!0,onNonLazyError:_=console.error,lazyCloseTimeout:M=0,keepAlive:R=0,disablePong:F,connectionAckWaitTimeout:I=0,retryAttempts:O=5,retryWait:Q=async function(i){const r=Math.pow(2,i);await new Promise(s=>setTimeout(s,r*1e3+Math.floor(Math.random()*2700+300)))},shouldRetry:h=Z,on:n,webSocketImpl:W,generateID:Y=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,i=>{const r=Math.random()*16|0;return(i=="x"?r:r&3|8).toString(16)})},jsonMessageReplacer:L,jsonMessageReviver:K}=e;let S;if(W){if(!le(W))throw new Error("Invalid WebSocket implementation provided");S=W}else typeof WebSocket<"u"?S=WebSocket:typeof global<"u"?S=global.WebSocket||global.MozWebSocket:typeof window<"u"&&(S=window.WebSocket||window.MozWebSocket);if(!S)throw new Error("WebSocket implementation missing; on Node you can `import WebSocket from 'ws';` and pass `webSocketImpl: WebSocket` to `createClient`");const T=S,p=(()=>{const t=(()=>{const r={};return{on(s,c){return r[s]=c,()=>{delete r[s]}},emit(s){var c;"id"in s&&((c=r[s.id])==null||c.call(r,s))}}})(),i={connecting:n!=null&&n.connecting?[n.connecting]:[],opened:n!=null&&n.opened?[n.opened]:[],connected:n!=null&&n.connected?[n.connected]:[],ping:n!=null&&n.ping?[n.ping]:[],pong:n!=null&&n.pong?[n.pong]:[],message:n!=null&&n.message?[t.emit,n.message]:[t.emit],closed:n!=null&&n.closed?[n.closed]:[],error:n!=null&&n.error?[n.error]:[]};return{onMessage:t.on,on(r,s){const c=i[r];return c.push(s),()=>{c.splice(c.indexOf(s),1)}},emit(r,...s){for(const c of[...i[r]])c(...s)}}})();function J(t){const i=[p.on("error",r=>{i.forEach(s=>s()),t(r)}),p.on("closed",r=>{i.forEach(s=>s()),t(r)})]}let E,N=0,V,k=!1,C=0,D=!1;async function B(){clearTimeout(V);const[t,i]=await(E??(E=new Promise((c,f)=>(async()=>{if(k){if(await Q(C),!N)return E=void 0,f({code:1e3,reason:"All Subscriptions Gone"});C++}p.emit("connecting",k);const a=new T(typeof u=="function"?await u():u,ce);let j,G;function X(){isFinite(R)&&R>0&&(clearTimeout(G),G=setTimeout(()=>{a.readyState===T.OPEN&&(a.send(U({type:b.Ping})),p.emit("ping",!1,void 0))},R))}J(y=>{E=void 0,clearTimeout(j),clearTimeout(G),f(y),y instanceof ee&&(a.close(4499,"Terminated"),a.onerror=null,a.onclose=null)}),a.onerror=y=>p.emit("error",y),a.onclose=y=>p.emit("closed",y),a.onopen=async()=>{try{p.emit("opened",a);const y=typeof x=="function"?await x():x;if(a.readyState!==T.OPEN)return;a.send(U(y?{type:b.ConnectionInit,payload:y}:{type:b.ConnectionInit},L)),isFinite(I)&&I>0&&(j=setTimeout(()=>{a.close(w.ConnectionAcknowledgementTimeout,"Connection acknowledgement timeout")},I)),X()}catch(y){p.emit("error",y),a.close(w.InternalClientError,v(y instanceof Error?y.message:String(y),"Internal client error"))}};let P=!1;a.onmessage=({data:y})=>{try{const m=ue(y,K);if(p.emit("message",m),m.type==="ping"||m.type==="pong"){p.emit(m.type,!0,m.payload),m.type==="pong"?X():F||(a.send(U(m.payload?{type:b.Pong,payload:m.payload}:{type:b.Pong})),p.emit("pong",!1,m.payload));return}if(P)return;if(m.type!==b.ConnectionAck)throw new Error(`First message cannot be of type ${m.type}`);clearTimeout(j),P=!0,p.emit("connected",a,m.payload,k),k=!1,C=0,c([a,new Promise((me,ne)=>J(ne))])}catch(m){a.onmessage=null,p.emit("error",m),a.close(w.BadResponse,v(m instanceof Error?m.message:String(m),"Bad response"))}}})())));t.readyState===T.CLOSING&&await i;let r=()=>{};const s=new Promise(c=>r=c);return[t,r,Promise.race([s.then(()=>{if(!N){const c=()=>t.close(1e3,"Normal Closure");isFinite(M)&&M>0?V=setTimeout(()=>{t.readyState===T.OPEN&&c()},M):c()}}),i])]}function o(t){if(Z(t)&&(pe(t.code)||[w.InternalServerError,w.InternalClientError,w.BadRequest,w.BadResponse,w.Unauthorized,w.SubprotocolNotAcceptable,w.SubscriberAlreadyExists,w.TooManyInitialisationRequests].includes(t.code)))throw t;if(D)return!1;if(Z(t)&&t.code===1e3)return N>0;if(!O||C>=O||!h(t))throw t;return k=!0}H||(async()=>{for(N++;;)try{const[,,t]=await B();await t}catch(t){try{if(!o(t))return}catch(i){return _==null?void 0:_(i)}}})();function d(t,i){const r=Y(t);let s=!1,c=!1,f=()=>{N--,s=!0};return(async()=>{for(N++;;)try{const[a,j,G]=await B();if(s)return j();const X=p.onMessage(r,P=>{switch(P.type){case b.Next:{i.next(P.payload);return}case b.Error:{c=!0,s=!0,i.error(P.payload),f();return}case b.Complete:{s=!0,f();return}}});a.send(U({id:r,type:b.Subscribe,payload:t},L)),f=()=>{!s&&a.readyState===T.OPEN&&a.send(U({id:r,type:b.Complete},L)),N--,s=!0,j()},await G.finally(X);return}catch(a){if(!o(a))return}})().then(()=>{c||i.complete()}).catch(a=>{i.error(a)}),()=>{s||f()}}return{on:p.on,subscribe:d,iterate(t){const i=[],r={done:!1,error:null,resolve:()=>{}},s=d(t,{next(f){i.push(f),r.resolve()},error(f){r.done=!0,r.error=f,r.resolve()},complete(){r.done=!0,r.resolve()}}),c=async function*(){for(;;){for(i.length||await new Promise(a=>r.resolve=a);i.length;)yield i.shift();if(r.error)throw r.error;if(r.done)return}}();return c.throw=async f=>(r.done||(r.done=!0,r.error=f,r.resolve()),{done:!0,value:void 0}),c.return=async()=>(s(),{done:!0,value:void 0}),c},async dispose(){if(D=!0,E){const[t]=await E;t.close(1e3,"Normal Closure")}},terminate(){E&&p.emit("closed",new ee)}}}class ee extends Error{constructor(){super(...arguments);A(this,"name","TerminatedCloseEvent");A(this,"message","4499: Terminated");A(this,"code",4499);A(this,"reason","Terminated");A(this,"wasClean",!1)}}function Z(e){return q(e)&&"code"in e&&"reason"in e}function pe(e){return[1e3,1001,1006,1005,1012,1013,1014].includes(e)?!1:e>=1e3&&e<=1999}function le(e){return typeof e=="function"&&"constructor"in e&&"CLOSED"in e&&"CLOSING"in e&&"CONNECTING"in e&&"OPEN"in e}const z=new ie("https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql",{headers:{"x-hasura-admin-secret":"b0oJ5NWT^GXk8=O+mdV=X2yzz1D5AgWX"}}),te=de({url:"https://irkwbvxjbynhlcascmrk.hasura.eu-central-1.nhost.run/v1/graphql".replace("https","wss")}),he=()=>{const e=$.useRef(null),[u,x]=$.useState([]),[H,_]=$.useState([]),[M,R]=$.useState(""),[F,I]=$.useState(!1),[O,Q]=$.useState(""),[h,n]=$.useState("fr"),W=h==="es"?"Enviar":h==="en"?"Send":"Envoyer",Y=h==="es"?"Escribe aquí":h==="en"?"Type here":"Tapez ici",L=h==="es"?"Asistente virtual":h==="en"?"Virtual assistant":"Assistant virtuel",K=h==="es"?"Yo":h==="en"?"Me":"Moi",S=h==="es"?"es-ES":h==="en"?"en-US":"fr-FR",T=`
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
      `,p=async()=>{try{x([]);const d=(await z.request(T,{id_client:1})).COMMENT.sort((t,i)=>new Date(i.created)-new Date(t.created));x(d)}catch(o){console.error("Error fetching data:",o)}};$.useEffect(()=>{p()},[]);const J=`
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
       `,N=async o=>{try{if(o.preventDefault(),O.trim()==="")return;const d=await z.request(J,{pseudo:M});if(d.COMMENT.length===0){console.log("No questions found for the given pseudo : "+M);return}const t=d.COMMENT[0].question,i=await z.request(E,{id_client:1,pseudo:M,question:t,response:O,created:new Date(Date.now()+60*60*1e3)});console.log("Comment inserted successfully! "+i),p()}catch(d){console.error("Error fetching data:",d)}Q("")},V=`
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
        `,k=`
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
        `,C=async(o,d)=>{try{if(I(!0),R(o),d)console.log("Update no needed");else{const i=await z.request(V,{pseudo:o})}const t=await z.request(k,{pseudo:o});_([]),_(t.comment_union),console.log(o),p()}catch(t){console.error("Error fetching data:",t)}},D=`
    subscription CommentSubscription($id_client: Int!) {
      COMMENT(
        where: { id_client: { _eq: $id_client } } 
        order_by: { created: desc } 
        limit: 1
      ) {
        id
        question
        response
        created
        viewed
        isai
      }
    }
    `,B=1;return $.useEffect(()=>{const o=te.subscribe({query:D,variables:{id_client:B}},{next:d=>{d.data&&d.data.COMMENT.length>0&&console.log("New row added:",d.data.COMMENT[0])},error:d=>console.error("Subscription error:",d),complete:()=>console.log("Subscription complete")});return()=>o()},[te,D,B]),l.jsxs("div",{className:"app-container",children:[l.jsxs("div",{id:"popup",className:"popup",style:{display:F?"block":"none"},children:[l.jsx("a",{href:"#",class:"close",onClick:()=>I(!1),children:"×"}),l.jsx("div",{ref:e,className:"chat-messages",style:{width:"97%"},children:H.map((o,d)=>l.jsx("div",{className:`message ${o.type===0?"blue-bg":"gray-bg"}`,children:l.jsxs("div",{className:"message-sender",children:[l.jsx("span",{style:{fontWeight:"bold"},children:o.type===0?o.pseudo:o.isai?L:K})," : ",o.content,l.jsx("div",{className:"message-timestamp",children:new Date(o.created).toLocaleString(S,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},d))})]}),l.jsxs("div",{className:"chat-container",children:[l.jsx("div",{ref:e,className:"chat-messages",children:u.map((o,d)=>l.jsx("div",{className:"message blue-bg",style:{fontWeight:o.viewed?"normal":"bold"},children:l.jsxs("div",{className:"message-sender",onClick:()=>C(o.pseudo,o.viewed),children:[o.viewed?"":"✉️","​",o.pseudo," : ",l.jsxs("span",{style:{fontWeight:"normal"},children:[o.question.slice(0,50),"..."]}),l.jsx("div",{className:"message-timestamp",children:new Date(o.created).toLocaleString(S,{month:"long",day:"numeric",hour:"numeric",minute:"numeric",hour24:!0})})]})},d))}),l.jsx("div",{class:"fixed-bottom",style:{display:F?"block":"none"},children:l.jsxs("form",{className:"chat-input-form",onSubmit:N,children:[l.jsx("textarea",{id:"message",name:"message",rows:"5",cols:"50",className:"chat-input",value:O,placeholder:`${Y}...`,onChange:o=>Q(o.target.value)}),l.jsx("button",{type:"submit",className:"button send-button",children:W})]})})]})]})};export{he as default};
