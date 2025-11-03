import { Project } from '../../types/project';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const participantCount = project.raceData.persons.length;
  const dateTime = new Date(project.createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
      style={{ padding: '5px' }}
    >
      <h3 className="text-lg font-semibold mb-2 text-gray-800 truncate">
        {project.name}
      </h3>
      <div className="text-sm text-gray-600 space-y-1">
        <p>Создан: {dateTime}</p>
        <p>Участников: {participantCount}</p>
      </div>
    </div>
  );
}

