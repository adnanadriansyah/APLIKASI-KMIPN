export default function Table({ columns, data, emptyText = 'Tidak ada data' }) {
  if (!data?.length) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">{emptyText}</div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((col) => (
              <th key={col.key} className="text-left py-3 px-4 font-medium text-gray-500">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id ?? i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4 text-gray-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
