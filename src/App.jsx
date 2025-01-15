// App.jsx
import React from 'react';
import CommentListener from './components/CommentListener';
import InsertCommentButton from './components/InsertCommentButton';

const App = () => {
  return (
    <div>      
      <main>
        <h1>Welcome to My React App</h1>
        <CommentListener />        
      </main>      
    </div>
  );
};

export default App;