import { useProject } from '../../contexts/ProjectContext';
import { useTranslation } from 'react-i18next';
import { generateReport, exportToJSON, exportToCSV, downloadFile } from '../../utils/export';

interface ReportViewProps {
  onClose: () => void;
}

export default function ReportView({ onClose }: ReportViewProps) {
  const { currentProject } = useProject();
  const { t } = useTranslation();

  if (!currentProject) return null;

  const report = generateReport(currentProject);

  const handleExportJSON = () => {
    const json = exportToJSON(currentProject, report);
    downloadFile(json, `report_${currentProject.id}.json`, 'application/json');
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(currentProject);
    downloadFile(csv, `report_${currentProject.id}.csv`, 'text/csv');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('report.title')}</h1>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            {t('common.close')}
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">{t('report.statistics')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">{t('report.totalEntered')}</th>
                    <th className="border border-gray-300 p-2 text-left">{t('report.totalLate')}</th>
                    <th className="border border-gray-300 p-2 text-left">{t('report.totalAbsent')}</th>
                    <th className="border border-gray-300 p-2 text-left">{t('report.totalNotMarked')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td 
                      className="border border-gray-300 p-4 text-2xl font-bold text-center text-white"
                      style={{ backgroundColor: '#10b981' }}
                    >
                      {report.totalEntered}
                    </td>
                    <td 
                      className="border border-gray-300 p-4 text-2xl font-bold text-center text-white"
                      style={{ backgroundColor: '#eab308' }}
                    >
                      {report.totalLate}
                    </td>
                    <td 
                      className="border border-gray-300 p-4 text-2xl font-bold text-center text-white"
                      style={{ backgroundColor: '#ef4444' }}
                    >
                      {report.totalAbsent}
                    </td>
                    <td 
                      className="border border-gray-300 p-4 text-2xl font-bold text-center"
                      style={{ backgroundColor: '#e5e7eb', color: '#1f2937' }}
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
                      <th className="border border-gray-300 p-2 text-left">№</th>
                      <th className="border border-gray-300 p-2 text-left">ФИО</th>
                      <th className="border border-gray-300 p-2 text-left">Группа</th>
                      <th className="border border-gray-300 p-2 text-left">Опоздание (мин)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.lateParticipants.map((p, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-300 p-2">{p.bib}</td>
                        <td className="border border-gray-300 p-2">{p.surname} {p.name}</td>
                        <td className="border border-gray-300 p-2">{p.group}</td>
                        <td className="border border-gray-300 p-2">{p.delayMinutes || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {report.absentParticipants.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">{t('report.absentParticipants')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">№</th>
                      <th className="border border-gray-300 p-2 text-left">ФИО</th>
                      <th className="border border-gray-300 p-2 text-left">Группа</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.absentParticipants.map((p, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-300 p-2">{p.bib}</td>
                        <td className="border border-gray-300 p-2">{p.surname} {p.name}</td>
                        <td className="border border-gray-300 p-2">{p.group}</td>
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
                      <th className="border border-gray-300 p-2 text-left">№</th>
                      <th className="border border-gray-300 p-2 text-left">ФИО</th>
                      <th className="border border-gray-300 p-2 text-left">Группа</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.notMarkedParticipants.map((p, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-300 p-2">{p.bib}</td>
                        <td className="border border-gray-300 p-2">{p.surname} {p.name}</td>
                        <td className="border border-gray-300 p-2">{p.group}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <div className="flex gap-4 pt-4 border-t">
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {t('report.exportJSON')}
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {t('report.exportCSV')}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              {t('report.print')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

