import React from 'react'

const ReceiverIcon = (props) => {
  return (
    <div className='active-receiver' key={props.key}>
       <form>
        <p>{props.sessionID.id}</p>
        <input type="file" />
        <input type="submit" />
       </form>
    </div>
  )
}

export default ReceiverIcon