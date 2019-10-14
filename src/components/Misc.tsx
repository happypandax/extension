import React from 'react';

export const ErrorMessage = (props) => {
    return (
        <div className="ui error message">{props.children}</div>
    )
}