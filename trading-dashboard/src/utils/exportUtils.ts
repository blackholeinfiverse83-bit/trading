export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

export const exportToJSON = (data: any, filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const formatPredictionForExport = (predictions: any[]) => {
  return predictions.map(p => ({
    Symbol: p.symbol,
    Action: p.action,
    'Current Price': p.current_price,
    'Predicted Price': p.predicted_price,
    'Predicted Return': `${p.predicted_return?.toFixed(2)}%`,
    'Confidence': `${(p.confidence * 100).toFixed(1)}%`,
    Timestamp: new Date(p.timestamp || Date.now()).toLocaleString()
  }));
};