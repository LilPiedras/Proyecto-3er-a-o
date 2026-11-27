import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CrudModuloMateria from './CrudMateriamodulo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Materia Modulo" element={<CrudModuloMateria />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;