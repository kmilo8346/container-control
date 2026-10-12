import { imageUrls } from './image-urls.js';
export const paintings = [
  ['mona-lisa', 'Mona Lisa', 'Leonardo da Vinci'],
  ['pearl-earring', 'Girl with a Pearl Earring', 'Johannes Vermeer'],
  ['great-wave', 'The Great Wave', 'Katsushika Hokusai'],
  ['starry-night', 'The Starry Night', 'Vincent van Gogh'],
  ['scream', 'The Scream', 'Edvard Munch'],
  ['kiss', 'The Kiss', 'Gustav Klimt'],
  ['venus', 'The Birth of Venus', 'Sandro Botticelli'],
  ['american-gothic', 'American Gothic', 'Grant Wood'],
  ['water-lilies', 'Water Lilies', 'Claude Monet'],
  ['night-watch', 'The Night Watch', 'Rembrandt'],
].map(([id, title, artist], index) => ({ id, title, artist, imageUrl: process.env[`PAINTING_URL_${id.replaceAll('-', '_').toUpperCase()}`] ?? imageUrls[id], image: '/paintings/gallery-thumbnails.png', imagePosition: `${(index % 5) * 25}% ${Math.floor(index / 5) * 100}%` }));
