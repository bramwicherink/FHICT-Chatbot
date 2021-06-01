import React from 'react';

const Card = (props) => {
  return (
  <div style={{ width: 270, paddingRight: 30}}>
    <div className="card">
        <div className="card-image">
          <img alt={props.payload.fields.icon.stringValue} src={props.payload.fields.icon.stringValue}></img>
          <span className="card-title">{props.payload.fields.header.stringValue}</span>
    </div>
        <div className="card-action">
          <a href="_blank">{props.payload.fields.header.stringValue}</a>
        </div>
  </div>
  </div>
  );
  };


export default Card;