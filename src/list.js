import React,{useState,useEffect} from 'react'


export default function List({getItems}){
    const[lists,setlists]=useState([])

    useEffect(()=>{
            setlists(getItems())
    },[getItems]);
    return lists.map(list => <div key={list}>{list}</div>)
}