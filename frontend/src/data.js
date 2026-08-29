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
    des: "Sueño con ser una diseñadora y gracias a la Academia puedo lograrlo debido a su buen contenido y los excelentes profesores que cuentan."
  },
  {
    id: 2,
    name: "Pepe",
    img: foto4,
    age: "22",
    des: "Quiero ser un diseñador de modas y pude entrar a la Academia Amada Fashion la cual tiene un excelente contenido pedagogico"
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