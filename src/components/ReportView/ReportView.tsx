import { useProject } from '../../contexts/ProjectContext';
import { useTranslation } from 'react-i18next';
import { generateReport, exportToTXT, downloadFile } from '../../utils/export';

interface ReportViewProps {
  onClose: () => void;
}

export default function ReportView({ onClose }: ReportViewProps) {
  const { currentProject } = useProject();
  const { t } = useTranslation();

  if (!currentProject) return null;

  const report = generateReport(currentProject);

  const handleShare = async () => {
    if (!navigator.share) {
      // Если Web Share API не поддерживается, скачиваем файл
      const txt = exportToTXT(currentProject);
      downloadFile(txt, `report_${currentProject.id}.txt`, 'text/plain');
      return;
    }

    try {
      // Создаем TXT файл для шаринга
      const txt = exportToTXT(currentProject);
      const blob = new Blob([txt], { type: 'text/plain' });
      const file = new File([blob], `report_${currentProject.id}.txt`, { type: 'text/plain' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${currentProject.name} - ${t('report.title')}`,
          text: t('report.title'),
          files: [file]
        });
      } else {
        // Если нельзя шарить файл, шарим текст
        await navigator.share({
          title: `${currentProject.name} - ${t('report.title')}`,
          text: txt
        });
      }
    } catch (error) {
      // Пользователь отменил шаринг или произошла ошибка
      // Можно показать уведомление, но не обязательно
      console.error('Ошибка при шаринге:', error);
    }
  };

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto" style={{ padding: '1rem', height: '100vh' }}>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <button
            onClick={handleShare}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            style={{ padding: 'calc(0.5rem * 1.3) calc(1rem * 1.3)', fontSize: 'calc(1rem * 1.3)' }}
          >
            {t('common.export')}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            style={{ padding: 'calc(0.5rem * 1.3) calc(1rem * 1.3)', fontSize: 'calc(1rem * 1.3)' }}
          >
            {t('common.close')}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <section>
            <h2 className="text-xl font-semibold mb-4">{t('report.statistics')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 text-left" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem' }}>{t('report.totalEntered')}</th>
                    <th className="border border-gray-300 text-left" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem' }}>{t('report.totalLate')}</th>
                    <th className="border border-gray-300 text-left" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem' }}>{t('report.totalAbsent')}</th>
                    <th className="border border-gray-300 text-left" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem' }}>{t('report.totalNotMarked')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td 
                      className="border border-gray-300 text-2xl font-bold text-center text-white"
                      style={{ backgroundColor: '#10b981', paddingLeft: '0.2rem', paddingRight: '0.2rem' }}
                    >
                      {report.totalEntered}
                    </td>
                    <td 
                      className="border border-gray-300 text-2xl font-bold text-center text-white"
                      style={{ backgroundColor: '#eab308', paddingLeft: '0.2rem', paddingRight: '0.2rem' }}
                    >
                      {report.totalLate}
                    </td>
                    <td 
                      className="border border-gray-300 text-2xl font-bold text-center text-white"
                      style={{ backgroundColor: '#ef4444', paddingLeft: '0.2rem', paddingRight: '0.2rem' }}
                    >
                      {report.totalAbsent}
                    </td>
                    <td 
                      className="border border-gray-300 text-2xl font-bold text-center"
                      style={{ backgroundColor: '#e5e7eb', color: '#1f2937', paddingLeft: '0.2rem', paddingRight: '0.2rem' }}
                    >
                      {report.totalNotMarked}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {report.lateParticipants.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">{t('report.lateParticipants')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 text-left" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>№</th>
                      <th className="border border-gray-300 text-left" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>ФИО</th>
                      <th className="border border-gray-300 text-left" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>Группа</th>
                      <th className="border border-gray-300 text-left" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>Опоздание (мин)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.lateParticipants.map((p, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-300" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>{p.bib}</td>
                        <td className="border border-gray-300" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>{p.surname} {p.name}</td>
                        <td className="border border-gray-300" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>{p.group}</td>
                        <td className="border border-gray-300" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>{p.delayMinutes || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {report.absentParticipants.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4" style={{ marginBottom: '0.1rem' }}>{t('report.absentParticipants')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 text-left" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>№</th>
                      <th className="border border-gray-300 text-left" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>ФИО</th>
                      <th className="border border-gray-300 text-left" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>Группа</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.absentParticipants.map((p, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-300" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>{p.bib}</td>
                        <td className="border border-gray-300" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>{p.surname} {p.name}</td>
                        <td className="border border-gray-300" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>{p.group}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {report.notMarkedParticipants.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">{t('report.notMarkedParticipants')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 text-left" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>№</th>
                      <th className="border border-gray-300 text-left" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>ФИО</th>
                      <th className="border border-gray-300 text-left" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>Группа</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.notMarkedParticipants.map((p, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-300" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>{p.bib}</td>
                        <td className="border border-gray-300" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>{p.surname} {p.name}</td>
                        <td className="border border-gray-300" style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', paddingBottom: '0.1rem' }}>{p.group}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

