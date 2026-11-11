import react from "react"
import { Link } from "react-router-dom"

export default function Poster(props){
    return(<Link to = {props.href}>{props.item.posterUrl?(
                <img src = {props.item.posterUrl} alt = {props.item.title} loading = "lazy"/>
            ):(<div className="poster-placeholder">No image 
            </div>)}
            </Link>)
}