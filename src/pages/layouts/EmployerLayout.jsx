import { Outlet } from 'react-router-dom';
import EmployerNavbar from '../../components/EmployerNavbar';

export default function EmployerLayout() {
  return (
    <>
      <EmployerNavbar />
      <main >
        <Outlet />
      </main>
    </>
  );
}
