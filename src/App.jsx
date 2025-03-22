// App.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';


const App = () => {
  const [searchParams] = useSearchParams();
  const [ClientView, setClientView] = useState(null);
  const [AdminView, setAdminView] = useState(null);
  const [curGuid, setCurGuid] = useState(() => localStorage.getItem('curGuid') || "-");

  const QUERY_CLI_KEY = `
  query GetClientByIdAndKey($id: Int!, $key: Int!) {
  CLIENT(where: {id: {_eq: $id}, key: {_eq: $key}}) {
    id
    guid
  }
}
  `;

  const QUERY_CLI_UPDATEGUID = `
  mutation UpdateClientGuid($id: Int!, $newGuid: String!) {
  update_CLIENT_by_pk(pk_columns: {id: $id}, _set: {guid: $newGuid}) {
    id
    guid
    }
  }
  `;

      useEffect(() => {
        const id_client = Number(import.meta.env.VITE_ID_CLIENT);
        const GetClientByIdAndKey = async(id,key) => {
          const data = await client.request(QUERY_CLI_KEY, {  });
          if(data.CLIENT.length > 0){
            let guid = data.CLIENT[0].guid;
            if(guid === "-" || isEmptyString(guid)){
              guid = uuidv4(); // Generates a unique GUID
              await client.request(QUERY_CLI_UPDATEGUID, { id, guid });
            }
            return guid;
          }
          return "-";
        };

        if (searchParams.has("a")) {
          let key = Number(searchParams.get('a'));
          if(curGuid === '-'){
            GetClientByIdAndKey(id_client,key);
          }else{

          }
          import("./components/AdminView").then((module) => {
            setAdminView(() => module.default);
          });
        }else{
          import("./components/ClientView").then((module) => {
            setClientView(() => module.default);
          });
        }
      }, []);

  return (
    <div> { searchParams.has("a") ? searchParams.get('a') : 'No admin' }    
      <main>  
      {ClientView ? <ClientView /> : (AdminView ? <AdminView /> : <p></p>)}     
      </main>      
    </div>
  );
};

export default App;