import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CrudOferta from './CrudOferta';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Oferta" element={<CrudOferta />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;