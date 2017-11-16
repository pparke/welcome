import React from 'react';
import '../scss/page.scss';

const Page = ({title, children}) => (
  <div className='page'>
    { children }
  </div>
);

export default Page;
