import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export function show_alert(mensaje, icono, foco = '') {
    MySwal.fire({
        title: mensaje,
        icon: icono
    });

    if (foco !== '') {
        const elemento = document.getElementById(foco);
        if (elemento) elemento.focus();
    }
}