import { useEffect } from 'react';
import { ProjectProvider, useProject } from './contexts/ProjectContext';
import { useTranslation } from 'react-i18next';
import ProjectList from './components/ProjectList/ProjectList';
import StartGridView from './components/StartGridView/StartGridView';

function AppContent() {
  const { currentProject, language } = useProject();
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  if (!currentProject) {
    return <ProjectList />;
  }

  return <StartGridView />;
}

function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}

export default App;

