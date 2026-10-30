import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CrudEstudiantes from './CrudEstudiantes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Estudiantes" element={<CrudEstudiantes />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;