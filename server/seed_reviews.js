import sqlite3pkg from 'sqlite3';
const { Database } = sqlite3pkg;
const db = new Database('./database.sqlite');

const reviews = [
  { name: 'Josephine A.', rating: 5, comment: 'Amazing teeth cleaning! Very professional team, and the treatment room is super clean. Will definitely return.' },
  { name: 'Emeka O.', rating: 5, comment: 'Got my wisdom teeth extracted. Virtually painless and they explained the whole after-care process clearly!' },
  { name: 'Sarah K.', rating: 4, comment: 'Great clinic on Ring Road. The staff is polite, and they accept appointment times accurately. Clean setup.' },
  { name: 'Oluwaseun T.', rating: 5, comment: 'Love their orthodontics service! Got self-ligating braces and the follow-ups have been very smooth.' },
  { name: 'David M.', rating: 5, comment: 'Professional scaling and polishing. They made me feel so relaxed since I usually have dental anxiety.' },
  { name: 'Samaritan Joe.', rating: 4, comment: 'High quality fillings. Service was fast and very reasonable prices. Highly recommended!' }
];

db.serialize(() => {
  db.run('DELETE FROM reviews');

  const stmt = db.prepare('INSERT INTO reviews (name, rating, comment, is_approved) VALUES (?, ?, ?, 1)');

  reviews.forEach(review => {
    stmt.run(review.name, review.rating, review.comment);
  });

  stmt.finalize(() => {
    console.log('✅ Successfully seeded 6 approved reviews.');
    db.close();
  });
});
