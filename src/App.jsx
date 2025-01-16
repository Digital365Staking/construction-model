// App.jsx
import React from 'react';
import CommentListener from './components/CommentListener';
import InsertCommentButton from './components/InsertCommentButton';

const App = () => {
  return (
    <div>      
      <main>        
        <CommentListener />        
      </main>      
    </div>
  );
};

export default App;