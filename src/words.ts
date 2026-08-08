export const PUZZLES = [
  // 3 letters
  { word: "SUN", hint: "It shines in the sky during the day" },
  { word: "CAT", hint: "A popular pet that meows" },
  { word: "DOG", hint: "A popular pet that barks" },
  { word: "PEN", hint: "You use this to write with ink" },
  { word: "CUP", hint: "You drink tea or coffee from this" },
  { word: "BED", hint: "You sleep on this" },
  { word: "ICE", hint: "Frozen water" },
  { word: "HAT", hint: "You wear this on your head" },
  { word: "CAR", hint: "You drive it on the road" },

  // 4 letters
  { word: "MOON", hint: "You see this in the night sky" },
  { word: "STAR", hint: "Twinkles in the night sky" },
  { word: "FISH", hint: "An animal that lives in water" },
  { word: "BIRD", hint: "An animal that can fly" },
  { word: "TREE", hint: "It has leaves and branches" },
  { word: "FIRE", hint: "It is hot and burns" },
  { word: "MILK", hint: "A white drink from cows" },
  { word: "BALL", hint: "You throw or kick this" },
  { word: "SHOE", hint: "You wear this on your foot" },
  { word: "DOOR", hint: "You open this to enter a room" },
  { word: "RAIN", hint: "Water that falls from the sky" },
  { word: "WIND", hint: "Moving air" },
  { word: "SAND", hint: "You find this at the beach" },
  { word: "DESK", hint: "You sit at this to study" },
  { word: "DUCK", hint: "A bird that quacks" },
  { word: "FROG", hint: "A green animal that jumps" },
  { word: "SNOW", hint: "White and cold from the winter sky" },
  { word: "BOOK", hint: "It has pages and you read it" },

  // 5 letters
  { word: "APPLE", hint: "A sweet red or green fruit" },
  { word: "WATER", hint: "You drink this when you are thirsty" },
  { word: "HOUSE", hint: "A place where people live" },
  { word: "GRASS", hint: "Green plants covering the ground" },
  { word: "CLOUD", hint: "White or gray fluff in the sky" },
  { word: "SMILE", hint: "What you do with your mouth when you are happy" },
  { word: "TRAIN", hint: "It moves on tracks and goes choo-choo" },
  { word: "PLANE", hint: "It flies high in the sky with passengers" },
  { word: "TIGER", hint: "A big wild cat with orange and black stripes" },
  { word: "RIVER", hint: "A natural flowing watercourse" },
  { word: "OCEAN", hint: "A vast body of salt water" },
  { word: "CHAIR", hint: "Something you sit on" },
  { word: "TABLE", hint: "You place your food on this to eat" },
  { word: "SHOES", hint: "You wear these on your feet" },
  { word: "SHIRT", hint: "Clothing you wear on your upper body" },
  { word: "GREEN", hint: "The color of grass and leaves" },
  { word: "BLACK", hint: "The color of the night sky without stars" },
  { word: "HAPPY", hint: "How you feel when you smile" },
  
  // 6 letters
  { word: "SCHOOL", hint: "A place where children go to learn" },
  { word: "PENCIL", hint: "You use this to write or draw" },
  { word: "MONKEY", hint: "An animal that loves swinging from trees" },
  { word: "YELLOW", hint: "The color of the sun and lemons" },
  { word: "ORANGE", hint: "A citrus fruit and its color" },
  { word: "PURPLE", hint: "The color of grapes and eggplants" },
  { word: "PLANET", hint: "A large object that orbits a star" }
];

const recentPuzzles: string[] = [];

export function getPuzzleForLevel(level: number) {
  let targetLength = 3;
  if (level > 3 && level <= 8) targetLength = 4;
  else if (level > 8 && level <= 15) targetLength = 5;
  else if (level > 15) targetLength = 6;

  let validPuzzles = PUZZLES.filter(p => p.word.length === targetLength);
  
  if (validPuzzles.length === 0) validPuzzles = PUZZLES;

  const maxRecent = Math.floor(validPuzzles.length / 2);
  let index;
  let attempts = 0;
  
  do {
    index = Math.floor(Math.random() * validPuzzles.length);
    attempts++;
  } while (recentPuzzles.includes(validPuzzles[index].word) && attempts < 20);

  recentPuzzles.push(validPuzzles[index].word);
  if (recentPuzzles.length > 20) {
    recentPuzzles.shift();
  }

  return validPuzzles[index];
}

export function getJumbledLetters(word: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let extras = "";
  for (let i = 0; i < 5; i++) {
    extras += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return (word + extras).split('').sort(() => 0.5 - Math.random()).join('');
}
