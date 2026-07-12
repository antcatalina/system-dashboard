import { ThemeProvider } from './presentation/context/ThemeContext';
import { DashboardPage } from './presentation/pages/DashboardPage';

export default function App(): JSX.Element {
  return (
    <ThemeProvider>
      <DashboardPage />
    </ThemeProvider>
  );
}