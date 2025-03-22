// App.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { GraphQLClient } from 'graphql-request';



const App = () => {
  const [searchParams] = useSearchParams();
  const [ClientView, setClientView] = useState(null);
  const [AdminView, setAdminView] = useState(null);
  const [curGuid, setCurGuid] = useState(() => localStorage.getItem('curGuid') || "-");

      useEffect(() => {
        const QUERY_CLI_KEY = `
        query GetClientByIdAndKey($id: Int!, $key: Int!) {
        CLIENT(where: {id: {_eq: $id}, key: {_eq: $key}}) {
          id
          guid
          }
        }
        `;
      
        const QUERY_CLI_GUID = `
       query GetClientByIdAndGuid($id: Int!, $guid: String!) {
        client(where: { id: { _eq: $id }, guid: { _eq: $guid } }) {
          id
          }
        }
        `;
      
        const QUERY_CLI_UPDATEKEYS = `
        mutation UpdateClient($id: Int!, $newGuid: String!, $newKey: Int!) {
        update_CLIENT_by_pk(pk_columns: {id: $id}, _set: {guid: $newGuid, key: $newKey}) {
          id
          guid
          key
          }
        }
        `;
        
          const id_client = Number(import.meta.env.VITE_ID_CLIENT);
          const client = new GraphQLClient(import.meta.env.VITE_GRAPHQL_URL, {
            headers: {
              "x-hasura-admin-secret": import.meta.env.VITE_GRAPHQL_KEY,
            },
          });

          const GetClientByIdAndGuid = async(id,guid) => { 
            try{
              const data = await client.request(QUERY_CLI_GUID, { id, guid });
              if(data.CLIENT.length > 0){
                console.log("guid already registered");
                return guid;
              }
              return "-";
            } catch (error) {
              console.error("Error GetClientByIdAndGuid:", error);
            }
        };

        const GetClientByIdAndKey = async(id,key) => {
          try{          
            const data = await client.request(QUERY_CLI_KEY, { id, key  });
            if(data.CLIENT.length > 0){
              let guid = data.CLIENT[0].guid;
              if(guid === "-" || isEmptyString(guid)){
                console.log("link registration , 1st time");
                guid = uuidv4(); // Generates a unique GUID
                setCurGuid(guid);
                const number = Math.floor(Math.random() * 99999) + 1;
                await client.request(QUERY_CLI_UPDATEKEYS, { id, guid, number });
              }
              return guid;
            }
            return "-";
          } catch (error) {
            console.error("Error GetClientByIdAndKey:", error);
          }
        };

        if (searchParams.has("a")) {
          let key = Number(searchParams.get('a'));
          let guid = "-";
          if(curGuid === '-'){            
            guid = GetClientByIdAndKey(id_client,key);
          }else{
            guid = GetClientByIdAndGuid(id_client,curGuid);
          }
          if(guid === '-'){
            import("./components/ClientView").then((module) => {
              setClientView(() => module.default);
            });
          }else{
            import("./components/AdminView").then((module) => {
              setAdminView(() => module.default);
            });
          }          
        }else{
          import("./components/ClientView").then((module) => {
            setClientView(() => module.default);
          });
        }
      }, []);

  return (
    <div>   
      <main>  
      {ClientView ? <ClientView /> : (AdminView ? <AdminView /> : <p></p>)}     
      </main>      
    </div>
  );
};

export default App;