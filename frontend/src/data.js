// Al inicio del archivo
import foto1 from "./assets/foto1.jpg";
import foto4 from "./assets/foto4.jpg";
import foto5 from "./assets/foto5.jpg";

const data = [
  {
    id: 1,
    name: "Adriana",
    img: foto5,  // ← Usas la variable importada
    age: "25",
    des: "Estudiante joven apasionada..."
  },
  {
    id: 2,
    name: "Pepe",
    img: foto4,
    age: "22",
    des: "Estudiante joven apasionada..."
  },
  {
    id: 3,
    name: "Pedro",
    img: foto1,
    age: "32",
    des: "Estudiante joven apasionada..."
  }
];

export default data;