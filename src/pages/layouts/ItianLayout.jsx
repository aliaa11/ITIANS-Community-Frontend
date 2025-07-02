import { Outlet } from 'react-router-dom';
import ItianNavbar from '../../components/ItianNavbar';

export default function ItianLayout() {
  return (
    <>
      <ItianNavbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
