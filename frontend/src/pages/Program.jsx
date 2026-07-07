import {easeInOut, motion as Motion} from "motion/react"

import image2 from "../assets/foto2.jpg"
import image3 from "../assets/foto3.jpg"
import image4 from "../assets/foto4.jpg"


const Program = () =>{
    return(
        <>
        <div className="main-program-div w-full lg:min-h-screen h-full flex flex-col justify-center items-center md:p-0 
        p-4 lg:mb-0 mb-8" id="Program">
            {/* Headings */}
            <div className="headings mb-3 lg:pt-0 pt-3">
                <Motion.h1 className="font-Jost text-xl xl:text-2xl mb-3 text-center"
                initial={{opacity:0,y:100}}
            whileInView={{opacity:1,y:0}}
            transition={{duration:0.6,ease:easeInOut, stiffness:60}}>Our Programs</Motion.h1>
                <Motion.h1 className="font-semibold text-3xl mb-3"initial={{opacity:0,y:100}}
            whileInView={{opacity:1,y:0}}
            transition={{duration:0.6,ease:easeInOut, stiffness:60}}>What we Offert</Motion.h1>
            </div>
            {/*imagen de Edgarcito*/}
            <div className="grid-container grid lg:grid-cols-3 place-items-center gap-5">
                <Motion.div className="first-div overflow-hidden" initial={{opacity:0,scale:0}}
            whileInView={{opacity:1,scale: 1}}
            transition={{duration:0.6,ease:easeInOut, stiffness:60}}>
                    <img src={image3} alt="" className="w-80 rounded-lg hover:scale-125 duration-300 ease-out"/>
                </Motion.div>
                <Motion.div className="second-div overflow-hidden"
                initial={{opacity:0,scale:0}}
            whileInView={{opacity:1,scale: 1}}
            transition={{duration:0.6,ease:easeInOut, stiffness:60}}>
                    <img src={image2} alt="" className="w-80 rounded-lg hover:scale-125 duration-300 ease-out" />
                </Motion.div>
                <Motion.div className="third-div overflow-hidden"
                initial={{opacity:0,scale:0}}
            whileInView={{opacity:1,scale: 1}}
            transition={{duration:0.6,ease:easeInOut, stiffness:60}}>
                    <img src={image4} alt="" className="w-80 rounded-lg hover:scale-125 duration-300 ease-out" />
                </Motion.div>
            </div>
        </div>
        </>
    )
}
export default Program