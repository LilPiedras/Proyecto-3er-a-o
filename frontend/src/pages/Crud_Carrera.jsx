import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CrudCarrera from './CrudCarrera';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Carreras" element={<CrudCarrera />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;