/**
 * Reference data for products in the demo catalog, used to keep tests
 * independent of hard-coded strings scattered across spec files.
 */
export const Products = {
  solarSystemColorImager: {
    id: '0PUK6V6EV0',
    name: 'Solar System Color Imager',
    price: '$ 175.00',
  },
  nationalParkExplorascope: {
    id: 'OLJCESPC7Z',
    name: 'National Park Foundation Explorascope',
    price: '$ 101.96',
  },
} as const;
