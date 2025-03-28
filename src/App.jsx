import { RouterConfig } from './routes';
import { CookiesProvider } from 'react-cookie';

function App() {
  return (
    <CookiesProvider>
      <RouterConfig />
    </CookiesProvider>);
}

export default App;