import React from "react";

// WordIcon.jsx
const WordIcon = ({ size = 48 }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
    >
      <path fill="#2b579a" d="M8 4h24l8 8v32a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z" />
      <path fill="#ffffff" d="M32 4v8h8" />
      <path fill="#ffffff" d="M12 20h4l2 8 2-8h4l2 8 2-8h4l-4 12h-4l-2-6-2 6h-4l-4-12z" />
      <path fill="#2b579a" d="M10 36h28v2H10zM10 40h28v2H10z" />
    </svg>
  );
  
  export default WordIcon;