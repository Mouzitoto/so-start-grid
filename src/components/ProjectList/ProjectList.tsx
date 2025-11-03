import { useProject } from '../../contexts/ProjectContext';
import { useTranslation } from 'react-i18next';
import FileUploader from '../FileUploader/FileUploader';
import ProjectCard from './ProjectCard';

export default function ProjectList() {
  const { projects, selectProject } = useProject();
  const { t } = useTranslation();

  const handleProjectClick = (projectId: string) => {
    selectProject(projectId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">SO Start Grid</h1>
        
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <p className="text-gray-600 mb-8 text-center" style={{ marginBottom: '1rem' }}>{t('project.createFirst')}</p>
            <FileUploader />
          </div>
        ) : (
          <>
            <div className="flex justify-end" style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
              <FileUploader />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
              {[...projects].sort((a, b) => b.createdAt - a.createdAt).map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => handleProjectClick(project.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

