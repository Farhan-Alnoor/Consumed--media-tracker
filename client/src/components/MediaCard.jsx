import Poster from"./Poster.jsx"
import { Link } from "react-router-dom";
const LABELS = {
  idle: "Add to list",
  adding: "Adding...",
  added: "Added ✓",
  exists: "In your list",
  error: "Failed, retry",
};



export default function MediaCard({item,state="idle",onAdd}){

    const year = item.releaseDate ? item.releaseDate.slice(0,4):"Unkown";
    const done = state === "added" || state ==="exists";
    const href = `/media/${item.type}/${item.externalId}`;

    return(
        <div className ="media-card">
           <Poster item = {item} href = {href}></Poster>
            <div className="media-info">
                <h3><Link to ={href}>{item.title}</Link></h3>
                <span className="muted">{year}</span>
                <button 
                    className={done? "ghost":""}
                    disabled ={state === "adding"||done}
                    onClick={()=> onAdd(item)}
                    >
                     {LABELS[state]}   
                    </button>
            </div>


        </div>
    );

}