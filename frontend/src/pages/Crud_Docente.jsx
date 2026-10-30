import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CrudDocentes from './CrudDocentes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Docentes" element={<CrudDocentes />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;