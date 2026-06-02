import XLSX from 'xlsx';
import * as fs from 'fs';

// Ruta de tu archivo .xls
const filePath = './direcciones.xls';

// Leer el archivo
const workbook = XLSX.readFile(filePath);

// Tomamos la primera hoja
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convertir la hoja a JSON
const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

// Guardar en JSON
fs.writeFileSync('./addresses.json', JSON.stringify(data, null, 2));

console.log('Archivo JSON generado con éxito!');