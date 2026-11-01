// The Japan 2023 post's travel log and spending, from the mockup's post.html.

export type Day = [when: string, place: string, acts: string[]];

// Day by day, as written in the post, except that the headings on days 8, 10 and 13 now match their activities.
export const DAYS: Day[] = [
  ["Oct 22", "Tokyo", ["Arrive at Haneda Airport", "Due to unfortunate delays and circumstances get stuck at airport till next day."]],
  ["Oct 23", "Osaka", ["Early morning departure with shinkansen from Haneda Airport to Osaka station", "Settle into Osaka Airbnb late afternoon", "Explore the nearby Shinsaibashi Shopping Street"]],
  ["Oct 24", "Nara", ["Nara Park", "Stroll through Dotonbori"]],
  ["Oct 25", "Osaka", ["Explore the nearby Tempozan Ferris Wheel and take in the views of Osaka Bay", "Visit the Osaka Aquarium"]],
  ["Oct 26", "Kyoto", ["Shinkansen to Kyoto for Fushimi Inari Taisha shrines", "Higashiyama district", "Kiyomizudera temple"]],
  ["Oct 27", "Kyoto", ["Shinkansen to Kyoto for Arashiyama Bamboo Forest", "Arashiyama Monkey Park"]],
  ["Oct 28", "Tokyo", ["Early morning Shinkansen ride from Osaka station to Shinagawa station (Tokyo)", "Stroll through Kabukicho"]],
  ["Oct 29", "Tokyo", ["Head to Shibuya Crossing", "Visit Hachiko statue", "Spend night time bar hopping in Shibuya"]],
  ["Oct 30", "Tokyo", ["Start day with a visit to Asakusa", "Explore Nakamise Shopping Street", "Halloween Costume shopping"]],
  ["Oct 31", "Tokyo", ["Walk around Shibuya early afternoon", "Halloween in Shinjuku", "Clubbing in Shibuya"]],
  ["Nov 1", "Tokyo", ["Nakano broadway", "Akihabara", "Visit the arcades and play some crane games", "Shinjuku"]],
  ["Nov 2", "Tokyo", ["Explore Ikebukuro Sunshine City for cosplay event", "Visit Harajuku and Takeshita street"]],
  ["Nov 3", "Nikko", ["Take a day trip to Nikko", "Visit Toshogu Shrine, Kegon Falls, and Lake Chuzenji"]],
  ["Nov 4", "Tokyo", ["Visit Tsukiji fish market", "Explore teamLabs Planet museum", "Souvenir gift shopping"]],
  ["Nov 5", "Tokyo", ["Early morning departure to Haneda airport from Tokyo Airbnb", "Last minute gift shopping at Don Quijote in Roppongi"]],
];

// Percentages from the post's pie chart, largest first, with "Other" last.
export const SPEND: [name: string, pct: number][] = [
  ["Flight", 45.9], ["Accommodation", 22.6], ["JR Rail Pass", 7.4], ["Food", 7.3], ["Entertainment", 3.1],
  ["Souvenirs", 3.1], ["Konbini", 2.9], ["Uber (Taxi)", 1.9], ["Trains", 1.5], ["Other", 4.4],
];
