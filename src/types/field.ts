export type GeographicCoordinate = {
  latitude: number;
  longitude: number;
};

export type Field = {
  id: string;
  name: string;
  boundary: GeographicCoordinate[];
};
