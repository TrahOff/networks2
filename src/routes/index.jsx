import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Tables from '../pages/Tables';
import Login from '../pages/users/Login';
import Students from '../pages/Students';
// import User from '../pages/users/users';
import Scholarship from '../pages/Base_scholarship';
import Groups from '../pages/Groupes';

export const RouterConfig = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route path="/tables" element={
          <Layout>
            <Tables />
          </Layout>
        } />
        <Route path="/login" element={
          <Layout>
            <Login />
          </Layout>
        } />
        <Route path="/students" element={
          <Layout>
            <Students />
          </Layout>
        } />
        <Route path="/base_scholarship" element={
          <Layout>
            <Scholarship />
          </Layout>
        } />
        <Route path="/groups" element={
          <Layout>
            <Groups />
          </Layout>
        } />
        {/* <Route path="/users" element={
          <Layout>
            <User />
          </Layout>
        } />
         */}
      </Routes>
    </BrowserRouter>
  );
};