export interface District {
  name: string;
  code: string;
}

export interface State {
  name: string;
  code: string;
  districts: District[];
}

export const LOCATIONS: State[] = [
  {
    name: "Karnataka",
    code: "KA",
    districts: [
      { name: "Bangalore", code: "BL" },
      { name: "Mysore", code: "MY" },
      { name: "Mangalore", code: "MN" },
      { name: "Hubli-Dharwad", code: "HU" },
      { name: "Belgaum", code: "BG" },
      { name: "Gulbarga", code: "GL" },
      { name: "Davanagere", code: "DV" },
      { name: "Bellary", code: "BY" },
      { name: "Shimoga", code: "SM" },
      { name: "Tumkur", code: "TK" },
    ],
  },
  {
    name: "Andhra Pradesh",
    code: "AP",
    districts: [
      { name: "Kurnool", code: "KN" },
      { name: "Guntur", code: "GT" },
      { name: "Anantapur", code: "AN" },
      { name: "Nellore", code: "NE" },
      { name: "Vijayawada", code: "VI" },
      { name: "Visakhapatnam", code: "VS" },
      { name: "Chittoor", code: "CT" },
      { name: "Kadapa", code: "KD" },
      { name: "Tirupati", code: "TP" },
      { name: "Kakinada", code: "KK" },
    ],
  },
  {
    name: "Tamil Nadu",
    code: "TN",
    districts: [
      { name: "Chennai", code: "CH" },
      { name: "Coimbatore", code: "CO" },
      { name: "Madurai", code: "MA" },
      { name: "Tiruchirappalli", code: "TI" },
      { name: "Salem", code: "SA" },
      { name: "Erode", code: "ER" },
      { name: "Tiruppur", code: "TR" },
      { name: "Vellore", code: "VE" },
      { name: "Thanjavur", code: "TH" },
      { name: "Tuticorin", code: "TU" },
    ],
  },
  {
    name: "Maharashtra",
    code: "MH",
    districts: [
      { name: "Mumbai", code: "MU" },
      { name: "Pune", code: "PU" },
      { name: "Nagpur", code: "NA" },
      { name: "Nashik", code: "NS" },
      { name: "Thane", code: "TH" },
      { name: "Aurangabad", code: "AU" },
      { name: "Solapur", code: "SO" },
      { name: "Amravati", code: "AM" },
      { name: "Kolhapur", code: "KO" },
      { name: "Akola", code: "AK" },
    ],
  },
  {
    name: "Uttar Pradesh",
    code: "UP",
    districts: [
      { name: "Lucknow", code: "LU" },
      { name: "Kanpur", code: "KA" },
      { name: "Ghaziabad", code: "GH" },
      { name: "Agra", code: "AG" },
      { name: "Varanasi", code: "VA" },
      { name: "Meerut", code: "ME" },
      { name: "Prayagraj", code: "PR" },
      { name: "Bareilly", code: "BA" },
      { name: "Aligarh", code: "AL" },
      { name: "Moradabad", code: "MO" },
    ],
  },
  {
    name: "Telangana",
    code: "TG",
    districts: [
      { name: "Hyderabad", code: "HY" },
      { name: "Warangal", code: "WA" },
      { name: "Nizamabad", code: "NI" },
      { name: "Karimnagar", code: "KA" },
      { name: "Ramagundam", code: "RA" },
      { name: "Khammam", code: "KH" },
      { name: "Mahbubnagar", code: "MA" },
      { name: "Nalgonda", code: "NA" },
      { name: "Adilabad", code: "AD" },
      { name: "Suryapet", code: "SU" },
    ],
  },
];
