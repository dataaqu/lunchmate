export interface DistrictCoords {
  latitude: number;
  longitude: number;
  radius: number; // metres
}

export const DISTRICTS: Record<string, DistrictCoords> = {
  old_tbilisi: { latitude: 41.6917, longitude: 44.8025, radius: 1500 },
  vake: { latitude: 41.7190, longitude: 44.7795, radius: 2000 },
  saburtalo: { latitude: 41.7420, longitude: 44.7823, radius: 2000 },
  gldani: { latitude: 41.7900, longitude: 44.8240, radius: 2500 },
  isani: { latitude: 41.6878, longitude: 44.8236, radius: 1500 },
  nadzaladevi: { latitude: 41.7518, longitude: 44.7878, radius: 1500 },
  didube: { latitude: 41.7586, longitude: 44.7998, radius: 1500 },
  krtsanisi: { latitude: 41.6731, longitude: 44.8139, radius: 1500 },
  mtatsminda: { latitude: 41.6955, longitude: 44.7970, radius: 1200 },
  chugureti: { latitude: 41.7062, longitude: 44.7912, radius: 1200 },
};

export const TBILISI_DEFAULT: DistrictCoords = {
  latitude: 41.7151,
  longitude: 44.8271,
  radius: 5000,
};

export function getDistrict(name?: string | null): DistrictCoords {
  if (name && name in DISTRICTS) {
    return DISTRICTS[name]!;
  }
  return TBILISI_DEFAULT;
}
