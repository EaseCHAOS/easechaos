export const departments = [
  { id: "MN", name: "Mining Engineering" },
  { id: "MR", name: "Minerals Engineering" },
  { id: "MC", name: "Mechanical Engineering" },
  { id: "EL", name: "Electrical Engineering" },
  { id: "RN", name: "Renewable Engineering" },
  { id: "TC", name: "Telecommunication Engineering (New)" },
  { id: "CE", name: "Computer Science & Engineering" },
  { id: "CY", name: "Cybersecurity" },
  { id: "IS", name: "Information Systems" },
  { id: "MA", name: "Mathematics" },
  { id: "SD", name: "Statistical Data Science" },
  { id: "RB", name: "Robotics Engineering and Artificial Intelligence (New)" },
  { id: "LT", name: "Logistics & Transportation" },
  { id: "EC", name: "Economics and Industrial Organization" },
  { id: "FD", name: "Finance and Data Science (New)" },
  { id: "GM", name: "Geomatic Engineering" },
  { id: "GL", name: "Geological Engineering" },
  { id: "SP", name: "Spatial Planning (New)" },
  { id: "ES", name: "Environmental & Safety Engineering" },
  { id: "LA", name: "Land Administration" },
  { id: "PE", name: "Petroleum Engineering" },
  { id: "NG", name: "Natural Gas Engineering" },
  { id: "PG", name: "Petroleum Geosciences" },
  { id: "RP", name: "Petroleum Refining and Petrochemical Engineering" },
  { id: "CH", name: "Chemical Engineering" }
] as const;


export const years = [
  { id: 1, name: "100" },
  { id: 2, name: "200" },
  { id: 3, name: "300" },
  { id: 4, name: "400" },
] as const;

export type Department = (typeof departments)[number]["id"];
export type Year = (typeof years)[number];
