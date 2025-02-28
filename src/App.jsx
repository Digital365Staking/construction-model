// App.jsx
import React from 'react';
import ClientView from './components/ClientView';
import InsertCommentButton from './components/InsertCommentButton';


const App = () => {
  return (
    <div>      
      <main>  
        <ClientView />        
      </main>      
    </div>
  );
};

export default App;