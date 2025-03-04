// App.jsx
import React, { useState, useEffect } from 'react';
//import ClientView from './components/ClientView';
import AdminView from './components/AdminView';


const App = () => {
  const [curGuid, setCurGuid] = useState(() => JSON.parse(localStorage.getItem('curGuid')) || "");

  useEffect(() => {
          localStorage.setItem('curGuid', JSON.stringify(curGuid));
          
      }, [curGuid]);

  return (
    <div>      
      <main>  
        {curGuid !== "" && (<AdminView />)} 
        {curGuid === "" && (<AdminView />)}       
      </main>      
    </div>
  );
};

export default App;