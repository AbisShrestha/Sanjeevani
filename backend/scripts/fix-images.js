const pool = require('../src/config/db');

const fixImages = async () => {
  console.log('Replacing old ngrok URLs with relative paths...');
  try {
    const ngrokUrl = 'https://stylolitic-brenden-pseudoperipteral.ngrok-free.dev/';
    
    // Fix medicines
    const res1 = await pool.query(
      `UPDATE medicines SET imageurl = REPLACE(imageurl, $1, '') WHERE imageurl LIKE $2`,
      [ngrokUrl, ngrokUrl + '%']
    );
    console.log(`✅ Fixed ${res1.rowCount} medicines images`);

    // Fix users
    const res2 = await pool.query(
      `UPDATE users SET profileimage = REPLACE(profileimage, $1, '') WHERE profileimage LIKE $2`,
      [ngrokUrl, ngrokUrl + '%']
    );
    console.log(`✅ Fixed ${res2.rowCount} users profile images`);

    // Fix doctors
    const res3 = await pool.query(
      `UPDATE doctors SET image = REPLACE(image, $1, '') WHERE image LIKE $2`,
      [ngrokUrl, ngrokUrl + '%']
    );
    console.log(`✅ Fixed ${res3.rowCount} doctors images`);

    console.log('Image paths updated to relative paths successfully.');
  } catch (err) {
    console.error('Error fixing images:', err);
  } finally {
    await pool.end();
  }
};

fixImages();
