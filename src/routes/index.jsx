import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Tables from '../pages/Tables';
import Login from '../pages/users/Login';
import Students from '../pages/Students';
import Scholarship from '../pages/Base_scholarship';
import Groups from '../pages/Groupes';
import Register from '../pages/users/Register';
import Profile from '../pages/users/Profile';
import UniversityCoefficient from '../pages/UniversityCoefficient';

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
        <Route path="/register" element={
          <Layout>
            <Register />
          </Layout>
        } />
        <Route path="/profile" element={
          <Layout>
            <Profile />
          </Layout>
        } />
        <Route path="/university_coefficient" element={
          <Layout>
            <UniversityCoefficient />
          </Layout>
        } />


      </Routes>
    </BrowserRouter>
  );
};