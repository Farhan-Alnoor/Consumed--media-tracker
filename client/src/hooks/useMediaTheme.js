import { useEffect } from "react";

export default function useMediatheme(type){

    useEffect(()=>{

        if (type) document.documentElement.dataset.media = type;
        return ()=>{
            delete document.documentElement.dataset.media;
        };



    },[type]);
}


