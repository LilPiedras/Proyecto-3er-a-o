import CarouselModule from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import data from "../data.js"
import { IoThermometerSharp } from "react-icons/io5";
import {easeInOut, motion as Motion} from "motion/react"

const Carousel = CarouselModule.default || CarouselModule;

const Testimonials = () => {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    }
  };

  console.log("¿Qué es Carrousel?:", Carousel);

  return (
    <>
      <div className="main-testimonial-div lg:min-h-screen w-full flex flex-col justify-center items-center p-3 overflow-hidden" id="Testimonials">
        <div className="headings mb-5">
          <Motion.h1 className="text-xl font-Jost mb-2 text-center"
          initial={{opacity:0,y:100}}
            whileInView={{opacity:1,y:0}}
            transition={{duration:0.9,ease:easeInOut, stiffness:60}}>Testimonios</Motion.h1>
          <h1>¿Que dicen nuestros estudiantes?</h1>
        </div>
        
        <div className="carousel-div w-full relative">
          <Carousel 
            showDots={true}
            responsive={responsive}
            infinite={true}
            autoPlay={true}
            autoPlaySpeed={2000}
            keyBoardControl={true}
            customTransition="all 1s ease-in-out"
            transitionDuration={1000}
            containerClass="carousel-container"
            removeArrowOnDeviceType={["tablet", "mobile", "desktop"]}
            dotListClass="custom-dot-list-style"
            renderDotsOutside={true}
            itemClass="carousel-item-padding-40-px"
          >
            {data.map((items) => (
              <div key={items.id} className="p-5 md:mr-4 rounded-2xl shadow-md bg-blue-400 relative">
                <div className="sideby-side flex gap-6 mb-3">
                  <img src={items.img} alt="" className="w-20 rounded-full" />
                  <div className="headings">
                    <h1 className="text-xl font-semibold font-Inter mb-1">{items.name}</h1>
                    <h1 className="font-Jost">{items.age}</h1>
                  </div>
                </div>
                <div className="para">
                  <p className="font-Jost">Lorem ipsum dolor sit amet, consectetur adipisicing elit. 
                    Amet dignissimos officiis qui cupiditate veritatis doloremque, aut modi at totam rerum accusantium.  
                    Sapiente a eos facere id commodi aliquid iusto iste.</p>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </>
  );
};

export default Testimonials;