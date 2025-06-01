
// Namibian location utilities and validation
export interface NamibianLocation {
  city: string;
  district: string;
  suburb?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface ServiceArea {
  id: string;
  name: string;
  city: string;
  district: string;
  suburbs: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  radius: number; // in kilometers
  priceAdjustment: number; // percentage adjustment
}

// Major Namibian cities and districts
export const NAMIBIAN_CITIES = {
  windhoek: {
    name: 'Windhoek',
    districts: [
      'Central',
      'Katutura',
      'Khomasdal',
      'Olympia',
      'Pioneerspark',
      'Dorado Park',
      'Kleine Kuppe',
      'Ludwigsdorf',
      'Academia',
      'Eros',
      'Klein Windhoek',
      'Hochland Park'
    ],
    coordinates: { lat: -22.5609, lng: 17.0658 }
  },
  walvisBay: {
    name: 'Walvis Bay',
    districts: [
      'Central',
      'Kuisebmond',
      'Narraville',
      'Meersig',
      'Flamingo',
      'Langstrand'
    ],
    coordinates: { lat: -22.9576, lng: 14.5052 }
  },
  swakopmund: {
    name: 'Swakopmund',
    districts: [
      'Central',
      'Mondesa',
      'Tamariskia',
      'Vineta',
      'Kramersdorf',
      'DRC'
    ],
    coordinates: { lat: -22.6792, lng: 14.5272 }
  }
};

// Service areas with pricing adjustments
export const SERVICE_AREAS: ServiceArea[] = [
  // Windhoek areas
  {
    id: 'windhoek-central',
    name: 'Windhoek Central',
    city: 'Windhoek',
    district: 'Central',
    suburbs: ['CBD', 'Stadt', 'Ausspannplatz'],
    coordinates: { lat: -22.5609, lng: 17.0658 },
    radius: 5,
    priceAdjustment: 0
  },
  {
    id: 'windhoek-suburbs',
    name: 'Windhoek Suburbs',
    city: 'Windhoek',
    district: 'Suburbs',
    suburbs: ['Eros', 'Klein Windhoek', 'Olympia', 'Pioneerspark'],
    coordinates: { lat: -22.5609, lng: 17.0658 },
    radius: 15,
    priceAdjustment: 10
  },
  {
    id: 'windhoek-northern',
    name: 'Northern Windhoek',
    city: 'Windhoek',
    district: 'Northern',
    suburbs: ['Katutura', 'Wanaheda', 'Goreangab'],
    coordinates: { lat: -22.5200, lng: 17.0400 },
    radius: 20,
    priceAdjustment: 15
  },
  // Walvis Bay areas
  {
    id: 'walvis-central',
    name: 'Walvis Bay Central',
    city: 'Walvis Bay',
    district: 'Central',
    suburbs: ['CBD', 'Civic Centre'],
    coordinates: { lat: -22.9576, lng: 14.5052 },
    radius: 8,
    priceAdjustment: 5
  },
  {
    id: 'walvis-residential',
    name: 'Walvis Bay Residential',
    city: 'Walvis Bay',
    district: 'Residential',
    suburbs: ['Kuisebmond', 'Narraville', 'Meersig'],
    coordinates: { lat: -22.9700, lng: 14.5100 },
    radius: 12,
    priceAdjustment: 8
  },
  // Swakopmund areas
  {
    id: 'swakop-central',
    name: 'Swakopmund Central',
    city: 'Swakopmund',
    district: 'Central',
    suburbs: ['CBD', 'Vineta'],
    coordinates: { lat: -22.6792, lng: 14.5272 },
    radius: 6,
    priceAdjustment: 0
  }
];

// Phone number validation for Namibia (+264)
export const validateNamibianPhone = (phone: string): boolean => {
  // Remove spaces, dashes, and brackets
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check for +264 country code
  if (cleaned.startsWith('+264')) {
    const number = cleaned.substring(4);
    return /^[0-9]{8,9}$/.test(number);
  }
  
  // Check for local format (without country code)
  if (cleaned.startsWith('0')) {
    return /^0[0-9]{8}$/.test(cleaned);
  }
  
  // Check for international format without +
  if (cleaned.startsWith('264')) {
    const number = cleaned.substring(3);
    return /^[0-9]{8,9}$/.test(number);
  }
  
  return false;
};

// Format phone number to Namibian standard
export const formatNamibianPhone = (phone: string): string => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  if (cleaned.startsWith('+264')) {
    const number = cleaned.substring(4);
    return `+264 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
  }
  
  if (cleaned.startsWith('0')) {
    return `+264 ${cleaned.substring(1, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  
  return phone;
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Check if location is within service area
export const isLocationInServiceArea = (
  location: { lat: number; lng: number },
  serviceArea: ServiceArea
): boolean => {
  const distance = calculateDistance(
    location.lat,
    location.lng,
    serviceArea.coordinates.lat,
    serviceArea.coordinates.lng
  );
  return distance <= serviceArea.radius;
};

// Find closest service area
export const findClosestServiceArea = (
  location: { lat: number; lng: number }
): ServiceArea | null => {
  let closest: ServiceArea | null = null;
  let minDistance = Infinity;

  for (const area of SERVICE_AREAS) {
    const distance = calculateDistance(
      location.lat,
      location.lng,
      area.coordinates.lat,
      area.coordinates.lng
    );
    
    if (distance <= area.radius && distance < minDistance) {
      minDistance = distance;
      closest = area;
    }
  }

  return closest;
};

// Calculate price adjustment based on location
export const calculateLocationPriceAdjustment = (
  basePrice: number,
  location: { lat: number; lng: number }
): number => {
  const serviceArea = findClosestServiceArea(location);
  if (!serviceArea) return basePrice;
  
  return basePrice + (basePrice * serviceArea.priceAdjustment / 100);
};

// Validate Namibian address format
export const validateNamibianAddress = (address: {
  street: string;
  suburb?: string;
  city: string;
  postalCode?: string;
}): boolean => {
  if (!address.street || !address.city) return false;
  
  // Check if city exists in our system
  const cityExists = Object.values(NAMIBIAN_CITIES).some(
    city => city.name.toLowerCase() === address.city.toLowerCase()
  );
  
  if (!cityExists) return false;
  
  // Postal code validation (optional, but if provided should be 5 digits)
  if (address.postalCode && !/^\d{5}$/.test(address.postalCode)) {
    return false;
  }
  
  return true;
};

// Format NAD currency
export const formatNAD = (amount: number): string => {
  return new Intl.NumberFormat('en-NA', {
    style: 'currency',
    currency: 'NAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Business hours for Namibian market
export const NAMIBIAN_BUSINESS_HOURS = {
  weekdays: { start: '08:00', end: '17:00' },
  saturday: { start: '08:00', end: '13:00' },
  sunday: { start: null, end: null }, // Closed
  publicHolidays: [
    '2024-01-01', // New Year's Day
    '2024-03-21', // Independence Day
    '2024-03-29', // Good Friday
    '2024-04-01', // Easter Monday
    '2024-05-01', // Workers' Day
    '2024-05-04', // Cassinga Day
    '2024-05-09', // Ascension Day
    '2024-05-25', // Africa Day
    '2024-08-26', // Heroes' Day
    '2024-12-10', // Human Rights Day
    '2024-12-25', // Christmas Day
    '2024-12-26', // Boxing Day
  ]
};

// Check if date is a business day
export const isBusinessDay = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  const dateString = date.toISOString().split('T')[0];
  
  // Check if it's a weekend
  if (dayOfWeek === 0) return false; // Sunday
  
  // Check if it's a public holiday
  if (NAMIBIAN_BUSINESS_HOURS.publicHolidays.includes(dateString)) {
    return false;
  }
  
  return true;
};

// Get available time slots for a date
export const getAvailableTimeSlots = (date: Date): string[] => {
  const dayOfWeek = date.getDay();
  const slots: string[] = [];
  
  let hours;
  if (dayOfWeek === 0) { // Sunday
    return []; // Closed
  } else if (dayOfWeek === 6) { // Saturday
    hours = NAMIBIAN_BUSINESS_HOURS.saturday;
  } else { // Weekdays
    hours = NAMIBIAN_BUSINESS_HOURS.weekdays;
  }
  
  if (!hours.start || !hours.end) return [];
  
  const startHour = parseInt(hours.start.split(':')[0]);
  const endHour = parseInt(hours.end.split(':')[0]);
  
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  
  return slots;
};
