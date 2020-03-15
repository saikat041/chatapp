import React from "react";

const style = {
    textAlign:'center',
    padding: '9px',
    backgroundColor: '#1976d2',
    color: 'white',
    fontSize:'20px',
    marginBottom: '15px',
    borderRadius:'5px'
}
export default function Alert(props) {
    const { message } = props;
    return (
        <div style={style}>
            {message}
        </div>
    );
}
