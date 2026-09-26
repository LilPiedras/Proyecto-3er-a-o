import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CrudCursos from './CrudCursos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Curso" element={<CrudCursos />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;