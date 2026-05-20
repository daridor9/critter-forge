export interface RealAnimal {
  name: string;
  emoji: string;
  massKg: number;
  topSpeedKmh: number;
  enduranceKm: number;
  lifespanYears: number;
  foodKgPerDay: number;
  fact: string;
}

export const realAnimals: RealAnimal[] = [
  {
    name: 'Cheetah',
    emoji: '🐆',
    massKg: 50,
    topSpeedKmh: 110,
    enduranceKm: 0.5,
    lifespanYears: 12,
    foodKgPerDay: 3,
    fact: 'Fastest sprinter on land — but holds top speed for ~30 seconds before overheating.',
  },
  {
    name: 'Wolf',
    emoji: '🐺',
    massKg: 40,
    topSpeedKmh: 65,
    enduranceKm: 50,
    lifespanYears: 8,
    foodKgPerDay: 2.5,
    fact: 'Trades sprint for stamina — trots all day, exhausting prey rather than out-sprinting them.',
  },
  {
    name: 'Elephant',
    emoji: '🐘',
    massKg: 4000,
    topSpeedKmh: 40,
    enduranceKm: 80,
    lifespanYears: 65,
    foodKgPerDay: 150,
    fact: 'Long life because metabolism per kg is low — but must eat 18 hours a day.',
  },
  {
    name: 'Mouse',
    emoji: '🐭',
    massKg: 0.025,
    topSpeedKmh: 13,
    enduranceKm: 0.5,
    lifespanYears: 2,
    foodKgPerDay: 0.005,
    fact: 'Heart beats ~600 times a minute. Same total heartbeats as a whale, packed into 2 years.',
  },
  {
    name: 'Hummingbird',
    emoji: '🐦',
    massKg: 0.004,
    topSpeedKmh: 50,
    enduranceKm: 1,
    lifespanYears: 5,
    foodKgPerDay: 0.005,
    fact: 'Eats its own body weight in nectar every day to fuel hovering flight.',
  },
];
