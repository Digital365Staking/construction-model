// App.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';



const App = () => {
  const [searchParams] = useSearchParams();
  const [ClientView, setClientView] = useState(null);
  const [AdminView, setAdminView] = useState(null);
  const [curGuid, setCurGuid] = useState(() => localStorage.getItem('curGuid') || "-");

      useEffect(() => {
        
        if (searchParams.has("a")) {
          let key = Number(searchParams.get('a'));
          if(curGuid === '-'){
            //localStorage.setItem('curGuid', JSON.stringify(curGuid));
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