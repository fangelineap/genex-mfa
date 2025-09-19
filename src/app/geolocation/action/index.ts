function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(val: number) {
  return (val * Math.PI) / 180;
}

export { haversine, toRad };
