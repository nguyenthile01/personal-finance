import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  date: string,
  formatType: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' = 'DD/MM/YYYY'
) {
  if (!date) return;
  const [year, month, day] = date.split('T')[0].split('-');

  switch (formatType) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

export function exportToExcel<T extends object>(data: T[], header: string[], filename: string, sheetName: string = "Data") {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }
  // Convert JSON -> worksheet
  const wookbook: XLSX.WorkBook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([header, ...data.map(item => Object.values(item))]);
  XLSX.utils.book_append_sheet(wookbook, worksheet, sheetName);

  // Generate binary string and trigger download
  const wbout = XLSX.write(wookbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  console.log(formatDate(new Date().toLocaleString(), "DD/MM/YYYY"))
  saveAs(blob, `${filename}_${format(new Date(), "P")}.xlsx`);
}

