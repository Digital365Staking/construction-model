// App.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';



const App = () => {
  const [searchParams] = useSearchParams();
  const [ClientView, setClientView] = useState(null);
  const [AdminView, setAdminView] = useState(null);
  const [curGuid, setCurGuid] = useState(() => JSON.parse(localStorage.getItem('curGuid')) || "");
  

  useEffect(() => {
          localStorage.setItem('curGuid', JSON.stringify(curGuid));
          
      }, [curGuid]);

      useEffect(() => {
        
        if (searchParams.has("a")) {
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
    <div>      
      <main>  
      {ClientView ? <ClientView /> : (AdminView ? <AdminView /> : <p></p>)}     
      </main>      
    </div>
  );
};

export default App;