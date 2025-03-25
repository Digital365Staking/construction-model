// App.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { GraphQLClient } from 'graphql-request';



const App = () => {
  const [searchParams] = useSearchParams();
  const [ClientView, setClientView] = useState(null);
  const [AdminView, setAdminView] = useState(null);
  const [curGuid, setCurGuid] = useState(() => localStorage.getItem('curGuid') || '-');

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
        CLIENT(where: { id: { _eq: $id }, guid: { _eq: $guid } }) {
          id
          }
        }
        `;
      
        const QUERY_CLI_UPDATEKEYS = `
        mutation UpdateClient($id: Int!, $guid: String!, $number: Int!) {
        update_CLIENT_by_pk(pk_columns: {id: $id}, _set: {guid: $guid, key: $number}) {
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

        const isEmptyString = (value) => !value || value.trim() === "";

        const GetClientByIdAndKey = async(id,key) => {
          try{          
            const data = await client.request(QUERY_CLI_KEY, { id, key  });
            if(data.CLIENT.length > 0){
              let guid = data.CLIENT[0].guid;
              if(guid === "-" || isEmptyString(guid)){
                console.log("link registration , 1st time");
                guid = uuidv4(); // Generates a unique GUID
                localStorage.setItem('curGuid',guid);
                const number = Math.floor(Math.random() * 99999) + 1;
                console.log("id = " + id + " , guid = " + guid + " , number = " + number);
                await client.request(QUERY_CLI_UPDATEKEYS, { id, guid, number });
              }
              return guid;
            }else{
              console.log("key doesn't exist");
            }
            return "-";
          } catch (error) {
            console.error("Error GetClientByIdAndKey:", error);
          }
        };
        
        const processView = async () => {
            if (searchParams.has("a")) {
              console.log('curGUID = ' + curGuid);
              let key = Number(searchParams.get('a'));
              let guid = "-";
              if(curGuid === '-' || isEmptyString(curGuid)){            
                guid = await GetClientByIdAndKey(id_client,Number(key));
              }else{
                guid = await GetClientByIdAndGuid(id_client,curGuid);
              }
              console.log('contentGuid ' + guid);
              if(guid === '-' || isEmptyString(guid)){
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
        };
        processView();
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