import express from 'express';
const router = express.Router();

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

export default (db) => {
    router.post('/visited', ensureAuthenticated, async (req, res) => {
        const { country_code } = req.body;
        const user_id = req.user.id;
        try{
            await db.query("INSERT INTO visited_countries (user_id, country_code) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [user_id,country_code]);
            res.json({success: true, message: 'Country marked as visited'});
        }catch(err){
            console.error('Error marking country as visited:', err);
            res.status(500).send('Error marking country as visited');
        }
    });
      // Add to wishlist
  router.post("/wishlist", ensureAuthenticated, async (req, res) => {
    const { country_code } = req.body;
    const user_id = req.user.id;
    try {
      await db.query(
        "INSERT INTO wishlist (user_id, country_code) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [user_id, country_code]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // Add or update note
  router.post("/note", ensureAuthenticated, async (req, res) => {
    const { country_code, note } = req.body;
    const user_id = req.user.id;
    try {
      await db.query(
        "INSERT INTO notes (user_id, country_code, note) VALUES ($1, $2, $3) ON CONFLICT (user_id, country_code) DO UPDATE SET note = $3, created_at = CURRENT_TIMESTAMP",
        [user_id, country_code, note]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  return router;
};
