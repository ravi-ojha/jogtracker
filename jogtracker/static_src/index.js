import React from 'react';
import ReactDOM from 'react-dom';
import {CommentSection} from './components.js';


ReactDOM.render(
  <CommentSection user_id={user_id} />,
  document.getElementById('root-container')
);
