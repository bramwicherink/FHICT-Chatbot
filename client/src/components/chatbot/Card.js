import React from 'react';

const Card = (props) => {
    <div style={{ float: "left", paddingRight: 30, width: 270 }}>
        <div className="card-image">
        <img alt={props.payload.fields.header.stringValue} src={props.payload.fields.image}/>
        </div>
      <div className="card-stacked">
        <div className="card-content">
          <p>{props.payload.fields.header.stringValue}</p>
        </div>
        <div className="card-action">
          <a target="_blank" href={props.payload.fields.link.stringValue}>{props.payload.fields.header.stringValue}</a>
        </div>
      </div>
    </div>
}

export default Card;