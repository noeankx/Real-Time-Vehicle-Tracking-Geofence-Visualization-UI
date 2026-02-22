/**
 * Mock Data for the Vehicle Tracking System simulation.
 */

export const MOCK_GEOFENCES = [
  {
    id: 'office-1',
    name: 'Main HQ Office',
    type: 'office',
    center: [12.9716, 77.5946], // Bangalore coordinates
    radius: 500, // meters
    color: '#3b82f6', // blue
  },
  {
    id: 'office-2',
    name: 'Tech Park Branch',
    type: 'office',
    center: [12.9279, 77.6271],
    radius: 400,
    color: '#3b82f6',
  },
  {
    id: 'pickup-1',
    name: 'HSR Layout Stop',
    type: 'pickup',
    center: [12.9141, 77.6411],
    radius: 100,
    color: '#f97316', // orange
    employee: 'Rahul Sharma',
  },
  {
    id: 'pickup-2',
    name: 'Indiranagar Stop',
    type: 'pickup',
    center: [12.9784, 77.6408],
    radius: 100,
    color: '#f97316',
    employee: 'Priya Verma',
  }
];

export const MOCK_VEHICLES = [
  {
    tripId: 'TRP-1001',
    driver: 'Amit Kumar',
    status: 'in-progress',
    position: [12.9100, 77.6400],
    speed: 45,
    eta: '10 mins',
    route: [
      [12.9100, 77.6400],
      [12.9141, 77.6411],
      [12.9250, 77.6350],
      [12.9716, 77.5946]
    ],
    completedRoute: [[12.9100, 77.6400]],
  },
  {
    tripId: 'TRP-1002',
    driver: 'Suresh Singh',
    status: 'delayed',
    position: [12.9700, 77.6400],
    speed: 20,
    eta: '25 mins',
    route: [
      [12.9700, 77.6400],
      [12.9784, 77.6408],
      [12.9279, 77.6271]
    ],
    completedRoute: [[12.9700, 77.6400]],
  }
];
