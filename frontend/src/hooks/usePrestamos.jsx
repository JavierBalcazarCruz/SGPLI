import { useContext } from 'react';
import PrestamosContext from '../context/PrestamosProvider';

const usePrestamos = () => {
    return useContext(PrestamosContext);
};

export default usePrestamos;