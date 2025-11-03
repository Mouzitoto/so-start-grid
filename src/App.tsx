import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProjectProvider, useProject } from './contexts/ProjectContext';
import { useTranslation } from 'react-i18next';
import ProjectList from './components/ProjectList/ProjectList';
import StartGridView from './components/StartGridView/StartGridView';
import Instruction from './components/Instruction/Instruction';

function AppContent() {
  const { currentProject, language } = useProject();
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  return (
    <Routes>
      <Route path="/instruction" element={<Instruction />} />
      <Route 
        path="/" 
        element={
          !currentProject ? <ProjectList /> : <StartGridView />
        } 
      />
    </Routes>
  );
}

function App() {
  // В dev режиме basename пустой, в production на GitHub Pages - /so-start-grid
  const basename = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? '' 
    : '/so-start-grid';
  
  return (
    <BrowserRouter basename={basename}>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </BrowserRouter>
  );
}

export default App;

