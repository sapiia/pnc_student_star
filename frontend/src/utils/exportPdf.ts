export const exportToPDF = (elementId: string, filename: string = 'report') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found for PDF export');
    }

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    const elementClone = element.cloneNode(true) as HTMLElement;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #1e293b;
              background: white;
            }
            @media print { 
              body { margin: 10mm; }
              .no-print { display: none !important; }
              @page { margin: 10mm; }
            }
            h1, h2, h3 { color: #0f172a; }
            .bg-white { background: white !important; }
            .bg-slate-50 { background: white !important; }
            .border-slate-200 { border: 1px solid #e2e8f0 !important; }
            .text-slate-900 { color: #0f172a !important; }
            .text-slate-500 { color: #64748b !important; }
            .text-primary { color: #5d5fef !important; }
            .text-emerald-600 { color: #059669 !important; }
            .text-rose-600 { color: #dc2626 !important; }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 30px;">${filename}</h1>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 20px;">
            Generated on: ${new Date().toLocaleString()}
          </div>
          ${elementClone.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);

    return true;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return false;
  }
};
