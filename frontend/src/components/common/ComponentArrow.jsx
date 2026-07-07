import { useEffect, useState } from "react";
import { FaLongArrowAltUp } from "react-icons/fa";

const BotonArrow = () =>{
    const [Scroll,setScroll] = useState(false)

    useEffect(() =>{
        window.addEventListener("scroll", () =>{
            if(window.scrollY>300){
                setScroll(true)
            }else{
                setScroll(false)
            }
        })
    },[])

    const bottomtop = () =>{
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }
    return(
        <>
        <div className="main-botonarrow fixed bottom-10 z-10 right-5">
            {Scroll && (<div className="child-div bg-blue-500 w-10 h-10 flex justify-center items-center rounded-full active:scale-90
             duration-500 ease-out shadow-md">
                <FaLongArrowAltUp className="text-2xl text-white " onClick={bottomtop}/>
            </div>)}
        </div>
        </>
    )
}

export default BotonArrow;