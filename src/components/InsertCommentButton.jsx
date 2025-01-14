import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://ydxelzxjsuemylifgwte.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeGVsenhqc3VlbXlsaWZnd3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MDY4MzAsImV4cCI6MjA1MjE4MjgzMH0.Nnbgsp8NvJaD_DyXpsNwnvrdZUwZz4ylWzv7_fglxPo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const InsertCommentButton = () => {
    console.log('InsertCommentButton');
    const handleInsert = async () => {
      try {
        const { data, error } = await supabase
          .from('COMMENT')
          .insert([
            { some_column: 'someValue', other_column: 'otherValue' },
          ])
          .select();
  
        if (error) {
          console.error('Error inserting data:', error);
        } else {
          console.log('Data inserted successfully:', data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };
  
    return (
      <button onClick={handleInsert} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
        Insert Comment
      </button>
    );
  };

  export default InsertCommentButton;