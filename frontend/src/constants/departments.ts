export const departments = [
  { id: 'CE', name: 'Computer Science & Engineering' },
  { id: 'MN', name: 'Mining Engineering' },
  { id: 'MC', name: 'Mechanical Engineering' },
  { id: 'EL', name: 'Electrical Engineering' },
  { id: 'GM', name: 'Geomatic Engineering' },
  { id: 'SD', name: 'Statistical Data Science' },
  { id: 'CY', name: 'Cybersecurity' },
  { id: 'PE', name: 'Petroleum Engineering' },
  { id: 'RP', name: 'Petroleum Refining and Petrochemical Engineering' },
  { id: 'GL', name: 'Geological Engineering' },
  { id: 'ME', name: 'Minerals Engineering' },
  { id: 'RN', name: 'Renewable Engineering' },
  { id: 'GM', name: 'Geomatic Engineering' },
  { id: 'IS', name: 'Information Systems' },
  { id: 'CH', name: 'Chemical Engineering' },
  { id: 'MA', name: 'Mathematics' },
  { id: 'ES', name: 'Environmental & Safety Engineering' },
  { id: 'LT', name: 'Logistics & Transportation' },
] as const;

export const years = [
    { id: 1, name: '100' },
    { id: 2, name: '200' },
    { id: 3, name: '300' },
    { id: 4, name: '400' },
] as const;

export type Department = typeof departments[number]['id'];
export type Year = typeof years[number]; 